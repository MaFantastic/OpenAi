import { MessagesAnnotation } from "@langchain/langgraph";
import { SystemMessage, AIMessage, isBaseMessage, HumanMessage } from "@langchain/core/messages";
import { getModel } from "./model";
import { systemPrompt } from "./prompt";

// 处理 PDF 文件的节点：如果最后一条消息包含 PDF（base64），提取并把 file 类型替换为 text
export async function pdfHandler(state: typeof MessagesAnnotation.State) {
  const messages = state.messages || [];
  // 不修改原 messages，生成新的 messages 副本 newMessages：过滤掉所有 content 中 type === "file" 的项
  const pdfs: any[] = [];
  // 简要日志：记录包含 file 项的消息索引与概览（避免打印完整 base64）
  messages.forEach((msg: any, idx: number) => {
    const contentArray = Array.isArray(msg.content)
      ? msg.content
      : msg.content != null
      ? [msg.content]
      : [];
    const hasFile = contentArray.some((it: any) => it && it.type === "file");
    if (hasFile) {
      try {
        const overview = contentArray.map((it: any) => {
          if (!it || typeof it !== "object") return it;
          return {
            type: it.type,
            filename: it.metadata && (it.metadata.filename || it.metadata.fileName),
            mime: it.mime || it.mimeType || it.mime_type,
            source: it.source || it.sourceType || it.source_type,
            hasData: Boolean(it.data || it.dataString || it.base64),
          };
        });
        console.debug(`[pdfHandler] message[${idx}] contains file items:`, JSON.stringify(overview));
      } catch (e) {
        console.debug(`[pdfHandler] message[${idx}] contains file items (unable to stringify overview)`);
      }
    }
  });

  const newMessages = messages.map((msg: any) => {
    // 如果已经是 BaseMessage 且 content 为字符串，直接保留（避免重复封装）
    // 但如果 BaseMessage 的 content 为数组或非字符串，则需要规范化为字符串以便后续 coercion
    if (isBaseMessage(msg) && typeof (msg as any).content === "string") {
      return msg;
    }

    // 支持 msg.content 为数组或单值，统一为数组进行处理
    const contentArray = Array.isArray(msg.content)
      ? (msg.content as any[])
      : msg.content != null
      ? [msg.content]
      : [];

    // 将 file 类型项替换为 text 类型，避免传递 unknown variant 给 OpenAI
    const processedContent = contentArray.map((item: any) => {
      const isFile = item && item.type === "file";
      if (!isFile) return item;

      const isPdf =
        item &&
        (item.mimeType === "application/pdf" ||
          item.mime_type === "application/pdf" ||
          item.mime === "application/pdf");
      const isBase64 =
        item &&
        (item.source_type === "base64" ||
          item.sourceType === "base64" ||
          item.source === "base64");

      if (isPdf && isBase64) {
        const base64 = (item && (item.data || item.dataString || item.base64)) || "";
        const fileName = (item && item.metadata && (item.metadata.filename || item.metadata.fileName)) || "file.pdf";
        pdfs.push({
          filename: fileName,
          base64,
          text: null,
        });
        return { type: "text", text: `[PDF omitted: ${fileName}]` };
      }

      const fileName = (item && item.metadata && (item.metadata.filename || item.metadata.fileName)) || "file";
      const fallbackText = item && (item.text || item.content || item.description) ? (item.text || item.content || item.description) : null;
      return { type: "text", text: fallbackText || `[File omitted: ${fileName}]` };
    });

    // 保证后续处理时不出现 null/undefined
    const filteredContent = processedContent.map((it: any) => (it == null ? "" : it));

    // 将可能的数组内容规范化为字符串，避免将复杂结构传回给 langchain 的消息 coercion
    const normalizedTextParts = filteredContent.map((item: any) => {
      if (typeof item === "string") return item;
      if (item == null) return "";
      // 常见属性：text, content, data
      if (typeof item.text === "string") return item.text;
      if (typeof item.content === "string") return item.content;
      if (typeof item.data === "string") return item.data;
      // 如果是对象且有 'type' 和 'text' 等自描述字段，尝试提取
      if (typeof item === "object") {
        if (item.plainText && typeof item.plainText === "string") return item.plainText;
        if (item.description && typeof item.description === "string") return item.description;
      }
      // 最后降级为 JSON 字符串（尽量短）
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    });

    const normalizedContent = normalizedTextParts.join("\n").trim();

    // 返回一个保证 content 为字符串且可被 langchain 强制转换的对象
    return {
      ...(msg as any),
      content: normalizedContent || "",
    } as any;
  });
  // Ensure returned messages include an explicit role (or are BaseMessage instances).
  // This prevents langchain's coercion from receiving ambiguous objects and throwing
  // MESSAGE_COERCION_FAILURE when the object lacks a recognizable type/role.
  const normalizedForLangchain = newMessages.map((m: any) => {
    if (isBaseMessage(m)) return m;
    const role = (m && (m.role || m.sender || m.type) ? String(m.role || m.sender || m.type).toLowerCase() : "user");
    const content = m && (m.content ?? m.text) ? (m.content ?? m.text) : m;
    return { role, content };
  });

  return {
    messages: normalizedForLangchain,
    pdfs,
  };
}

export async function callModel(state: typeof MessagesAnnotation.State) {
  const model = getModel();
  // 优先运行 pdfHandler 将可能的 file 类型消息替换为 text 占位，避免向 OpenAI 发送 file 类型消息
  const pdfResult = await pdfHandler(state);
  const originalMessages = state.messages || [];
  const messagesFromPdf = (pdfResult && pdfResult.messages) || originalMessages;
  // 如果 pdfResult 中包含已提取的文本 (pdfs[].text)，将其拼接到 system prompt 中
  const pdfText =
    (pdfResult &&
      pdfResult.pdfs &&
      Array.isArray(pdfResult.pdfs) &&
      pdfResult.pdfs.map((p: any) => p && (p.text || "")).filter(Boolean).join("\n\n")) ||
    "";
  // 基于导出的默认 systemPrompt（可能来自 prompt.ts），构建最终的 SystemMessage 实例（如果有 PDF 内容则拼接）
  const baseSystemText = (systemPrompt && (systemPrompt as any).content) || "You are a helpful AI assistant";
  const finalSystemText = pdfText ? `${baseSystemText}\n\n---\nAttached PDF content (for context):\n${pdfText}` : baseSystemText;
  const systemPromptMessage = new SystemMessage(finalSystemText);
  const messagesWithSystem =
    messagesFromPdf.length === 0 || !(messagesFromPdf[0] instanceof SystemMessage)
      ? [systemPromptMessage, ...messagesFromPdf]
      : messagesFromPdf;

  // 再次清洗：确保没有残留的 top-level type === 'file' 或 content 内部的 file 项
  function sanitizeMessages(msgs: any[]) {
    return msgs.map((m: any, idx: number) => {
      if (!m || typeof m !== "object") return m;

      // 顶层 message 本身为 file 的情况
      if (m.type === "file") {
        const fileName = (m.metadata && (m.metadata.filename || m.metadata.fileName)) || "file";
        const content = m.content ?? m.text ?? `[File omitted: ${fileName}]`;
        console.error(`[sanitize] message[${idx}] top-level type=file -> converting to text; filename=${fileName}`);
        return { ...m, type: "text", content };
      }

      // content 为数组且包含 file 项的情况，逐项替换为 text
      if (Array.isArray(m.content)) {
        let changed = false;
        const newContent = m.content.map((it: any) => {
          if (it && it.type === "file") {
            changed = true;
            const fileName = (it.metadata && (it.metadata.filename || it.metadata.fileName)) || "file";
            console.error(`[sanitize] message[${idx}] contained file item -> converting to text; filename=${fileName}`);
            return { type: "text", text: it.text || it.content || `[File omitted: ${fileName}]` };
          }
          return it;
        });
        if (changed) {
          return { ...m, content: newContent };
        }
      }

      return m;
    });
  }

  const sanitizedMessages = sanitizeMessages(messagesWithSystem);

  // 将清洗后的消息转换为 LangChain 期望的 BaseMessage 实例
  function normalizeContentToString(content: any) {
    if (typeof content === "string") return content;
    if (content == null) return "";
    if (Array.isArray(content)) {
      return content
        .map((it) => {
          if (typeof it === "string") return it;
          if (it == null) return "";
          if (typeof it === "object") return it.text ?? it.content ?? JSON.stringify(it);
          return String(it);
        })
        .join("\n");
    }
    if (typeof content === "object") {
      return content.text ?? content.content ?? JSON.stringify(content);
    }
    return String(content);
  }

  const finalMessages = sanitizedMessages.map((m: any, idx: number) => {
    // 如果已经是 BaseMessage，按具体类型重建以确保 content 为字符串
    if (isBaseMessage(m)) {
      const contentStr = normalizeContentToString((m as any).content);
      if (m instanceof SystemMessage) return new SystemMessage(contentStr);
      if (m instanceof AIMessage) return new AIMessage({ content: contentStr } as any);
      // 其他 BaseMessage 类型都作为 HumanMessage 处理
      return new HumanMessage({ content: contentStr } as any);
    }

    // 普通对象：使用 role 或 type 来判断
    const rawContent = m && (m.content ?? m.text) ? (m.content ?? m.text) : m;
    const contentStr = normalizeContentToString(rawContent);
    const role = (m && (m.role || m.sender || m.type) ? String(m.role || m.sender || m.type).toLowerCase() : "");
    if (role === "system") return new SystemMessage(contentStr);
    if (role === "assistant" || role === "ai") return new AIMessage({ content: contentStr } as any);
    // 默认 user
    return new HumanMessage({ content: contentStr } as any);
  });

  try {
    console.error("[callModel] finalMessages (classes):", finalMessages.map((fm: any) => fm.constructor && fm.constructor.name));
  } catch {}

  // 为兼容底层模型客户端，构造简单的 { role, content } 数组作为输入
  const modelInput = finalMessages.map((fm: any) => {
    const content = (fm as any).content ?? "";
    const ctorName = fm && fm.constructor && fm.constructor.name;
    if (ctorName === "SystemMessage") return { role: "system", content };
    if (ctorName === "AIMessage" || ctorName === "ChatMessage" || ctorName === "AI") return { role: "assistant", content };
    // Default to user
    return { role: "user", content };
  });

  try {
    console.error("[callModel] invoking model with modelInput (summary):", (() => {
      try { return JSON.stringify(modelInput); } catch { return "[unable to stringify]"; }
    })());
  } catch {}

  let response: any;
  try {
    response = await model.invoke(modelInput);
    try {
      console.error("[callModel] model response (summary):", JSON.stringify(response));
    } catch {
      console.error("[callModel] model response (received, unable to stringify)");
    }
  } catch (err) {
    console.error("[callModel] model.invoke failed:", err);
    throw err;
  }

  // Ensure we return actual BaseMessage instances (AIMessage) so langgraph can coerce/store them.
  let responseMessage: any = response;
  if (!isBaseMessage(responseMessage)) {
    // Normalize response content to string to prevent MESSAGE_COERCION_FAILURE
    try {
      const raw = (response && (response.content ?? response.text)) ?? response;
      const contentStr = normalizeContentToString(raw);
      responseMessage = new AIMessage({ content: contentStr } as any);
    } catch (e) {
      // As a last resort, stringify the whole response
      const fallbackContent = (() => {
        try {
          return JSON.stringify(response);
        } catch {
          return String(response);
        }
      })();
      responseMessage = new AIMessage({ content: fallbackContent } as any);
    }
  }

  return {
    messages: [responseMessage],
  };
}


