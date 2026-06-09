// Vercel Serverless Function — DeepSeek API 代理
// 不做任何业务处理，只是帮你转发请求到 DeepSeek，保护 Key 不走浏览器直接暴露给第三方

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  const apiKey = req.headers['x-api-key'];

  if (!prompt) {
    return res.status(400).json({ error: '缺少 prompt 参数' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: '缺少 API Key，请在页面顶部设置' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 4096,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `DeepSeek API 错误: ${errText}` });
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: `请求失败: ${err.message}` });
  }
}
