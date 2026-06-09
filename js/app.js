// ============================================================
// API Key 管理（存 localStorage，不经过服务器）
// ============================================================
const LS_KEY = 'ai_helper_ds_key';

function getApiKey() {
  return localStorage.getItem(LS_KEY) || '';
}

function saveApiKey() {
  const input = document.getElementById('apiKeyInput');
  const key = input.value.trim();
  if (!key) {
    updateKeyStatus('error', '请输入 Key');
    return;
  }
  if (!key.startsWith('sk-')) {
    updateKeyStatus('error', '格式不对，Key 应以 sk- 开头');
    return;
  }
  localStorage.setItem(LS_KEY, key);
  updateKeyStatus('ok', '已保存 ✓');
  input.value = '';
  // 3秒后隐藏状态
  setTimeout(() => updateKeyStatus('idle', getApiKey() ? '已设置' : '未设置'), 3000);
}

function toggleKeyVisibility() {
  const input = document.getElementById('apiKeyInput');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function updateKeyStatus(type, msg) {
  const el = document.getElementById('apiKeyStatus');
  el.textContent = msg;
  el.className = 'api-key-status ' + type;
}

// 页面加载时检查是否已有 Key
(function initKeyBar() {
  const saved = getApiKey();
  if (saved) {
    updateKeyStatus('idle', '已设置');
  }
})();

// ============================================================
// Tab 切换
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

const PROMPTS = {
  debug: (code, lang) => `你是一个资深的编程教师，帮助大学生分析代码Bug。

学生提供的代码和报错信息如下（语言：${lang === 'auto' ? '请自动检测' : lang}）：

\`\`\`
${code}
\`\`\`

请按以下结构输出分析结果：

## 🐛 Bug 定位
- 错误类型：
- 出错位置：（第几行/哪个函数）
- 根本原因：（用通俗语言解释为什么会出这个错）

## 🔧 修复方案
- 给出修正后的完整代码
- 解释为什么这样修改有效

## 📚 相关知识
- 这个错误涉及的知识点
- 以后如何避免类似错误

注意：
- 用中文回复
- 对代码逐行解释时，不要超过必要的详细程度
- 如果是初学者常犯的错误，明确指出`,
  review: (code, lang) => `你是一个严谨的代码审查专家。请审查以下${lang === 'auto' ? '' : lang}代码，按 S1-S4 分级列出发现的问题。

代码：
\`\`\`${lang === 'auto' ? '' : lang}
${code}
\`\`\`

分级标准：
- **S1 严重**：会导致崩溃、数据丢失、安全漏洞
- **S2 重要**：逻辑错误、边界条件遗漏、可能导致错误结果
- **S3 一般**：性能问题、代码异味、不规范写法
- **S4 建议**：可读性、命名、注释方面的改进

请按以下结构输出：

## 📊 审查总览
（一句话概括代码质量）

## 🔴 S1 严重问题
（如果没有，写"未发现"）

## 🟠 S2 重要问题
（如果没有，写"未发现"）

## 🟡 S3 一般问题
（如果没有，写"未发现"）

## 🟢 S4 改进建议

## ✅ 总体评价与改进方向

用中文回复，每个问题标注所在行号。`,

  explain: (question) => `你是一个有耐心的编程老师。学生发来一道题目，请帮他理清思路，但不要直接给出完整代码答案。

题目：
${question}

请按以下结构输出：

## 📖 题目理解
（用大白话复述题目在问什么，打一个生活化的比方帮助理解）

## 🧠 解题思路
（分步讲解解题逻辑，为什么这么想）

## 📝 伪代码
（用类似Python的伪代码描述算法流程，关键步骤加注释）

## ⏱ 复杂度分析
- 时间复杂度：
- 空间复杂度：
- 解释为什么是这个复杂度

## 💡 可能踩的坑
- 边界条件
- 常见错误思路

教学原则：引导学生自己写出代码，而不是直接给答案。伪代码比真实代码更抽象一层。`,

  generate: (question, lang) => `你是一个专业的编程老师。学生要你根据题目写出完整可运行的代码。

题目：
${question}

目标语言：${lang}

请按以下结构输出：

## 📖 题目分析
（用2-3句话概括题目核心要求）

## 💻 完整代码
（用三个反引号包裹，写出完整可运行的代码。注意边界条件处理、输入输出格式、必要的注释）

## 🧠 关键逻辑讲解
（挑代码中最重要的2-3处，解释为什么这样写）

## ⚠️ 注意事项
- 边界条件
- 常见坑点
- 输入输出格式说明

注意：用中文讲解，代码中的变量名和注释用英文。`,

  comment: (code, lang) => `你是一个代码注释专家。请为以下${lang === 'auto' ? '' : lang}代码添加中文注释。只注释关键行，不要每行都注释。

代码：
\`\`\`${lang === 'auto' ? '' : lang}
${code}
\`\`\`

规则：
1. 保留原代码不变，在关键行上方或行尾添加简洁的中文注释
2. 重点注释：函数用途、复杂算法逻辑、非显而易见的操作、重要的变量含义
3. 不要注释：一眼能看懂的赋值、简单的循环、print语句
4. 在代码块前加一段简述（2-3句话），概括这段代码做了什么

输出格式：直接给出带注释的代码，用三个反引号包裹。`
};

function markdownToHtml(text) {
  let html = text;

  // 转义 HTML 实体（保护代码块内内容）
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `%%INLINECODE_${inlineCodes.length - 1}%%`;
  });

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

  // 加粗
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // S1-S4 着色
  html = html.replace(/S1[^\n<]*/g, m => `<span class="severity-s1">${m}</span>`);
  html = html.replace(/S2[^\n<]*/g, m => `<span class="severity-s2">${m}</span>`);
  html = html.replace(/S3[^\n<]*/g, m => `<span class="severity-s3">${m}</span>`);
  html = html.replace(/S4[^\n<]*/g, m => `<span class="severity-s4">${m}</span>`);

  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 段落（处理剩余的非空行）
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[23]>)/g, '$1');
  html = html.replace(/(<\/h[23]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');

  // 恢复代码块和内联代码
  codeBlocks.forEach((block, i) => {
    html = html.replace(`%%CODEBLOCK_${i}%%`, block);
    html = html.replace(`<p>${block}</p>`, block); // 清理包裹的 <p>
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`%%INLINECODE_${i}%%`, code);
  });

  return html;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  return text.replace(/[&<>"]/g, c => map[c]);
}

async function analyze(mode) {
  const btn = document.getElementById(`btn-${mode}`);
  const resultBox = document.getElementById(`result-${mode}`);

  let code, lang, question;
  switch (mode) {
    case 'debug':
      code = document.getElementById('debug-code').value.trim();
      lang = document.getElementById('debug-lang').value;
      if (!code) { alert('请粘贴代码和报错信息'); return; }
      break;
    case 'review':
      code = document.getElementById('review-code').value.trim();
      lang = document.getElementById('review-lang').value;
      if (!code) { alert('请粘贴要审查的代码'); return; }
      break;
    case 'explain':
      question = document.getElementById('explain-question').value.trim();
      if (!question) { alert('请粘贴题目描述'); return; }
      break;
    case 'comment':
      code = document.getElementById('comment-code').value.trim();
      lang = document.getElementById('comment-lang').value;
      if (!code) { alert('请粘贴需要注释的代码'); return; }
      break;
    case 'generate':
      question = document.getElementById('generate-question').value.trim();
      lang = document.getElementById('generate-lang').value;
      if (!question) { alert('请粘贴题目描述'); return; }
      break;
  }

  btn.disabled = true;
  btn.textContent = '⏳ AI 分析中...';
  resultBox.className = 'result-box loading';
  resultBox.textContent = '正在调用 AI 分析，请稍候...';

  // 检查 API Key
  const apiKey = getApiKey();
  if (!apiKey) {
    resultBox.className = 'result-box visible';
    resultBox.innerHTML = `
      <p style="color: var(--warning)">⚠️ 请先设置 DeepSeek API Key</p>
      <p style="color: var(--text-dim); font-size: 13px;">
        去 <a href="https://platform.deepseek.com/" target="_blank" style="color: var(--primary)">platform.deepseek.com</a> 注册，免费额度够用几千次。
      </p>`;
    btn.disabled = false;
    btn.textContent = getBtnLabel(mode);
    return;
  }

  try {
    const prompt = PROMPTS[mode](code || question, lang);
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({ prompt, mode })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    resultBox.className = 'result-box visible';
    resultBox.innerHTML = markdownToHtml(data.result);
  } catch (err) {
    resultBox.className = 'result-box visible';
    resultBox.innerHTML = `<p style="color: var(--danger)">❌ 分析失败：${err.message}</p>
      <p style="color: var(--text-dim); font-size: 13px; margin-top: 8px;">
        请检查网络连接，或确认 API 密钥已正确配置。
      </p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = getBtnLabel(mode);
  }
}

function getBtnLabel(mode) {
  const labels = { debug: '🔍 分析 Bug', review: '🔍 审查代码', explain: '💡 讲解思路', comment: '📝 补全注释', generate: '✍️ 生成代码' };
  return labels[mode];
}

// ============================================================
// 离线代码编辑器
// ============================================================
const editor = document.getElementById('codeEditor');
const lineNumbers = document.getElementById('lineNumbers');
const editorStatus = document.getElementById('editorStatus');
const LS_EDITOR = 'ai_helper_editor_code';

function updateLineNumbers() {
  const lines = editor.value.split('\n');
  const count = lines.length;
  let html = '';
  for (let i = 1; i <= count; i++) {
    html += `<span>${i}</span>`;
  }
  lineNumbers.innerHTML = html;
}

// 同步行号滚动
editor.addEventListener('scroll', () => {
  lineNumbers.style.transform = `translateY(-${editor.scrollTop}px)`;
});

editor.addEventListener('input', () => {
  updateLineNumbers();
  autoSave();
});

// Tab 键插入缩进
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (e.shiftKey) {
      // Shift+Tab: 取消缩进（删除行首最多4个空格）
      const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
      const line = editor.value.substring(lineStart, start);
      const indentLen = Math.min(4, line.match(/^ */)[0].length);
      if (indentLen > 0) {
        editor.value = editor.value.substring(0, lineStart) + editor.value.substring(lineStart + indentLen);
        editor.selectionStart = editor.selectionEnd = start - indentLen;
        updateLineNumbers();
        autoSave();
      }
    } else {
      // Tab: 插入空格到下一个4的倍数（或直接插4空格）
      const beforeCursor = editor.value.substring(0, start);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const col = start - lineStart;
      const spaces = 4 - (col % 4);
      const padding = ' '.repeat(spaces);
      editor.value = beforeCursor + padding + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + spaces;
      updateLineNumbers();
      autoSave();
    }
  }
});

// 自动保存（1秒防抖）
let saveTimer;
function autoSave() {
  editorStatus.textContent = '保存中...';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const data = {
      code: editor.value,
      lang: document.getElementById('editor-lang').value,
      time: Date.now()
    };
    localStorage.setItem(LS_EDITOR, JSON.stringify(data));
    editorStatus.textContent = '已自动保存 ' + new Date().toLocaleTimeString();
  }, 1000);
}

// 页面加载时恢复
(function initEditor() {
  const saved = localStorage.getItem(LS_EDITOR);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      editor.value = data.code || '';
      document.getElementById('editor-lang').value = data.lang || 'python';
    } catch (_) {}
  }
  updateLineNumbers();
  // 切换到编辑器tab时也刷新行号
  document.querySelector('[data-tab="editor"]').addEventListener('click', () => {
    updateLineNumbers();
  });
})();

function onEditorLangChange() {
  autoSave();
}

function runCode() {
  const lang = document.getElementById('editor-lang').value;
  const output = document.getElementById('editorOutput');
  const content = document.getElementById('outputContent');

  if (lang !== 'javascript') {
    output.style.display = 'block';
    content.className = '';
    content.textContent = '⚠️ 离线运行仅支持 JavaScript。\n\n其他语言请复制代码到本地 IDE 运行，或用上方的「代码生成」功能请 AI 帮你检查。';
    return;
  }

  output.style.display = 'block';
  content.className = '';

  // 捕获 console.log
  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
    error: (...args) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
    warn: (...args) => logs.push('[WARN] ' + args.map(a => String(a)).join(' '))
  };

  try {
    const code = editor.value;
    const fn = new Function('console', code);
    fn(fakeConsole);
    content.className = '';
    content.textContent = logs.join('\n') || '(代码执行完毕，无输出)';
  } catch (err) {
    content.className = 'error';
    content.textContent = `❌ 运行错误：${err.message}\n\n💡 提示：\n  - 检查代码语法\n  - 确认代码完整（函数调用等）\n  - 浏览器环境不支持 Node.js API`;
  }
}

function closeOutput() {
  document.getElementById('editorOutput').style.display = 'none';
}

function downloadCode() {
  const code = editor.value;
  const lang = document.getElementById('editor-lang').value;
  const extMap = { python: 'py', java: 'java', javascript: 'js', cpp: 'cpp', c: 'c', sql: 'sql' };
  const ext = extMap[lang] || 'txt';
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearEditor() {
  if (editor.value && !confirm('确定清空编辑器内容？此操作不可撤销。')) return;
  editor.value = '';
  updateLineNumbers();
  autoSave();
  closeOutput();
}
