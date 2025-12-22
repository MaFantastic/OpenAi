import { MessagesAnnotation } from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { getModel } from "./model";
import { systemPrompt } from "./prompt";

export async function callModel(state: typeof MessagesAnnotation.State) {
  const model = getModel();
  let messages = state.messages || [];
  if (messages.length === 0 || !(messages[0] instanceof SystemMessage)) {
    messages = [systemPrompt, ...messages];
  }
  const response = await model.invoke(messages);
  return {
    messages: [response],
  };
}


