import { tool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import * as z from "zod";
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { task, entrypoint, addMessages, MemorySaver } from '@langchain/langgraph'
import { v4 as uuidv4 } from 'uuid';


const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
})

// Define tools
const add = tool(({ a, b }) => a + b, {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    }),
});

const multiply = tool(({ a, b }) => a * b, {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    }),
});

const divide = tool(({ a, b }) => a / b, {
    name: "divide",
    description: "Divide two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    }),
});

// Augment the LLM with tools
const toolsByName = {
    [add.name]: add,
    [multiply.name]: multiply,
    [divide.name]: divide,
}
const tools = Object.values(toolsByName)
const modelWithTools = llm.bindTools(tools)

const callModel = task({ name: 'callLlm' }, async (messages) => {
    return modelWithTools.invoke([
        new SystemMessage(
            'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
        ),
        ...messages,
    ])
})

const callTool = task({ name: 'callTool' }, async (toolCall) => {
    const tool = toolsByName[toolCall.name]
    return tool.invoke(toolCall)
})

// 使用 MemorySaver 持久化聊天记录
const memory = new MemorySaver();

const agent = entrypoint({ name: 'agent', checkpointer: memory }, async (messages) => {
    // 先调用 llm
    let modelResponse = await callModel(messages)

    // 一个无限循环
    while (true) {
        // 看是否需要 tool call
        if (!modelResponse.tool_calls?.length) {
            // 不需要则退出循环
            break
        }

        // 执行 tool
        const toolResults = await Promise.all(
            modelResponse.tool_calls.map((toolCall) => callTool(toolCall))
        )
        // 将 tool 执行结果再调用 llm
        messages = addMessages(messages, [modelResponse, ...toolResults])
        modelResponse = await callModel(messages)
    }

    return messages
})

const config = { configurable: { thread_id: uuidv4() } };

let lastToolResult = null;

async function chat(input) {
    let prompt = input;
    if (lastToolResult !== null) {
        // 自动将上一次 tool 结果插入本轮问题
        prompt += ` (上一次结果: ${lastToolResult})`;
    }
    const result = await agent.invoke([new HumanMessage(prompt)], config);
    for (const message of result) {
        console.log(`[${message.getType()}]: ${message.text}`);
        // 自动提取 tool 结果
        if (message.getType() === 'tool') {
            lastToolResult = message.text;
        }
    }
}

await chat('Add 3 and 4.')
await chat('Multiply the result by 2.')