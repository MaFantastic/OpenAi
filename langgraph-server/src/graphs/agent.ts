import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { callModel } from "./callModel";
import { toolsNode } from "./toolNode";
import { AIMessage } from "@langchain/core/messages";

// 定义路由函数，决定下一步操作
function routeModelOutput(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  // 如果最后一条消息有工具调用，则执行工具
  if (
    lastMessage instanceof AIMessage &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }
  // 否则结束
  return "__end__";
}

// 创建图（仅保留 workflow 定义）
const workflow = new StateGraph(MessagesAnnotation)
  // 定义两个节点，在它们之间循环
  .addNode("callModel", callModel)
  .addNode("tools", toolsNode)
  // 设置入口点为 `callModel`
  // 这意味着这个节点是第一个被调用的
  .addEdge("__start__", "callModel")
  .addConditionalEdges(
    "callModel",
    routeModelOutput,
    {
      tools: "tools",
      __end__: "__end__",
    }
  )
  .addEdge("tools", "callModel");

// 编译图
const app = workflow.compile();

export { app };

