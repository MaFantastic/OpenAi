/**
 * 格式化输出优化结果
 * @param {Array} result - Agent 返回的消息数组
 */
export function formatOutput(result) {
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
}

/**
 * 示例简历文本
 */
export const sampleResume = `
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

