/* 模版+流式输出 */
import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import 'dotenv/config'

const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
})

// 定义 template
const systemTemplate = '请使用{language} 翻译以下内容'
const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', systemTemplate],
    ['user', '{text}'],
])

// 根据 template 生成 prompt 值
const promptValue = await promptTemplate.invoke({
    language: 'Chinese',
    text: '简单说一下LangChain是什么？',
})

// 调用 prompt 生成 AI 结果
const stream = await llm.stream(promptValue)
const chunks = []

for await (const chunk of stream) {
    chunks.push(chunk)
    // console.log(`${chunk.content}|`)
    process.stdout.write(chunk.content)
}
