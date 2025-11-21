import { HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';
import { llm } from './config.js';
import { createTools } from './tools/index.js';
import { createAgent } from './agent.js';
import { formatOutput, sampleResume } from './utils.js';

// 创建所有工具
const tools = createTools(llm);
const toolsByName = {
    [tools.parseResume.name]: tools.parseResume,
    [tools.evaluateSkills.name]: tools.evaluateSkills,
    [tools.evaluateProjects.name]: tools.evaluateProjects,
    [tools.generateSuggestions.name]: tools.generateSuggestions,
};
const toolsArray = Object.values(toolsByName);

// 创建 Agent
const agent = createAgent(llm, toolsByName, toolsArray);

/**
 * 主函数：优化简历
 * @param {string} resumeText - 简历文本内容
 * @returns {Promise<Array>} Agent 返回的消息数组
 */
async function optimizeResume(resumeText) {
    const config = { configurable: { thread_id: uuidv4() } };

    const prompt = `请帮我优化这份程序员简历。简历内容如下：

${resumeText}

请按照以下步骤进行：
1. 首先使用 parseResume 工具解析简历，提取个人信息、专业技能和项目经验三个部分
2. 从个人信息中提取工作年限（如果没有明确说明，请根据项目经验推断一个合理的年限）
3. 使用 evaluateSkills 工具评估专业技能的深度、广度是否与工作年限匹配
4. 使用 evaluateProjects 工具评估项目经验的内容、难度是否与工作经验匹配
5. 使用 generateSuggestions 工具根据前面的评估结果生成详细的优化建议
6. 最后整理并输出一份完整的、结构化的优化建议报告，包括：
   - 简历各部分的问题分析
   - 具体的优化建议
   - 改进后的示例（如果适用）`;

    console.log('正在分析简历...\n');
    const result = await agent.invoke([new HumanMessage(prompt)], config);

    // 格式化输出结果
    formatOutput(result);

    return result;
}

/**
 * 主程序入口
 */
async function main() {
    // 支持从命令行参数读取文件路径，或使用示例简历
    const args = process.argv.slice(2);
    let resumeText = sampleResume;

    if (args.length > 0) {
        // 从文件读取简历
        const filePath = args[0];
        try {
            resumeText = readFileSync(filePath, 'utf-8');
            console.log(`从文件读取简历: ${filePath}\n`);
        } catch (error) {
            console.error(`无法读取文件 ${filePath}:`, error.message);
            console.log('使用示例简历...\n');
        }
    } else {
        console.log('使用示例简历（可以通过命令行参数传入简历文件路径）\n');
    }

    console.log('开始优化简历...\n');
    await optimizeResume(resumeText);
}

// 执行优化
main().catch(console.error);

