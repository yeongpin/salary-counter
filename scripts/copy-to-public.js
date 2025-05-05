const fs = require('fs-extra');
const path = require('path');

// 定义源目录和目标目录
const sourceDir = path.join(__dirname, '../dist');
const targetDir = path.join(__dirname, '../public');

// 确保目标目录存在
fs.ensureDirSync(targetDir);

// 复制文件
console.log(`Copying build files from ${sourceDir} to ${targetDir}...`);

try {
  // 清空目标目录
  fs.emptyDirSync(targetDir);
  
  // 复制所有文件
  fs.copySync(sourceDir, targetDir);
  
  console.log('Build files copied successfully!');
} catch (err) {
  console.error('Error copying build files:', err);
  process.exit(1);
} 