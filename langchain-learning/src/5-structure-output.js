/* LangChain 结构化输出 */
import { z } from "zod";
import { ChatDeepSeek } from "@langchain/deepseek";
import 'dotenv/config';


// 情感判断结构
const SentimentSchema = z.object({
  sentiment: z.enum(["褒义", "贬义", "中性"]).describe("情感类型"),
  reason: z.string().describe("判断理由")
});

export async function parseIntroWithDeepseek(personalIntro) {
  // TODO: implement this function
}

// 情感判断函数
export async function judgeSentiment(text) {
  const model = new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: "deepseek-chat",
  });

  const prompt = `
请判断下列句子的情感倾向，只输出 JSON：
- sentiment: "褒义" | "贬义" | "中性"（三选一）
- reason: 判断理由（简要说明）

句子："""${text}"""

只输出纯 JSON，不要任何多余内容。
`;
  const llmWithStructuredOutput = model.withStructuredOutput(SentimentSchema);
  const res = await llmWithStructuredOutput.invoke(prompt);
  return res;
}

// ESM 入口判断
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && process.argv[1] === __filename) {
  import('readline').then(async (rlModule) => {
    const rl = rlModule.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    async function ask() {
      rl.question('请输入一句话（输入0退出）：', async (input) => {
        if (input === '0') {
          rl.close();
          return;
        }
        try {
          const result = await judgeSentiment(input);
          console.log('判断结果:', result);
        } catch (err) {
          console.error('错误:', err.message);
        }
        ask();
      });
    }
    ask();
  });
}
