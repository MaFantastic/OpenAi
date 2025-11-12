/* chain 链 */

import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableLambda } from '@langchain/core/runnables'
import 'dotenv/config'

const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
})

const prompt = ChatPromptTemplate.fromTemplate('讲一个关于{topic}的笑话')

const chain = prompt.pipe(llm).pipe(new StringOutputParser())

/* 正常输出 */
// const res = await chain.invoke({ topic: '狗熊' })
// console.log(res)

/* 流式输出 */
// const stream = await chain.stream({
//   topic: '狗熊',
// })

// for await (const chunk of stream) {
//   console.log(`${chunk}|`)
// }


/* 串行任务： chain 之后，再继续其他任务，也可以继续使用 pipe 方法 */
const analysisPrompt = ChatPromptTemplate.fromTemplate('这个笑话搞笑吗？ {joke}')

const composedChain = new RunnableLambda({
    func: async (input) => {
        const result = await chain.invoke(input)
        console.log('笑话内容：', result)
        return { joke: result }
    },
})
    .pipe(analysisPrompt)
    .pipe(llm)
    .pipe(new StringOutputParser())

const res2 = await composedChain.invoke({ topic: '狗熊' })
console.log(res2)

const myselfPrompt = ChatPromptTemplate.fromTemplate('简单介绍一下{book}这本书的内容，50字以内')

const myselfChain= myselfPrompt.pipe(llm).pipe(new StringOutputParser())