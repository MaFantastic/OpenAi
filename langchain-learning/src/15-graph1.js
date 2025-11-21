/* 写一个 LangGraph 面向对象API的例子，使用 StateGraph 实现一个简单的计算器 */
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { MessagesZodMeta, StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { SystemMessage, HumanMessage, isAIMessage, BaseMessage } from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid';

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// Define tools
const add = tool(({ a, b }) => a + b, {
  name: 'add',
  description: 'Add two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

const multiply = tool(({ a, b }) => a * b, {
  name: 'multiply',
  description: 'Multiply two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

const divide = tool(({ a, b }) => a / b, {
  name: 'divide',
  description: 'Divide two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

// Augment the LLM with tools
const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
}
const tools = Object.values(toolsByName)
const modelWithTools = llm.bindTools(tools)
const MessagesState = z.object({
  messages: z
    .array(z.custom())
    .register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
});

async function llmCall(state) {
  const newMessages = await modelWithTools.invoke([
    new SystemMessage(
      'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
    ),
    ...state.messages,
  ])

  const newLlmCalls = (state.llmCalls ?? 0) + 1
  return {
    messages: newMessages,
    llmCalls: newLlmCalls,
  }
}

async function toolNode(state) {
  const lastMessage = state.messages.at(-1)

  if (lastMessage == null || !isAIMessage(lastMessage)) {
    return { messages: [] }
  }

  const result = []
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name]
    const observation = await tool.invoke(toolCall)
    result.push(observation)
  }

  return { messages: result }
}

async function shouldContinue(state) {
  const lastMessage = state.messages.at(-1)
  if (lastMessage == null || !isAIMessage(lastMessage)) return END

  // If the LLM makes a tool call, then perform an action
  if (lastMessage.tool_calls?.length) {
    return 'toolNode'
  }

  // Otherwise, we stop (reply to the user)
  return END
}

const graph = new StateGraph(MessagesState)
  .addNode('llmCall', llmCall)
  .addNode('toolNode', toolNode)
  .addEdge(START, 'llmCall')
  .addConditionalEdges('llmCall', shouldContinue, ['toolNode', END])
  .addEdge('toolNode', 'llmCall')

// 使用 MemorySaver 持久化聊天记录
const memory = new MemorySaver();
const agent = graph.compile({ checkpointer: memory });

const config = { configurable: { thread_id: uuidv4() } };

async function chat(input) {
  // 每次只传入新消息，历史消息由 MemorySaver 自动管理
  const result = await agent.invoke({ messages: [new HumanMessage(input)] }, config);
  for (const message of result.messages) {
    console.log(`[${message.getType()}]: ${message.text}`);
  }
}

// 示例：连续对话
await chat('Add 3 and 4.');
await chat('Multiply the result by 2.');