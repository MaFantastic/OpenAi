import { SystemMessage } from "@langchain/core/messages";

// 构建全局 system prompt（可选地附加 PDF 内容）
export function buildSystemPrompt(pdfContent?: string) {
  const basePrompt =
    "You are a helpful AI assistant. Follow these rules:\n" +
    "- Provide concise, accurate answers based only on the provided context.\n" +
    "- When summarizing or extracting facts, rely on the provided documents and cite filenames when relevant.\n" +
    "- If information is missing from the provided content, say you don't know rather than invent details.\n" +
    "- Prefer clarity and short, actionable answers. Offer next steps if applicable.\n" +
    "- Do not output sensitive data from attachments unless explicitly asked and authorized.";

  const combined = pdfContent
    ? `${basePrompt}\n\n---\nAttached PDF content (for context):\n${pdfContent}`
    : basePrompt;

  return new SystemMessage(combined);
}

// 保留向后兼容的默认导出：不带 PDF 内容的 systemPrompt
export const systemPrompt = buildSystemPrompt();


