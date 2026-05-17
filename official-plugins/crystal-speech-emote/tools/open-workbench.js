/**
 * tools/open-workbench.js
 * 打开晶花发言预览工作台
 */
const name = 'open-workbench';
const description = '在浏览器中打开晶花发言预览工作台。支持实时编辑、助手切换、一键复制 LaTeX。';

const parameters = {
  type: 'object',
  properties: {}
};

async function execute(input, ctx) {
  return JSON.stringify({
    message: '点击下方链接在浏览器中打开预览工作台',
    url: 'http://localhost:8903/_crystal_workbench.html',
    localPath: 'W:\\Games\\Hanako\\Work\\_crystal_workbench.html',
    tip: '双击 localPath 文件也可直接打开'
  }, null, 2);
}

export { name, description, parameters, execute };
