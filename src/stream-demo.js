import 'dotenv/config';
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

async function main() {
    if (!process.env.DEEPSEEK_API_KEY) {
        console.error("请设置 DEEPSEEK_API_KEY 环境变量");
        process.exit(1);
    }

    try {
        // 在开始前清空控制台
        console.clear();
        console.log("🤖 开始对话...\n");

        const stream = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "今天天气怎么样" }
            ],
            model: "deepseek-chat",
            stream: true,
            temperature: 0.7,
        });

        let fullResponse = '';
        process.stdout.write('AI: ');
        
        // 处理流式响应
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                fullResponse += content;
                // 使用不同的颜色输出（绿色）
                process.stdout.write(`\x1b[32m${content}\x1b[0m`);
            }
        }

    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            console.error('❌ API 错误:', error.status, error.message);
        } else {
            console.error('❌ 未知错误:', error);
        }
    }
}

main();