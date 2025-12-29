// AI workflow 节点：接受 messages，返回结构化分类结果（resume_opt / mock_interview / related_topics / others）
export type ChatMessage = {
  role: string;
  content: string;
};

export type ClassificationResult = {
  resume_opt: boolean;
  mock_interview: boolean;
  related_topics: boolean;
  others: boolean;
  note?: string;
};

export const SYSTEM_PROMPT = `你是一个互联网大公司的资深程序员和面试官，尤其擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。

请根据用户输入的内容，判断用户属于哪一种情况？按说明输出 JSON 格式。`;

const MODEL_QUESTION_REPLY =
  "您好，我是运行在default模型上的AI助手，很高兴在Cursor IDE中为您提供帮助，你可以直接告诉我你的具体需求。";

function normalizeText(messages: ChatMessage[]) {
  return messages.map((m) => m.content).join(" ").toLowerCase();
}

function isModelOrWhoQuestion(text: string) {
  // 捕获类似：“是什么模型”、“哪个模型”、“你是谁”、“你是谁?” 等询问
  return /\b(是什么模型|哪个模型|哪一个模型|你是谁|你是谁|是谁)\b/.test(text);
}

export async function classifyMessages(
  messages: ChatMessage[]
): Promise<ClassificationResult> {
  const text = normalizeText(messages);

  if (isModelOrWhoQuestion(text)) {
    return {
      resume_opt: false,
      mock_interview: false,
      related_topics: false,
      others: false,
      note: MODEL_QUESTION_REPLY,
    };
  }

  // 简单关键词匹配策略（可替换为调用实际模型的逻辑）
  const resumeKeywords = ["简历", "简历优化", "简历建议", "简历修改", "优化简历"];
  const interviewKeywords = ["面试", "模拟面试", "面试题", "面试官", "面试准备"];
  const relatedKeywords = [
    "编程",
    "前端",
    "react",
    "vue",
    "javascript",
    "typescript",
    "算法",
    "工程师",
  ];

  const includesAny = (kw: string[]) => kw.some((k) => text.includes(k));

  const result: ClassificationResult = {
    resume_opt: includesAny(resumeKeywords),
    mock_interview: includesAny(interviewKeywords),
    related_topics: includesAny(relatedKeywords),
    others:
      !includesAny(resumeKeywords) &&
      !includesAny(interviewKeywords) &&
      !includesAny(relatedKeywords),
  };

  return result;
}

 
