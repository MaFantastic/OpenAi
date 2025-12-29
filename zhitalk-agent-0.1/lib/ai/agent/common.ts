import type { AppUsage } from "@/lib/usage";

export function makeStreamOnFinishHandler(params: {
  myProvider: any;
  selectedChatModel: string;
  dataStream: { write: (arg: any) => void };
  getTokenlensCatalog: () => Promise<any>;
  getUsage: (args: { modelId: string; usage: any; providers: any }) => any;
  setFinalMergedUsage: (u: AppUsage | undefined) => void;
}) {
  return async ({ usage }: { usage: any }) => {
    try {
      const providers = await params.getTokenlensCatalog();
      const modelId = params.myProvider
        .languageModel(params.selectedChatModel).modelId;

      if (!modelId) {
        params.setFinalMergedUsage(usage);
        params.dataStream.write({ type: "data-usage", data: usage });
        return;
      }

      if (!providers) {
        params.setFinalMergedUsage(usage);
        params.dataStream.write({ type: "data-usage", data: usage });
        return;
      }

      const summary = params.getUsage({ modelId, usage, providers });
      const finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;
      params.setFinalMergedUsage(finalMergedUsage);
      params.dataStream.write({ type: "data-usage", data: finalMergedUsage });
    } catch (err) {
      console.warn("TokenLens enrichment failed", err);
      params.setFinalMergedUsage(usage);
      params.dataStream.write({ type: "data-usage", data: usage });
    }
  };
}

import { streamText, stepCountIs, smoothStream, convertToModelMessages } from "ai";
import { systemPrompt } from "@/lib/ai/prompts";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { isProductionEnvironment } from "@/lib/constants";

export function createStreamTextResult(params: {
  myProvider: any;
  selectedChatModel: string;
  requestHints: any;
  uiMessages: any;
  session: any;
  dataStream: any;
  getTokenlensCatalog: () => Promise<any>;
  getUsage: (args: { modelId: string; usage: any; providers: any }) => any;
  setFinalMergedUsage: (u: AppUsage | undefined) => void;
}) {
  return streamText({
    model: params.myProvider.languageModel(params.selectedChatModel),
    system: systemPrompt({
      selectedChatModel: params.selectedChatModel,
      requestHints: params.requestHints,
    }),
    messages: convertToModelMessages(params.uiMessages),
    stopWhen: stepCountIs(5),
    experimental_activeTools:
      params.selectedChatModel === "chat-model-reasoning"
        ? []
        : ["getWeather", "createDocument", "updateDocument", "requestSuggestions"],
    experimental_transform: smoothStream({ chunking: "word" }),
    tools: {
      getWeather,
      createDocument: createDocument({ session: params.session, dataStream: params.dataStream }),
      updateDocument: updateDocument({ session: params.session, dataStream: params.dataStream }),
      requestSuggestions: requestSuggestions({ session: params.session, dataStream: params.dataStream }),
    },
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: "stream-text",
    },
    onFinish: makeStreamOnFinishHandler({
      myProvider: params.myProvider,
      selectedChatModel: params.selectedChatModel,
      dataStream: params.dataStream,
      getTokenlensCatalog: params.getTokenlensCatalog,
      getUsage: params.getUsage,
      setFinalMergedUsage: params.setFinalMergedUsage,
    }),
  });
}


