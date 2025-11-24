/* 写一个 LangGraph 函数式API的例子，使用 task 和 entrypoint 实现一个简历优化顾问 */
import { tool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import * as z from "zod";
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { task, entrypoint, addMessages, MemorySaver} from '@langchain/langgraph'
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';

const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
})

// 工具1: 解析简历，提取结构化信息
const parseResume = tool(({ resumeText }) => {
    // 使用简单的正则表达式和逻辑来解析简历
    // 在实际应用中，可以使用更复杂的 NLP 技术
    const sections = {
        personalInfo: '',
        skills: '',
        projectExperience: ''
    };

    // 尝试提取个人信息部分
    const personalInfoMatch = resumeText.match(/(?:个人信息|基本信息|个人资料)[:：]?\s*([\s\S]*?)(?=\n\s*(?:专业技能|项目经验|工作经历|教育背景|联系方式|技能|项目))/i);
    if (personalInfoMatch) {
        sections.personalInfo = personalInfoMatch[1].trim();
    }

    // 尝试提取专业技能部分
    const skillsMatch = resumeText.match(/(?:专业技能|技术技能|技能|技能栈)[:：]?\s*([\s\S]*?)(?=\n\s*(?:项目经验|工作经历|项目|教育背景|联系方式))/i);
    if (skillsMatch) {
        sections.skills = skillsMatch[1].trim();
    }

    // 尝试提取项目经验部分
    const projectMatch = resumeText.match(/(?:项目经验|项目经历|项目)[:：]?\s*([\s\S]*?)(?=\n\s*(?:教育背景|联系方式|工作经历|其他|$))/i);
    if (projectMatch) {
        sections.projectExperience = projectMatch[1].trim();
    }

    // 如果没有匹配到，尝试更宽松的匹配
    if (!sections.personalInfo) {
        const lines = resumeText.split('\n').slice(0, 10);
        sections.personalInfo = lines.join('\n');
    }

    return JSON.stringify(sections, null, 2);
}, {
    name: "parseResume",
    description: "解析简历文本，提取个人信息、专业技能和项目经验三个部分",
    schema: z.object({
        resumeText: z.string().describe("完整的简历文本内容"),
    }),
});

// 工具2: 评估专业技能是否与工作年限匹配
const evaluateSkills = tool(async ({ skills, workYears }) => {
    // 使用 LLM 进行智能评估
    const evaluationPrompt = `请评估以下专业技能是否与工作年限匹配：

工作年限：${workYears}年
专业技能：
${skills}

请从以下维度进行评估：
1. 技能深度：评估技能的掌握深度是否与工作年限匹配
2. 技能广度：评估技能栈的广度是否合理（工作年限短但技能过多可能不够深入）
3. 匹配度：整体评估技能与工作年限的匹配程度
4. 建议：给出具体的改进建议

请以 JSON 格式返回评估结果，包含以下字段：
- skillsDepth: 技能深度评估（优秀/良好/一般/不足）
- skillsBreadth: 技能广度评估（过广/合理/偏窄）
- yearsMatch: 与工作年限的匹配度（匹配/基本匹配/不匹配）
- detailedAnalysis: 详细分析说明
- suggestions: 改进建议数组`;

    const response = await llm.invoke([new HumanMessage(evaluationPrompt)]);
    return response.text;
}, {
    name: "evaluateSkills",
    description: "评估专业技能的深度、广度是否与工作年限相匹配，返回详细的评估结果和建议。使用 LLM 进行智能分析。",
    schema: z.object({
        skills: z.string().describe("专业技能文本内容"),
        workYears: z.number().describe("工作年限（年）"),
    }),
});

// 工具3: 评估项目经验是否与工作经验匹配
const evaluateProjects = tool(async ({ projectExperience, workYears }) => {
    // 使用 LLM 进行智能评估
    const evaluationPrompt = `请评估以下项目经验是否与工作经验匹配：

工作年限：${workYears}年
项目经验：
${projectExperience}

请从以下维度进行评估：
1. 项目复杂度：评估项目的技术难度和复杂度是否与工作年限匹配
2. 项目深度：评估项目描述的详细程度和专业性
3. 项目数量：评估项目数量是否合理（工作年限短但项目过多可能不够深入）
4. 匹配度：整体评估项目经验与工作年限的匹配程度
5. 建议：给出具体的改进建议

请以 JSON 格式返回评估结果，包含以下字段：
- projectComplexity: 项目复杂度评估（过高/合理/偏低）
- projectDepth: 项目深度评估（深入/一般/浅显）
- projectCount: 项目数量评估（过多/合理/偏少）
- experienceMatch: 与工作年限的匹配度（匹配/基本匹配/不匹配）
- detailedAnalysis: 详细分析说明
- suggestions: 改进建议数组`;

    const response = await llm.invoke([new HumanMessage(evaluationPrompt)]);
    return response.text;
}, {
    name: "evaluateProjects",
    description: "评估项目经验的内容、难度是否与工作经验相匹配，返回详细的评估结果和建议。使用 LLM 进行智能分析。",
    schema: z.object({
        projectExperience: z.string().describe("项目经验文本内容"),
        workYears: z.number().describe("工作年限（年）"),
    }),
});

// 工具4: 生成优化建议
const generateSuggestions = tool(async ({ personalInfo, skillsEvaluation, projectsEvaluation }) => {
    // 使用 LLM 生成详细的优化建议
    const suggestionsPrompt = `根据以下评估结果，生成详细的简历优化建议：

个人信息：
${personalInfo}

专业技能评估：
${skillsEvaluation}

项目经验评估：
${projectsEvaluation}

请生成结构化的优化建议，包括：
1. 个人信息优化建议：如何改进个人信息部分
2. 专业技能优化建议：如何调整技能描述，使其更匹配工作年限
3. 项目经验优化建议：如何改进项目描述，突出技术深度和复杂度
4. 整体优化建议：综合性的改进建议

请以清晰、可执行的格式输出建议，每条建议都要具体且可操作。`;

    const response = await llm.invoke([new HumanMessage(suggestionsPrompt)]);
    return response.text;
}, {
    name: "generateSuggestions",
    description: "根据评估结果生成具体的优化建议，包括个人信息、专业技能和项目经验的改进建议。使用 LLM 生成详细、可执行的建议。",
    schema: z.object({
        personalInfo: z.string().describe("个人信息内容"),
        skillsEvaluation: z.string().describe("专业技能评估结果"),
        projectsEvaluation: z.string().describe("项目经验评估结果"),
    }),
});

// 注册所有工具
const toolsByName = {
    [parseResume.name]: parseResume,
    [evaluateSkills.name]: evaluateSkills,
    [evaluateProjects.name]: evaluateProjects,
    [generateSuggestions.name]: generateSuggestions,
}
const tools = Object.values(toolsByName)
const modelWithTools = llm.bindTools(tools)

// 定义任务节点
const callModel = task({ name: 'callLlm' }, async (messages) => {
    return modelWithTools.invoke([
        new SystemMessage(
            `你是一个专业的程序员简历优化顾问。你的任务是：
1. 解析简历文本，提取个人信息、专业技能和项目经验
2. 评估专业技能的深度、广度是否与工作年限匹配
3. 评估项目经验的内容、难度是否与工作经验匹配
4. 根据评估结果生成具体的优化建议

请使用提供的工具来完成这些任务。在评估时，要综合考虑：
- 工作年限与技能深度的关系
- 工作年限与技能广度的关系
- 项目复杂度与工作经验的匹配度
- 项目描述的详细程度和专业性

最后要给出清晰、可执行的优化建议。`
        ),
        ...messages,
    ])
})

const callTool = task({ name: 'callTool' }, async (toolCall) => {
    const tool = toolsByName[toolCall.name]
    return tool.invoke(toolCall)
})

// 使用 MemorySaver 持久化聊天记录
const memory = new MemorySaver();

// 创建 agent
const agent = entrypoint({ name: 'agent', checkpointer: memory }, async (messages) => {
    // 先调用 llm
    let modelResponse = await callModel(messages)
    // 循环处理工具调用
    while (true) {
        // 检查是否需要 tool call
        if (!modelResponse.tool_calls?.length) {
            // 不需要则退出循环
            break
        }
        // 执行所有工具调用
        const toolResults = await Promise.all(
            modelResponse.tool_calls.map((toolCall) => callTool(toolCall))
        )
        // 将工具执行结果添加到消息中，再次调用 llm
        messages = addMessages(messages, [modelResponse, ...toolResults])
        modelResponse = await callModel(messages)
    }

    return messages
})

// 主函数：优化简历
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
    
    // 输出所有消息
    console.log('\n' + '='.repeat(80));
    console.log('简历优化报告');
    console.log('='.repeat(80) + '\n');
    
    let lastAIMessage = null;
    let toolResults = [];
    
    for (const message of result) {
        const messageType = message.getType();
        if (messageType === 'ai') {
            // 保存最后一个非空的 AI 消息
            if (message.text && message.text.trim()) {
                lastAIMessage = message.text;
            }
        } else if (messageType === 'tool') {
            // 收集工具结果
            const toolName = message.name || '工具';
            toolResults.push({
                name: toolName,
                result: message.text
            });
            console.log(`[${toolName}执行完成]`);
        }
    }
    
    // 输出工具结果的摘要（如果是最后一个工具 generateSuggestions）
    const suggestionsTool = toolResults.find(t => t.name === 'generateSuggestions');
    if (suggestionsTool) {
        console.log('\n' + '-'.repeat(80));
        console.log('最终优化建议：');
        console.log('-'.repeat(80) + '\n');
        console.log(suggestionsTool.result);
        console.log('\n' + '='.repeat(80) + '\n');
    } else if (lastAIMessage) {
        // 如果没有找到建议工具，显示最后一个 AI 消息
        console.log('\n' + '-'.repeat(80));
        console.log('最终优化建议：');
        console.log('-'.repeat(80) + '\n');
        console.log(lastAIMessage);
        console.log('\n' + '='.repeat(80) + '\n');
    } else {
        // 显示所有工具结果
        console.log('\n' + '-'.repeat(80));
        console.log('分析结果：');
        console.log('-'.repeat(80) + '\n');
        for (const toolResult of toolResults) {
            console.log(`\n[${toolResult.name}]:`);
            console.log(toolResult.result.substring(0, 500) + (toolResult.result.length > 500 ? '...' : ''));
        }
        console.log('\n' + '='.repeat(80) + '\n');
    }
    
    return result;
}

// 示例简历文本
const sampleResume = `
个人信息
姓名：张三
年龄：25岁
工作年限：2年
联系方式：zhangsan@example.com

专业技能
- JavaScript, TypeScript
- React, Vue.js
- Node.js, Express
- Python, Django
- MySQL, MongoDB
- Redis
- Docker, Kubernetes
- AWS, 阿里云
- Git, CI/CD
- 微服务架构设计
- 分布式系统
- 机器学习基础

项目经验
项目一：电商平台系统
负责前端开发，使用 React 和 Redux 构建用户界面，实现了购物车、订单管理等核心功能。
使用 Node.js 开发后端 API，处理用户请求和数据交互。

项目二：数据分析平台
使用 Python 和 Django 开发数据分析平台，实现了数据可视化功能。
使用 MongoDB 存储数据，Redis 做缓存优化。

项目三：微服务架构改造
参与公司核心系统的微服务架构改造，使用 Docker 和 Kubernetes 进行容器化部署。
设计了服务间通信机制，提升了系统的可扩展性。
`;

// 主程序入口
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
