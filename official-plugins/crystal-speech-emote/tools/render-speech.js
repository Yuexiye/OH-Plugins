/**
 * render-speech.js
 * 晶花发言格式渲染工具
 *
 * 输入：助手 ID、情绪/语气、英文句子、中文注释
 * 输出：LaTeX 花体格式（Hanako 对话可直接渲染）+ 纯文本 fallback + 表情包路径
 */
import fs from 'fs';
import path from 'path';

const name = 'render-speech';
const description = `晶花发言格式渲染工具。输入助手 ID、情绪、英文句子和中文注释，返回 LaTeX 花体格式（Hanako 对话直接渲染）和纯文本 fallback。`;

const parameters = {
  type: 'object',
  properties: {
    agentId: {
      type: 'string',
      description: '助手 ID，如 rebecca/ophelia/aimis/luoqixi'
    },
    tone: {
      type: 'string',
      description: '情绪/语气，如 开心、不爽、调侃、认真、温柔'
    },
    english: {
      type: 'string',
      description: '英文花体句子内容'
    },
    chinese: {
      type: 'string',
      description: '中文注释/翻译'
    },
    deco: {
      type: 'string',
      description: '装饰符号，如 ❀ ✦ ♡ ☆。省略则默认 ❀',
      default: '❀'
    },
    format: {
      type: 'string',
      enum: ['latex', 'text', 'both'],
      description: '输出格式：latex(LaTeX格式，Hanako对话可渲染)、text(仅纯文本)、both(两者)',
      default: 'both'
    }
  },
  required: ['agentId', 'tone', 'english', 'chinese']
};

async function execute(input, ctx) {
  const { agentId, tone, english, chinese, deco = '❀', format = 'both' } = input;

  // 加载助手配置
  let agentsConfig = {};
  try {
    const configPath = path.resolve(ctx.pluginDir, 'data', 'agents.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    agentsConfig = JSON.parse(raw);
  } catch (e) {
    // fallback
  }

  const agent = agentsConfig[agentId] || getDefaultAgent(agentId);
  const theme = agent.theme || {};
  const primaryColor = theme.primary || '#ff314f';
  const secondaryColor = theme.secondary || '#ff8a9a';
  const subColor = theme.subColor || '#b0b0b0';
  const enSize = theme.enSize || 'large';
  const cnSize = theme.cnSize || 'small';

  // 查找表情包
  let emotePath = null;
  let emoteToneId = null;
  if (agent.toneMap && agent.emotes) {
    emoteToneId = agent.toneMap[tone] || null;
    if (emoteToneId && agent.emotes[emoteToneId]) {
      emotePath = agent.emotes[emoteToneId];
    }
  }

  const result = {};

  // LaTeX 格式（Hanako 对话可直接渲染）
  if (format === 'latex' || format === 'both') {
    const latexEscapedEnglish = latexEscape(english);
    const latexEscapedChinese = latexEscape(chinese);

    result.latex =
      `\\({\\${enSize} \\textcolor{${primaryColor}}{\\text{${deco}}} ` +
      `\\underset{\\textcolor{${subColor}}{\\text{\\${cnSize} ${latexEscapedChinese}}}}{\\textcolor{${primaryColor}}{\\underline{\\mathscr{${latexEscapedEnglish}}}}}}\\)`;
  }

  // 纯文本 fallback
  if (format === 'text' || format === 'both') {
    result.text = `${deco} ${english}\n— ${chinese}`;
  }

  if (emotePath) {
    result.emote = {
      path: emotePath,
      tone: tone,
      toneId: emoteToneId
    };
  }

  // 表情包路径（用于 stage_files）
  if (emotePath) {
    const emoteFullPath = path.resolve(ctx.pluginDir, emotePath);
    if (fs.existsSync(emoteFullPath)) {
      result.emoteFile = emoteFullPath;
    }
  }

  result.agent = {
    id: agentId,
    displayName: agent.displayName || agentId,
    primaryColor
  };

  return JSON.stringify(result, null, 2);
}

function latexEscape(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/_/g, '\\_')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde ')
    .replace(/\^/g, '\\textasciicircum ');
}

function getDefaultAgent(id) {
  return {
    displayName: id,
    theme: {
      primary: '#ff314f',
      primaryGlow: 'rgba(255,49,79,0.4)',
      secondary: '#ff8a9a',
      font: "'Dancing Script','Brush Script MT',cursive",
      cnFont: 'system-ui,sans-serif',
      subColor: '#b0b0b0',
      enSize: 'large',
      cnSize: 'small'
    },
    emotes: {},
    toneMap: {}
  };
}

export { name, description, parameters, execute };
