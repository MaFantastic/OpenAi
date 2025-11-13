/* 学习如何使用 langchain 开发一个 chatbot */

import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const res3 = await llm.invoke([
  { role: 'user', content: '你好，我是双越' },
  { role: 'assistant', content: '你好，双越！今天我能帮你什么？' },
  { role: 'user', content: '我叫什么名字' },
])
console.log('res3 ', res3)