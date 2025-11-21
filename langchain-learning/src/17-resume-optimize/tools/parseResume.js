import { tool } from "@langchain/core/tools";
import * as z from "zod";

/**
 * 解析简历，提取结构化信息
 * @returns {Object} parseResume 工具
 */
export function createParseResumeTool() {
    return tool(({ resumeText }) => {
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
}

