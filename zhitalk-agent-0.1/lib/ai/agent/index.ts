import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { unstable_cache as cache } from "next/cache";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { myProvider } from "@/lib/ai/providers";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { classifyMessages } from "@/lib/ai/agent/classify";
import createResumeOptStream from "@/lib/ai/agent/resume-opt";
import createMockInterviewStream from "@/lib/ai/agent/mock-interview";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import { createStreamTextResult } from "./common";
import {
  createStreamId,
  getChatById,
  getMessagesByChatId,
  saveMessages,
  updateChatLastContextById,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { generateUUID, convertToUIMessages } from "@/lib/utils";

let globalStreamContext: ResumableStreamContext | null = null;

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn(
        "TokenLens: catalog fetch failed, using default catalog",
        err
      );
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function createChatStream(params: {
  uiMessages: ChatMessage[];
  selectedChatModel: string;
  requestHints: RequestHints;
  session: any;
  chatId: string;
  streamId: string;
}) {
  const { uiMessages, selectedChatModel, requestHints, session, chatId } =
    params;

  // 先做分类分发：如果是简历优化/模拟面试，直接调用对应的 stream 实现并返回其 Response
  try {
    const classification = await classifyMessages(
      // classify 的类型与 uiMessages 大致兼容（role, content）
      uiMessages as any
    );

    if (classification.resume_opt) {
      return await createResumeOptStream({
        messages: uiMessages as any,
        selectedChatModel,
        requestHints,
        session,
        chatId,
        streamId: params.streamId,
      });
    }

    if (classification.mock_interview) {
      return await createMockInterviewStream({
        messages: uiMessages as any,
        selectedChatModel,
        requestHints,
        session,
        chatId,
        streamId: params.streamId,
      });
    }
  } catch (err) {
    console.warn("Classification failed, falling back to default stream", err);
    // 继续走默认逻辑
  }

  let finalMergedUsage: AppUsage | undefined;

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      
      const result = createStreamTextResult({
        myProvider,
        selectedChatModel,
        requestHints,
        uiMessages,
        session,
        dataStream,
        getTokenlensCatalog,
        getUsage,
        setFinalMergedUsage: (v) => (finalMergedUsage = v),
      });

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    generateId: generateUUID,
    onFinish: async ({ messages }) => {
      await saveMessages({
        messages: messages.map((currentMessage) => ({
          id: currentMessage.id,
          role: currentMessage.role,
          parts: currentMessage.parts,
          createdAt: new Date(),
          attachments: [],
          chatId,
        })),
      });

      if (finalMergedUsage) {
        try {
          await updateChatLastContextById({
            chatId,
            context: finalMergedUsage,
          });
        } catch (err) {
          console.warn("Unable to persist last usage for chat", chatId, err);
        }
      }
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  // const streamContext = getStreamContext();
  //
  // if (streamContext) {
  //   return new Response(
  //     await streamContext.resumableStream(params.streamId, () =>
  //       stream.pipeThrough(new JsonToSseTransformStream())
  //     )
  //   );
  // }

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}


