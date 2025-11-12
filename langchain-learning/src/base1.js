/* 流式输出 */
import { ChatDeepSeek } from '@langchain/deepseek'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const messages = [
  new SystemMessage('Translate the following from English into Italian'),
  new HumanMessage('hi, how are you?'),
]

const stream = await llm.stream(messages)

const chunks = []
for await (const chunk of stream) {
  chunks.push(chunk)
  console.log(`${chunk.content}|`)
}
