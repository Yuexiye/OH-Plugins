/**
 * routes/page.js
 *
 * 插件页面路由 — 用 external.open 弹出浏览器
 */
export default function (app, ctx) {
  const workbenchUrl = 'http://localhost:8903/_crystal_workbench.html';

  app.get('/page', (c) => {
    return c.html(`<!doctype html>
<html>
<head><meta charset="utf-8">
<title>晶花预览 · 打开中…</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;color:#888;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;padding:20px;text-align:center}
h1{color:#ff69b4;font-family:cursive;font-size:24px;margin-bottom:12px}
p{font-size:13px;color:#666;line-height:1.8}
a{color:#ff69b4;margin-top:20px;display:inline-block;font-size:14px}
.btn{background:#ff69b4;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:14px;cursor:pointer;margin-top:16px}
</style>
</head>
<body>
<h1>❀ 晶花发言预览</h1>
<p>点击下方按钮在浏览器中打开预览工作台</p>
<button class="btn" onclick="openWorkbench()">打开预览工作台</button>
<p><a href="${workbenchUrl}" target="_blank">${workbenchUrl}</a></p>
<script>
function openWorkbench() {
  // 尝试通过 host 能力打开
  if (window.__HANA__ && window.__HANA__.external && window.__HANA__.external.open) {
    window.__HANA__.external.open('${workbenchUrl}');
  } else if (window.hana && window.hana.external && window.hana.external.open) {
    window.hana.external.open('${workbenchUrl}');
  } else {
    // fallback: 直接跳转
    window.location.href = '${workbenchUrl}';
  }
}
// 自动尝试
setTimeout(openWorkbench, 500);
</script>
</body></html>`);
  });

  app.get('/widget', (c) => c.redirect(workbenchUrl));
}
