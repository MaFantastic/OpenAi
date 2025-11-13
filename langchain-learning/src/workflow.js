/* 介绍 LangGraph */

import { ChatDeepSeek } from '@langchain/deepseek'
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} from '@langchain/langgraph'
import { v4 as uuidv4 } from "uuid";
import { trimMessages, HumanMessage } from "@langchain/core/messages";
import 'dotenv/config'

const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
})

// 裁剪消息
const trimmer = trimMessages({
    maxTokens: 10,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: "human",
});

// Define the function that calls the model
const callModel = async (state) => {
    const trimmedMessages = await trimmer.invoke(state.messages);
    console.log('Input messages length: ', trimmedMessages.length);
    const response = await llm.invoke(trimmedMessages);
    return { messages: response }
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    // Define the node and edge
    .addNode('model', callModel)
    .addEdge(START, 'model')
    .addEdge('model', END)

// Add memory
const memory = new MemorySaver()
const app = workflow.compile({ checkpointer: memory })

const config = { configurable: { thread_id: uuidv4() } };


// 构造 12 条连续对话
const questions = [
    '你好，我是李富强',
    '你是谁？',
    '你能做什么？',
    '你喜欢什么颜色？',
    '你会讲笑话吗？',
    '你能帮我写代码吗？',
    '你觉得天气怎么样？',
    '你喜欢什么动物？',
    '你能推荐一本书吗？',
    '你会说几种语言？',
    '地球是什么形状？',
    '我叫什么名字？' // 第12条，询问第1条内容
]



let messages = [];
for (let i = 0; i < questions.length; i++) {
    messages.push(new HumanMessage(questions[i]));
    const output = await app.invoke({ messages }, config);
    messages = output.messages;
    // 输出每轮问答
    console.log(`第${i + 1}轮提问: ${questions[i]}`);
    console.log(`第${i + 1}轮AI回答:`, messages[messages.length - 1]);
    // 第11轮额外输出传递给AI的所有消息内容
    if (i === 10) {
        console.log('第11轮传递给AI的消息：');
        messages.forEach((msg, idx) => {
            console.log(`${idx + 1}:`, msg.content);
        });
    }
}
