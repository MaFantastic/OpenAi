import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import * as z from "zod";

/**
 * 创建评估工具（专业技能和项目经验）
 * @param {Object} llm - LLM 实例
 * @returns {Object} 包含 evaluateSkills 和 evaluateProjects 工具的对象
 */
export function createEvaluationTools(llm) {
    // 工具: 评估专业技能是否与工作年限匹配
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

    // 工具: 评估项目经验是否与工作经验匹配
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

    return {
        evaluateSkills,
        evaluateProjects,
    };
}

