import { ChatDeepSeek } from '@langchain/deepseek';
import 'dotenv/config';

// 初始化 LLM
export const llm = new ChatDeepSeek({
    model: 'deepseek-chat',
});

