/* 存储 wangEditor 文档到 ChromaDB */
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { ChromaClient } from 'chromadb'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config()

const CHROMA_HOST = process.env.CHROMA_HOST ?? 'localhost'
const CHROMA_PORT = Number(process.env.CHROMA_PORT ?? 8000)
const CHROMA_SSL = process.env.CHROMA_SSL === 'true'
const CHROMA_URL = `http${CHROMA_SSL ? 's' : ''}://${CHROMA_HOST}:${CHROMA_PORT}`
const COLLECTION_NAME = 'wangEditor-doc'
const SOURCE_FILE = path.resolve('files', 'wangEditor-doc.md')

const chromaClient = new ChromaClient({
  host: CHROMA_HOST,
  port: CHROMA_PORT,
  ssl: CHROMA_SSL,
})

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return {}
  }
  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc
    }
    if (value === null) {
      acc[key] = null
      return acc
    }
    const valueType = typeof value
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      acc[key] = value
      return acc
    }
    acc[key] = JSON.stringify(value)
    return acc
  }, {})
}

async function main() {
  const rawMd = fs.readFileSync(SOURCE_FILE, 'utf-8')
  if (!rawMd.trim()) {
    throw new Error('源文件为空，无法生成向量')
  }

  const baseDoc = new Document({
    pageContent: rawMd,
    metadata: { source: 'wangEditor-doc.md' },
  })

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const splitDocs = await splitter.splitDocuments([baseDoc])

  const embeddings = new AlibabaTongyiEmbeddings()

  try {
    await chromaClient.deleteCollection({ name: COLLECTION_NAME })
    console.log(`已清空 collection: ${COLLECTION_NAME}`)
  } catch (error) {
    if (
      error.message?.includes('does not exist') ||
      error.name === 'ChromaNotFoundError'
    ) {
      console.log(`collection ${COLLECTION_NAME} 不存在，跳过删除`)
    } else {
      throw error
    }
  }

  const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { source: 'wangEditor-doc' },
  })

  const contents = splitDocs.map((doc) => doc.pageContent)
  const metadatas = splitDocs.map((doc, idx) => ({
    ...sanitizeMetadata(doc.metadata),
    chunk_index: idx,
  }))
  const ids = splitDocs.map((_, idx) => `${COLLECTION_NAME}-${idx}`)
  const vectors = await embeddings.embedDocuments(contents)

  await collection.add({
    ids,
    metadatas,
    documents: contents,
    embeddings: vectors,
  })
  console.log(`已向 ${COLLECTION_NAME} 写入 ${splitDocs.length} 个 chunk`)

  await runSmokeTests(collection, embeddings)
}

async function runSmokeTests(collection, embeddings) {
  const total = await collection.count()
  console.log(`测试1 - 向量数量: ${total}`)

  const peek = await collection.peek({ limit: 2 })
  console.log('测试2 - peek IDs:', peek?.ids ?? [])

  const queryEmbedding = await embeddings.embedQuery('wangEditor 如何使用')
  const query = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 2,
  })
  console.log('测试3 - 查询返回的文档数量:', query.documents?.[0]?.length ?? 0)
}

main().catch((err) => {
  console.error('执行失败:', err)
  process.exit(1)
})