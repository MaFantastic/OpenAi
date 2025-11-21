/*拆分代码，把简历优化顾问的代码拆分成多个文件，每个文件实现一个工具函数，使用 LangGraph 函数式API 实现一个简历优化顾问 */
import { createParseResumeTool } from './parseResume.js';
import { createEvaluationTools } from './evaluation.js';
import { createGenerateSuggestionsTool } from './suggestions.js';

/**
 * 创建所有工具函数
 * @param {Object} llm - LLM 实例
 * @returns {Object} 包含所有工具的对象
 */
export function createTools(llm) {
    const parseResume = createParseResumeTool();
    const { evaluateSkills, evaluateProjects } = createEvaluationTools(llm);
    const generateSuggestions = createGenerateSuggestionsTool(llm);

    return {
        parseResume,
        evaluateSkills,
        evaluateProjects,
        generateSuggestions,
    };
}

