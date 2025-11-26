import { ChromaClient } from "chromadb";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 加载 PDF 文件内容
async function loadPDF(filePath) {
  console.log('正在加载 PDF 文件...');
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const result = await parser.getText();
    const totalPages = result.total ?? result.pages?.length ?? '未知';
    console.log(`PDF 加载完成，总页数: ${totalPages}`);
    return result.text;
  } finally {
    await parser.destroy().catch(() => {});
  }
}

// 2. 拆分 chunk，每部分 1000 字，重叠 200 字
function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
  console.log('正在拆分文本为 chunks...');
  const chunks = [];
  let start = 0;
  const textLength = text.length;
  
  while (start < textLength) {
    const end = Math.min(start + chunkSize, textLength);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    
    // 移动到下一个 chunk 的起始位置（考虑重叠）
    start = end - overlap;
    
    // 如果剩余文本不足一个 chunk，结束循环
    if (end >= textLength) {
      break;
    }
  }
  
  console.log(`文本已拆分为 ${chunks.length} 个 chunks`);
  return chunks;
}

// 3. 转换为 embedding 向量（使用简单的 TF-IDF 风格的向量化）
// 注意：由于不使用 LLM，这里使用简单的词频向量化
// 但 ChromaDB 对英文文本会自动进行 embedding，所以我们可以直接使用文档
function createEmbeddings(chunks) {
  console.log('准备将 chunks 转换为向量...');
  // ChromaDB 会自动处理英文文本的 embedding
  // 我们只需要返回 chunks 本身
  return chunks;
}

// 4. 存储到本地 chroma 数据库
async function storeInChroma(chunks) {
  console.log('正在存储到 ChromaDB...');
  const client = new ChromaClient();
  const collection = await client.getOrCreateCollection({
    name: 'nike_10k_2023',
  });
  
  // 生成 IDs
  const ids = chunks.map((_, index) => `chunk_${index}`);
  
  // 存储文档（ChromaDB 会自动为英文文本生成 embedding）
  await collection.add({
    ids: ids,
    documents: chunks,
    metadatas: chunks.map((chunk, index) => ({
      chunk_index: index,
      chunk_size: chunk.length,
    })),
  });
  
  console.log(`已存储 ${chunks.length} 个 chunks 到 ChromaDB`);
  return collection;
}

// 5. 执行检索
async function searchInChroma(collection, query, nResults = 3) {
  console.log(`\n正在检索: "${query}"`);
  const results = await collection.query({
    queryTexts: [query],
    nResults: nResults,
  });
  
  console.log(`找到 ${results.ids[0].length} 个相关结果:`);
  results.ids[0].forEach((id, index) => {
    console.log(`\n--- 结果 ${index + 1} (ID: ${id}) ---`);
    console.log(`相似度距离: ${results.distances[0][index]}`);
    console.log(`内容预览: ${results.documents[0][index].substring(0, 200)}...`);
  });
  
  return results;
}

// 主函数
async function main() {
  try {
    // 1. 加载 PDF
    const pdfPath = path.join(__dirname, '../files/nke-10k-2023.pdf');
    const text = await loadPDF(pdfPath);
    console.log(`文本总长度: ${text.length} 字符\n`);
    
    // 2. 拆分 chunks
    const chunks = splitIntoChunks(text, 1000, 200);
    console.log(`第一个 chunk 预览: ${chunks[0].substring(0, 150)}...\n`);
    
    // 3. 转换为 embedding（ChromaDB 会自动处理）
    const embeddings = createEmbeddings(chunks);
    
    // 4. 存储到 ChromaDB
    const collection = await storeInChroma(embeddings);
    console.log('\n');
    
    // 5. 执行两次检索
    console.log('='.repeat(60));
    console.log('开始执行检索演示');
    console.log('='.repeat(60));
    
    // 检索 1: 关于财务信息
    await searchInChroma(collection, 'financial performance revenue earnings', 3);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 检索 2: 关于公司业务
    await searchInChroma(collection, 'business operations products services', 3);
    
    console.log('\n' + '='.repeat(60));
    console.log('RAG 演示完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();

