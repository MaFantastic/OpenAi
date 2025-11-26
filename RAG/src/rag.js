import 'dotenv/config'
import { ChatDeepSeek } from '@langchain/deepseek'
import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { ChromaClient } from 'chromadb'

const COLLECTION_NAME = 'nike_10k_2023'

const client = new ChromaClient({ 
  host: 'localhost',
  port: 8000,
})

const ragState = Annotation.Root({//定义状态结构
  question: Annotation(),//用户问题（从输入传入
  context: Annotation({//检索到的上下文
    default: '',
  }),
  answer: Annotation(),//生成的答案
})

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
  temperature: 0.1,
})

async function retrieveNode(state) {
  const collection = await client.getOrCreateCollection({ name: COLLECTION_NAME })
  const searchResponse = await collection.query({
    queryTexts: [state.question],
    nResults: 4,
  })

  const docs = searchResponse.documents?.[0] ?? []
  const metadatas = searchResponse.metadatas?.[0] ?? []
  const distances = searchResponse.distances?.[0] ?? []

  const formatted = docs
    .map((doc, idx) => {
      const meta = metadatas[idx] ?? {}
      const chunkId = meta.chunk_index ?? idx
      const score = typeof distances[idx] === 'number' ? distances[idx].toFixed(4) : 'N/A'
      return `Chunk ${chunkId} | distance: ${score}\n${doc}`
    })
    .join('\n\n')

  return {
    context: formatted,
  }
}

function buildPrompt(question, context) {
  return [
    {
      role: 'system',
      content:
        '你是 Nike 年度报告的问答助手。请基于提供的检索内容回答问题，若无法确定答案，请直接说明无法找到。',
    },
    {
      role: 'user',
      content: [
        '已检索上下文：',
        context || '[没有检索结果]',
        '\n---\n',
        `问题：${question}`,
        '请用中文总结并在答案结尾引用最相关的 chunk 编号。',
      ].join('\n'),
    },
  ]
}

async function generateNode(state) {
  const messages = buildPrompt(state.question, state.context)
  const response = await llm.invoke(messages)

  const content = Array.isArray(response.content)
    ? response.content
        .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
        .join('\n')
    : response.content

  return {
    answer: content,
  }
}

const workflow = new StateGraph(ragState)
workflow.addNode('retrieve', retrieveNode)
workflow.addNode('generate', generateNode)
workflow.addEdge(START, 'retrieve')
workflow.addEdge('retrieve', 'generate')
workflow.addEdge('generate', END)

const app = workflow.compile()

const question = process.argv.slice(2).join(' ') || "What was Nike's revenue in 2023?"
const result = await app.invoke({ question })

console.log('\n===== RAG Agent =====')
console.log('Question:', question)
console.log('\nContext Preview:\n', (result.context || '').slice(0, 500), '...')
console.log('\nAnswer:\n', result.answer)