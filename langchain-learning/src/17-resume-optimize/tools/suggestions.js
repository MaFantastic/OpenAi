import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import * as z from "zod";

/**
 * 创建生成优化建议工具
 * @param {Object} llm - LLM 实例
 * @returns {Object} generateSuggestions 工具
 */
export function createGenerateSuggestionsTool(llm) {
    return tool(async ({ personalInfo, skillsEvaluation, projectsEvaluation }) => {
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
}

