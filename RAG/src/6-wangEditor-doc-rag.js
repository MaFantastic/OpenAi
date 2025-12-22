/* wangEditor 文档 RAG 示例 */
import { ChatDeepSeek } from '@langchain/deepseek'
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import 'dotenv/config'

const QUESTION = 'wangEditor 如何配置上传图片'
const COLLECTION_NAME = 'wangEditor-doc'
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000'

const llm = new ChatDeepSeek({ model: 'deepseek-chat' })
const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.ALIBABA_API_KEY,
})

const vectorStore = await Chroma.fromExistingCollection(embeddings, {
  collectionName: COLLECTION_NAME,
  url: CHROMA_URL,
})

async function runRagDemo() {
  console.log('=== wangEditor 文档 RAG 示例 ===')
  console.log(`用户问题: ${QUESTION}\n`)

  const retriever = vectorStore.asRetriever({ k: 4 })
  const relevantDocs = await retriever.invoke(QUESTION)

  if (!relevantDocs.length) {
    console.warn('未检索到任何相关文档，请确认向量库是否已经构建。')
    return
  }

  const context = relevantDocs
    .map(
      (doc, idx) =>
        `【片段${idx + 1}】(chunk_index=${doc.metadata?.chunk_index ?? 'N/A'})\n${doc.pageContent}`,
    )
    .join('\n\n')

  const response = await llm.invoke([
    new SystemMessage('你是熟悉 wangEditor 的智能助手，只能依据给定资料回答。'),
    new HumanMessage(
      [
        '请基于参考资料回答用户问题，格式如下：',
        '1. 用自然语言说明配置上传图片的步骤；',
        '2. 给出关键配置项，并简要解释其作用；',
        '3. 如资料不足，明确说明。',
        `\n用户问题：${QUESTION}`,
        `\n参考资料：\n${context}`,
      ].join('\n'),
    ),
  ])

  console.log('--- AI 回答 ---\n')
  console.log(response instanceof AIMessage ? response.content : response)

  console.log('\n--- 检索到的参考片段 ---\n')
  relevantDocs.forEach((doc, idx) => {
    console.log(`片段 ${idx + 1} (chunk_index=${doc.metadata?.chunk_index ?? 'N/A'})`)
    console.log(doc.pageContent.slice(0, 200).trim().replace(/\s+/g, ' '))
    if (doc.pageContent.length > 200) {
      console.log('...（内容已截断）\n')
    } else {
      console.log('\n')
    }
  })
}

runRagDemo().catch((err) => {
  console.error('RAG 示例执行失败:', err)
  process.exit(1)
})