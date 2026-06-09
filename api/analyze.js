// Vercel Serverless Function — 代理 Claude API 请求，保护 API Key 不暴露到前端

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, mode } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '缺少 prompt 参数' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 API Key' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Claude API 错误: ${errText}` });
    }

    const data = await response.json();
    const result = data.content[0].text;

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: `请求失败: ${err.message}` });
  }
}
