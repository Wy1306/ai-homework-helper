# 🦉 AI 作业助手 — 大学生编程学习工具

> B站「AI创造公开赛」参赛项目 | Build in Public

**帮你理解代码，而不是替你写作业。**

## ✨ 功能

| 功能 | 说明 |
|------|------|
| 🐛 Bug 诊断 | 粘贴代码+报错 → AI定位问题 → 修复方案 |
| 🔍 代码审查 | 粘贴代码 → S1-S4分级Bug清单 + 改进建议 |
| 💡 思路讲解 | 粘贴题目 → 解题思路 + 伪代码 + 复杂度分析 |
| 📝 注释补全 | 裸代码 → 关键行中文注释 |

## 🛠 技术栈

- **前端**：HTML + CSS + JavaScript（单页应用）
- **AI 引擎**：Claude API（Anthropic）
- **部署**：Vercel（免费托管）
- **代码仓库**：GitHub（Build in Public）

## 🚀 本地运行

1. 克隆仓库
```bash
git clone https://github.com/Wy1306/ai-homework-helper.git
cd ai-homework-helper
```

2. 安装 Vercel CLI（需要 Node.js）
```bash
npm i -g vercel
```

3. 设置 API Key
```bash
# 创建 .env.local 文件，写入：
CLAUDE_API_KEY=你的Claude_API_Key
```

4. 启动开发服务器
```bash
vercel dev
```

5. 浏览器打开 `http://localhost:3000`

## 📂 项目结构

```
ai-homework-helper/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式（暗色主题）
├── js/
│   └── app.js          # 前端逻辑 + Tab切换 + 4种AI分析模式
├── api/
│   └── analyze.js      # Vercel Serverless Function（Claude API 代理）
├── vercel.json         # Vercel 部署配置
└── README.md
```

## 🎬 B站视频系列

| 期数 | 内容 | 状态 |
|------|------|------|
| 1 | 项目启动 + 搭建骨架 | ✅ 已完成 |
| 2 | Bug诊断功能开发 | 🔨 进行中 |
| 3 | 前端页面美化 | ⏳ 待开始 |
| 4 | 代码审查 + 测试 | ⏳ 待开始 |
| 5 | 部署上线 | ⏳ 待开始 |
| 6 | 用户反馈 | ⏳ 待开始 |
| 7 | 迭代新功能 | ⏳ 待开始 |
| 8 | 8周全记录 + 参赛提交 | ⏳ 待开始 |

## ⚠️ 声明

本工具旨在辅助学习，帮助学生理解代码逻辑。请勿用于直接提交作业答案。

---

Built by [Wy1306](https://github.com/Wy1306) | #B站AI创造公开赛
