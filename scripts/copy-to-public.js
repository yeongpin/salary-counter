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
        // 即使不需要复制构建文件，我们仍然需要复制 logo.png
        await copyLogoFile();
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
    
    // 复制 logo.png 文件
    await copyLogoFile();
    
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

// 复制 logo.png 文件的函数
async function copyLogoFile() {
  try {
    const publicImageDir = path.resolve(__dirname, '../public/image');
    
    // 确保 public/image 目录存在
    await fs.ensureDir(publicImageDir);
    
    console.log('Searching for logo file...');
    
    // 可能的 logo.png 源文件位置 (添加更多可能的文件名和路径)
    const possibleLogoPaths = [
      // 使用原始文件名 @logo.png
      path.resolve(__dirname, '../src/renderer/@logo.png'),
      path.resolve(__dirname, '../src/@logo.png'),
      path.resolve(__dirname, '../@logo.png'),
      path.resolve(process.cwd(), '@logo.png'),
      path.resolve(process.cwd(), 'src/renderer/@logo.png'),
      
      // 使用 logo.png 文件名
      path.resolve(__dirname, '../src/renderer/logo.png'),
      path.resolve(__dirname, '../src/logo.png'),
      path.resolve(__dirname, '../logo.png'),
      path.resolve(process.cwd(), 'logo.png'),
      path.resolve(process.cwd(), 'src/renderer/logo.png'),
      
      // 检查 assets 目录
      path.resolve(__dirname, '../src/renderer/assets/@logo.png'),
      path.resolve(__dirname, '../src/assets/@logo.png'),
      path.resolve(__dirname, '../assets/@logo.png'),
      path.resolve(process.cwd(), 'assets/@logo.png'),
      path.resolve(process.cwd(), 'src/renderer/assets/@logo.png'),
      
      // 检查 image 目录
      path.resolve(__dirname, '../src/renderer/image/@logo.png'),
      path.resolve(__dirname, '../src/image/@logo.png'),
      path.resolve(__dirname, '../image/@logo.png'),
      path.resolve(process.cwd(), 'image/@logo.png'),
      path.resolve(process.cwd(), 'src/renderer/image/@logo.png'),
      
      // 检查 icon.png
      path.resolve(__dirname, '../src/renderer/icon.png'),
      path.resolve(__dirname, '../src/icon.png'),
      path.resolve(__dirname, '../icon.png'),
      path.resolve(process.cwd(), 'icon.png'),
      path.resolve(process.cwd(), 'src/renderer/icon.png'),
      
      // 检查 image 目录中的 icon.png
      path.resolve(__dirname, '../src/renderer/image/icon.png'),
      path.resolve(__dirname, '../src/image/icon.png'),
      path.resolve(__dirname, '../image/icon.png'),
      path.resolve(process.cwd(), 'image/icon.png'),
      path.resolve(process.cwd(), 'src/renderer/image/icon.png')
    ];
    
    // 查找存在的 logo 文件
    let logoPath = null;
    for (const p of possibleLogoPaths) {
      if (fs.existsSync(p)) {
        logoPath = p;
        console.log(`Found logo file at: ${p}`);
        break;
      }
    }
    
    if (logoPath) {
      // 复制 logo 文件到 public/image 目录
      const destLogoPath = path.resolve(publicImageDir, 'icon.png');
      await fs.copy(logoPath, destLogoPath);
      console.log(`Successfully copied logo from ${logoPath} to ${destLogoPath}`);
    } else {
      console.warn('Warning: Logo file not found in any of the expected locations');
      
      // 列出当前目录和一些关键目录的内容，帮助找到 logo 文件
      console.log('Listing directories to help locate the logo file:');
      
      const dirsToCheck = [
        process.cwd(),
        path.join(process.cwd(), 'src'),
        path.join(process.cwd(), 'src/renderer'),
        path.join(process.cwd(), 'image'),
        path.join(process.cwd(), 'assets'),
        path.join(process.cwd(), 'src/image'),
        path.join(process.cwd(), 'src/assets'),
        path.join(process.cwd(), 'src/renderer/image'),
        path.join(process.cwd(), 'src/renderer/assets')
      ];
      
      for (const dir of dirsToCheck) {
        if (fs.existsSync(dir)) {
          try {
            const files = fs.readdirSync(dir);
            console.log(`Contents of ${dir}:`, files);
            
            // 查找可能的 logo 文件
            const logoFiles = files.filter(file => 
              file.includes('logo') || 
              file.includes('icon') || 
              file.startsWith('@')
            );
            
            if (logoFiles.length > 0) {
              console.log(`Potential logo files in ${dir}:`, logoFiles);
              
              // 尝试复制第一个找到的可能的 logo 文件
              const firstLogoFile = path.join(dir, logoFiles[0]);
              const destLogoPath = path.resolve(publicImageDir, 'icon.png');
              await fs.copy(firstLogoFile, destLogoPath);
              console.log(`Copied potential logo file from ${firstLogoFile} to ${destLogoPath}`);
              return;
            }
          } catch (e) {
            console.error(`Error reading directory ${dir}:`, e);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error copying logo file:', err);
  }
}

copyBuildToPublic();