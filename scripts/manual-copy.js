const fs = require('fs-extra');
const path = require('path');

// 手动创建必要的文件
async function manualCopy() {
  try {
    const publicDir = path.resolve(__dirname, '../public');
    const assetsDir = path.resolve(publicDir, 'assets');
    
    // 确保目录存在
    await fs.ensureDir(publicDir);
    await fs.ensureDir(assetsDir);
    
    // 检查 public/index.html 是否存在
    const indexHtmlPath = path.resolve(publicDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      // 如果不存在，从 src/renderer/index.html 复制
      const srcIndexHtml = path.resolve(__dirname, '../src/renderer/index.html');
      if (fs.existsSync(srcIndexHtml)) {
        await fs.copy(srcIndexHtml, indexHtmlPath);
        console.log('Copied index.html from src/renderer to public');
      } else {
        console.log('Source index.html not found, creating a basic one');
        // 创建一个基本的 index.html
        const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salary Calculator</title>
  <script type="module" src="./assets/index.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;
        await fs.writeFile(indexHtmlPath, basicHtml);
        console.log('Created basic index.html in public directory');
      }
    }
    
    console.log('Manual copy completed successfully');
  } catch (err) {
    console.error('Error during manual copy:', err);
  }
}

manualCopy(); 