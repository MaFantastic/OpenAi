import { ChatDeepSeek } from "@langchain/deepseek";
import { MemorySaver, StateGraph, START, END,MessagesAnnotation } from "@langchain/langgraph";
import 'dotenv/config'
import { v4 as uuidv4 } from "uuid";

const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
})

const callmodel = async (state) => {
    const res = await llm.invoke(state.messages);
    return { messages: res }
}

const chatmodal = new StateGraph(MessagesAnnotation).addNode('model', callmodel).addEdge(START, 'model').addEdge('model', END)

const memory = new MemorySaver();

const app = chatmodal.compile({ checkpointer: memory });
const config = { configurable: { thread_id: uuidv4() } };

const res = await app.invoke({
    messages: [
        { role: 'user', content: '你好，我是张三' },
    ]
}, config);
console.log('res ', res);