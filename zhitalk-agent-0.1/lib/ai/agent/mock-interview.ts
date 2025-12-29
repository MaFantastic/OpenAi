import {
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

type CreateMockInterviewParams = {
  messages: ChatMessage[];
  selectedChatModel?: string;
  requestHints?: RequestHints;
  session?: any;
  chatId?: string;
  streamId?: string;
};

function findTopic(messages: ChatMessage[]): string | null {
  const joined = messages.map((m) => m.content || "").join("\n\n");
  if (/\b(面试|interview|算法|系统设计|前端|后端|全栈)\b/i.test(joined)) {
    return joined;
  }
  // 如果没有明确主题但用户发了较长内容，也当做上下文
  if (joined.replace(/\s+/g, "").length > 100) {
    return joined;
  }
  return null;
}

export async function createMockInterviewStream(params: CreateMockInterviewParams) {
  const {
    messages,
    selectedChatModel = DEFAULT_CHAT_MODEL,
    requestHints = { latitude: "", longitude: "", city: "", country: "" },
  } = params;

  const topic = findTopic(messages);

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const userPrompt = topic
        ? `我们现在做一个简洁的程序员模拟面试。请你作为面试官按以下格式输出（全部中文）：
- 提出 1 个与候选人背景相关的技术问题（简洁）
- 等待候选人回答（在这个流中先给出问题）
- 在后续回复中，对候选人的回答给出简短评分与1-2条可执行的改进建议

请基于以下上下文决定问题或方向：\n\n${topic}`
        : `我们现在做一个简洁的程序员模拟面试。请先问一个简洁的技术问题（例如算法或前端相关），并说明等待用户回答。`;

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
          functionId: "mock-interview-stream",
        },
      });

      result.consumeStream();
      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: false,
        })
      );
    },
    generateId: () => `mock-interview-${Date.now()}`,
    onFinish: async () => {
      /* 简化：不在此持久化消息，留给调用方处理 */
    },
    onError: () => {
      return "抱歉，模拟面试过程中发生错误。";
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}

export default createMockInterviewStream;
