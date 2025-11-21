import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { task, entrypoint, addMessages, MemorySaver } from '@langchain/langgraph';

/**
 * 创建 Agent
 * @param {Object} llm - LLM 实例
 * @param {Object} toolsByName - 工具对象（按名称索引）
 * @param {Array} tools - 工具数组
 * @returns {Object} Agent 实例
 */
export function createAgent(llm, toolsByName, tools) {
    // 绑定工具到模型
    const modelWithTools = llm.bindTools(tools);

    // 定义任务节点：调用 LLM
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
        ]);
    });

    // 定义任务节点：调用工具
    const callTool = task({ name: 'callTool' }, async (toolCall) => {
        const tool = toolsByName[toolCall.name];
        return tool.invoke(toolCall);
    });

    // 使用 MemorySaver 持久化聊天记录
    const memory = new MemorySaver();

    // 创建 agent
    const agent = entrypoint({ name: 'agent', checkpointer: memory }, async (messages) => {
        // 先调用 llm
        let modelResponse = await callModel(messages);

        // 循环处理工具调用
        while (true) {
            // 检查是否需要 tool call
            if (!modelResponse.tool_calls?.length) {
                // 不需要则退出循环
                break;
            }

            // 执行所有工具调用
            const toolResults = await Promise.all(
                modelResponse.tool_calls.map((toolCall) => callTool(toolCall))
            );
            // 将工具执行结果添加到消息中，再次调用 llm
            messages = addMessages(messages, [modelResponse, ...toolResults]);
            modelResponse = await callModel(messages);
        }

        return messages;
    });

    return agent;
}

