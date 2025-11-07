import http from 'http';
import { OpenAI } from 'openai';
import 'dotenv/config';
// 新增用于读取 chat.html
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// 新增：用于友好打印复杂对象
import util from 'util';

// 请在环境变量 OPENAI_API_KEY 中设置你的 API Key
const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // ESM 环境下计算当前文件夹路径
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 新增：返回 chat.html 页面
    if (url.pathname === '/chat' && req.method === 'GET') {
        try {
            const filePath = path.join(__dirname, 'chat.html');
            const html = await fs.readFile(filePath, 'utf8');
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            return res.end(html);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end('读取 chat.html 失败: ' + String(err));
        }
    }

    if (req.method === 'OPTIONS') {
        // 简单的 CORS 预检响应（demo）
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        return res.end();
    }

    if (url.pathname === '/api/chat' && req.method === 'POST') {
        // 读取请求体（假定是 JSON）
        let body = '';
        for await (const chunk of req) body += chunk;
        const { message = '' } = JSON.parse(body || '{}');
        // SSE 响应头
        res.writeHead(200, {
            'Content-Type': 'application/json', // 修改为 JSON 类型
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        res.flushHeaders?.();

        try {
            // 向 /v1/deepseek 发起流式请求（demo）
            const resp = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: message }
                ],
                model: "deepseek-chat",
                stream: true,
                temperature: 0.7,
            });

            // 兼容各种返回的流接口：优先选出一个可异步迭代的对象
            let asyncIter = null;
            if (resp && typeof resp[Symbol.asyncIterator] === 'function') {
                asyncIter = resp;
            } else if (resp && typeof resp.iterator === 'function') {
                try {
                    asyncIter = resp.iterator();
                } catch (e) {
                    console.log('DEBUG: 调用 resp.iterator() 失败:', String(e));
                }
            } else if (resp && resp.body && typeof resp.body[Symbol.asyncIterator] === 'function') {
                asyncIter = resp.body;
            }

            // 如果有可迭代流，则流式转发；否则走回退一次性处理
            if (asyncIter && typeof asyncIter[Symbol.asyncIterator] === 'function') {
                try {
                    for await (const chunk of asyncIter) {
                        if (req.socket.destroyed) break;

                        // 解析 chunk，提取可读文本
                        let text = '';
                        try {
                            if (chunk == null) {
                                text = '';
                            } else if (typeof chunk === 'string') {
                                text = chunk;
                            } else if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
                                text = Buffer.from(chunk).toString('utf8');
                            } else if (typeof chunk === 'object') {
                                if (Array.isArray(chunk.choices)) {
                                    text = chunk.choices.map(c => c.delta?.content ?? c.message?.content ?? c.text ?? '').join('');
                                } else if (chunk.delta && typeof chunk.delta === 'object') {
                                    text = chunk.delta.content ?? '';
                                } else if (chunk.message && typeof chunk.message === 'object') {
                                    text = chunk.message.content ?? '';
                                } else if (chunk.value && typeof chunk.value === 'string') {
                                    text = chunk.value;
                                } else if (chunk.output_text) {
                                    text = chunk.output_text;
                                } else if (Object.keys(chunk).length === 1 && chunk.controller !== undefined) {
                                    text = '';
                                } else {
                                    text = JSON.stringify(chunk);
                                }
                            } else {
                                text = String(chunk);
                            }
                        } catch (e) {
                            text = String(chunk);
                        }

                        if (text) {
                            let cleaned = String(text)
                                .replace(/\r/g, '')
                                .replace(/\s+/g, ' ')
                                .replace(/^\s+|\s+$/g, '')
                                .replace(/\s+([，。！？；：、])/g, '$1')
                                .replace(/([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])/g, '$1$2')
                                .replace(/([a-zA-Z])\s+([，。！？；：、])/g, '$1$2');

                            if (cleaned) {
                                const lines = cleaned.split('\n');
                                for (const line of lines) {
                                    if (line.trim()) {
                                        // 修改为 JSON 格式
                                        const jsonResponse = JSON.stringify({
                                            type: 'message',
                                            content: line
                                        });
                                        res.write(`${jsonResponse}\n`);
                                    }
                                }
                                res.write('\n');
                            }
                        }

                        if (typeof res.flush === 'function') res.flush();

                    }
                } catch (e) {
                    console.log('DEBUG: async iterator error:', String(e));
                    // 错误也返回 JSON 格式
                    const errorResponse = JSON.stringify({
                        type: 'error',
                        content: String(e)
                    });
                    res.write(`${errorResponse}\n`);
                }
            } else {
                // 回退处理也使用 JSON 格式
                try {
                    let text = '';

                    if (resp && typeof resp === 'object') {
                        if (Array.isArray(resp.choices)) {
                            text = resp.choices.map(c => c.delta?.content ?? c.message?.content ?? c.text ?? '').join('');
                        } else if (resp.output_text) {
                            text = resp.output_text;
                        } else if (resp.output && Array.isArray(resp.output) && resp.output[0]?.content) {
                            text = resp.output[0].content;
                        } else {
                            text = JSON.stringify(resp);
                        }
                    } else if (resp && typeof resp.text === 'function') {
                        text = await resp.text();
                    } else if (typeof resp === 'string') {
                        text = resp;
                    } else {
                        text = String(resp);
                    }

                    // 清理后一次性发送
                    let cleaned = String(text).replace(/\r/g, '').replace(/\s+/g, ' ');
                    cleaned = cleaned.replace(/([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])/g, '$1$2');
                    cleaned = cleaned.replace(/\s+([，。！？；：、])/g, '$1');
                    cleaned = cleaned.trim();
                    
                    const jsonResponse = JSON.stringify({
                        type: 'message',
                        content: cleaned
                    });
                    res.write(`${jsonResponse}\n`);
                } catch (e) {
                    console.log('DEBUG: fallback 读取失败:', String(e));
                    const errorResponse = JSON.stringify({
                        type: 'error',
                        content: `无法读取下游流: ${String(e)}`
                    });
                    res.write(`${errorResponse}\n`);
                }
            }

            // 结束消息也使用 JSON 格式
            const doneResponse = JSON.stringify({
                type: 'done',
                content: '[DONE]'
            });
            res.write(`${doneResponse}\n`);
            res.end();
        } catch (err) {
            console.log('ERROR sending to client:', err);
            const errorResponse = JSON.stringify({
                type: 'error',
                content: err?.message ?? String(err)
            });
            res.write(`${errorResponse}\n`);
            res.end();
        }
        return;
    }

    // 其他路由
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});