const fs = require('fs-extra');
const path = require('path');

// 复制构建目录内容到 public 目录
async function copyBuildToPublic() {
  try {
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    
    // 检查更多可能的构建输出路径
    const possibleBuildDirs = [
      path.resolve(__dirname, '../dist'),
      path.resolve(__dirname, '../src/renderer/dist'),
      path.resolve(process.cwd(), 'dist'),
      path.resolve(process.cwd(), 'src/renderer/dist'),
      // 添加更多可能的路径
      path.resolve(__dirname, '../../dist'),
      path.resolve(__dirname, '../../../dist')
    ];
    
    console.log('Checking possible build directories:');
    possibleBuildDirs.forEach(dir => {
      const exists = fs.existsSync(dir);
      console.log(`- ${dir}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    });
    
    let buildDir = null;
    
    // 找到实际存在的构建目录
    for (const dir of possibleBuildDirs) {
      if (fs.existsSync(dir)) {
        buildDir = dir;
        break;
      }
    }
    
    if (!buildDir) {
      // 如果找不到构建目录，我们可以尝试直接复制 public 中的资源文件
      console.log('Build directory not found. Checking if public directory already has assets...');
      const publicDir = path.resolve(__dirname, '../public');
      const publicAssetsDir = path.resolve(publicDir, 'assets');
      
      if (fs.existsSync(publicAssetsDir)) {
        console.log('Public assets directory exists. No need to copy files.');
        return;
      }
      
      throw new Error('Build directory not found and public/assets does not exist. Please check your build configuration.');
    }
    
    const publicDir = path.resolve(__dirname, '../public');
    
    // 确保目录存在
    await fs.ensureDir(publicDir);
    
    // 复制文件
    console.log(`Copying files from ${buildDir} to ${publicDir}...`);
    await fs.copy(buildDir, publicDir, {
      overwrite: true
    });
    
    console.log(`Successfully copied build files from ${buildDir} to public directory`);
  } catch (err) {
    console.error('Error copying files:', err);
    // 列出当前目录内容，帮助调试
    try {
      const currentDirContents = fs.readdirSync(process.cwd());
      console.log('Current directory contents:', currentDirContents);
      
      if (fs.existsSync(path.join(process.cwd(), 'src'))) {
        const srcContents = fs.readdirSync(path.join(process.cwd(), 'src'));
        console.log('src directory contents:', srcContents);
        
        if (fs.existsSync(path.join(process.cwd(), 'src/renderer'))) {
          const rendererContents = fs.readdirSync(path.join(process.cwd(), 'src/renderer'));
          console.log('src/renderer directory contents:', rendererContents);
        }
      }
    } catch (e) {
      console.error('Error listing directory contents:', e);
    }
  }
}

copyBuildToPublic(); 