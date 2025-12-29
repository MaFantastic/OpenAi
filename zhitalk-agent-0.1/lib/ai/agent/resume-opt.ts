import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { systemPrompt, type RequestHints } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import type { ChatMessage } from "@/lib/ai/agent/classify";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

type CreateResumeOptParams = {
  messages: ChatMessage[];
  selectedChatModel?: string;
  requestHints?: RequestHints;
  session?: any;
  chatId?: string;
  streamId?: string;
};

function findResumeText(messages: ChatMessage[]): string | null {
  const joined = messages.map((m) => m.content || "").join("\n\n");
  // 简单判定：包含“简历”关键词或长度较长的文本则视为简历内容
  if (/\b(简历|resume|cv)\b/i.test(joined)) {
    return joined;
  }

  // 长文本也可能是粘贴的简历（阈值可后续调整）
  if (joined.replace(/\s+/g, "").length > 200) {
    return joined;
  }

  return null;
}

export async function createResumeOptStream(params: CreateResumeOptParams) {
  const {
    messages,
    selectedChatModel = DEFAULT_CHAT_MODEL,
    requestHints = { latitude: "", longitude: "", city: "", country: "" },
  } = params;

  const resumeText = findResumeText(messages);

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const userPrompt = resumeText
        ? `请基于下面的简历文本进行优化。请输出（1）一句简短总结，说明改进要点；（2）最多三条可执行的改进建议；（3）优化后的简历文本。请使用中文。\n\n简历内容：\n${resumeText}`
        : `看起来您还没有把简历文本发过来。请直接把简历的完整文本粘贴到聊天中，我会帮您进行优化。`;

      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel, requestHints }),
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        stopWhen: stepCountIs(6),
        experimental_transform: smoothStream({ chunking: "word" }),
        experimental_telemetry: {
          isEnabled: false,
          functionId: "resume-opt-stream",
        },
      });

      // 启动消费流并把结果转为 UI 流
      result.consumeStream();
      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: false,
        })
      );
    },
    generateId: () => `resume-${Date.now()}`,
    onFinish: async () => {
      /* 简化：不在此持久化消息，留给调用方处理 */
    },
    onError: () => {
      return "抱歉，处理简历时发生了错误。";
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}

export default createResumeOptStream;

