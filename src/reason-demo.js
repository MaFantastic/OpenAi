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
        console.clear();
        console.log("🤖 正在连接API...\n");

        const stream = await openai.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "你是一个专业的助手。请先进行分析推理，再给出最终答案。必须使用以下格式：REASON: [详细的推理过程] ANSWER: [基于推理的最终答案]" 
                },
                { 
                    role: "user", 
                    content: "天空为什么是蓝色的" 
                }
            ],
            model: "deepseek-reasoner",  // 使用 reasoner 模型
            stream: true,
            temperature: 0.7,
            max_tokens: 2000
        });

        console.log("✅ API连接成功\n");
        console.log("问题：天空为什么是蓝色的\n");
        
        let reasoning = '';
        let answer = '';
        let currentPart = '';
        let isReasoning = false;
        let hasStarted = false;

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            
            // 收集当前部分的内容
            currentPart += content;
            
            // 检查是否包含标记
            if (currentPart.includes('REASON:')) {
                isReasoning = true;
                hasStarted = true;
                currentPart = currentPart.replace('REASON:', '');
                console.log('\n🔍 推理过程开始：\n');
            } else if (currentPart.includes('ANSWER:')) {
                // 保存之前的推理内容
                reasoning = currentPart.split('ANSWER:')[0].trim();
                isReasoning = false;
                currentPart = currentPart.includes('ANSWER:') ? 
                    currentPart.split('ANSWER:')[1] : currentPart;
                console.log('\n💡 最终答案：\n');
            }

            // 输出内容
            if (hasStarted && content) {
                if (isReasoning) {
                    process.stdout.write(`\x1b[33m${content}\x1b[0m`); // 黄色显示推理
                } else {
                    process.stdout.write(`\x1b[32m${content}\x1b[0m`); // 绿色显示答案
                }
            }
        }

        // 保存最后的答案内容
        answer = currentPart.trim();

        // 输出完整的分析结果
        console.log('\n\n📝 完整分析');
        console.log('=====================================');
        console.log('\n🔍 推理过程:');
        console.log(`\x1b[33m${reasoning}\x1b[0m`);
        console.log('\n💡 最终答案:');
        console.log(`\x1b[32m${answer}\x1b[0m`);
        console.log('\n=====================================');
        console.log('✅ 分析完成\n');

    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            console.error('❌ API 错误:', error.status, error.message);
            console.error('错误详情:', error);
        } else {
            console.error('❌ 未知错误:', error);
        }
    }
}

main();