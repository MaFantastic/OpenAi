/* 手动嵌入文本 用英文存入chroma会自动转换成向量再存入  中文则需要手动转换成向量再存入 */
import { ChromaClient } from "chromadb";
const client = new ChromaClient();
const collection = await client.getOrCreateCollection({
  name: 'test_collection',
})
await collection.add({
  ids: ["id1", "id2"],
  documents: [
    "This is a document about pineapple",
    "This is a document about oranges",
  ],
});

const results = await collection.query({
  queryTexts: ['This is a query document about hawaii'], // Chroma will embed this for you
  nResults: 2, // how many results to return
})
console.log('Query results:', results)