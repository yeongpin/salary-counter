const fs = require('fs-extra');
const path = require('path');

// Copy build directory contents to public directory
async function copyBuildToPublic() {
  try {
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    
    // Check multiple possible build output paths
    const possibleBuildDirs = [
      path.resolve(__dirname, '../dist'),
      path.resolve(__dirname, '../src/renderer/dist'),
      path.resolve(process.cwd(), 'dist'),
      path.resolve(process.cwd(), 'src/renderer/dist'),
      // Add more possible paths
      path.resolve(__dirname, '../../dist'),
      path.resolve(__dirname, '../../../dist')
    ];
    
    console.log('Checking possible build directories:');
    possibleBuildDirs.forEach(dir => {
      const exists = fs.existsSync(dir);
      console.log(`- ${dir}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    });
    
    let buildDir = null;
    
    // Find the actual build directory that exists
    for (const dir of possibleBuildDirs) {
      if (fs.existsSync(dir)) {
        buildDir = dir;
        break;
      }
    }
    
    if (!buildDir) {
      // If build directory not found, try to directly copy resources from public
      console.log('Build directory not found. Checking if public directory already has assets...');
      const publicDir = path.resolve(__dirname, '../public');
      const publicAssetsDir = path.resolve(publicDir, 'assets');
      
      if (fs.existsSync(publicAssetsDir)) {
        console.log('Public assets directory exists. No need to copy files.');
        // Even if we don't need to copy build files, we still need to copy logo.png
        await copyLogoFile();
        return;
      }
      
      throw new Error('Build directory not found and public/assets does not exist. Please check your build configuration.');
    }
    
    const publicDir = path.resolve(__dirname, '../public');
    
    // Ensure directory exists
    await fs.ensureDir(publicDir);
    
    // Copy files
    console.log(`Copying files from ${buildDir} to ${publicDir}...`);
    await fs.copy(buildDir, publicDir, {
      overwrite: true
    });
    
    console.log(`Successfully copied build files from ${buildDir} to public directory`);
    
    // Copy logo.png file
    await copyLogoFile();
    
  } catch (err) {
    console.error('Error copying files:', err);
    // List current directory contents to help with debugging
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

// Function to copy logo.png file
async function copyLogoFile() {
  try {
    const publicImageDir = path.resolve(__dirname, '../public/image');
    
    // Ensure public/image directory exists
    await fs.ensureDir(publicImageDir);
    
    console.log('Searching for logo file...');
    
    // Possible logo.png source file locations (adding more possible filenames and paths)
    const possibleLogoPaths = [
      // Using original filename @logo.png
      path.resolve(__dirname, '../src/renderer/@logo.png'),
      path.resolve(__dirname, '../src/@logo.png'),
      path.resolve(__dirname, '../@logo.png'),
      path.resolve(process.cwd(), '@logo.png'),
      path.resolve(process.cwd(), 'src/renderer/@logo.png'),
      
      // Using logo.png filename
      path.resolve(__dirname, '../src/renderer/logo.png'),
      path.resolve(__dirname, '../src/logo.png'),
      path.resolve(__dirname, '../logo.png'),
      path.resolve(process.cwd(), 'logo.png'),
      path.resolve(process.cwd(), 'src/renderer/logo.png'),
      
      // Check assets directory
      path.resolve(__dirname, '../src/renderer/assets/@logo.png'),
      path.resolve(__dirname, '../src/assets/@logo.png'),
      path.resolve(__dirname, '../assets/@logo.png'),
      path.resolve(process.cwd(), 'assets/@logo.png'),
      path.resolve(process.cwd(), 'src/renderer/assets/@logo.png'),
      
      // Check image directory
      path.resolve(__dirname, '../src/renderer/image/@logo.png'),
      path.resolve(__dirname, '../src/image/@logo.png'),
      path.resolve(__dirname, '../image/@logo.png'),
      path.resolve(process.cwd(), 'image/@logo.png'),
      path.resolve(process.cwd(), 'src/renderer/image/@logo.png'),
      
      // Check icon.png
      path.resolve(__dirname, '../src/renderer/icon.png'),
      path.resolve(__dirname, '../src/icon.png'),
      path.resolve(__dirname, '../icon.png'),
      path.resolve(process.cwd(), 'icon.png'),
      path.resolve(process.cwd(), 'src/renderer/icon.png'),
      
      // Check image directory for icon.png
      path.resolve(__dirname, '../src/renderer/image/icon.png'),
      path.resolve(__dirname, '../src/image/icon.png'),
      path.resolve(__dirname, '../image/icon.png'),
      path.resolve(process.cwd(), 'image/icon.png'),
      path.resolve(process.cwd(), 'src/renderer/image/icon.png')
    ];
    
    // Find existing logo file
    let logoPath = null;
    for (const p of possibleLogoPaths) {
      if (fs.existsSync(p)) {
        logoPath = p;
        console.log(`Found logo file at: ${p}`);
        break;
      }
    }
    
    if (logoPath) {
      // Copy logo file to public/image directory
      const destLogoPath = path.resolve(publicImageDir, 'icon.png');
      await fs.copy(logoPath, destLogoPath);
      console.log(`Successfully copied logo from ${logoPath} to ${destLogoPath}`);
    } else {
      console.warn('Warning: Logo file not found in any of the expected locations');
      
      // List contents of current directory and some key directories to help find the logo file
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
            
            // Find potential logo files
            const logoFiles = files.filter(file => 
              file.includes('logo') || 
              file.includes('icon') || 
              file.startsWith('@')
            );
            
            if (logoFiles.length > 0) {
              console.log(`Potential logo files in ${dir}:`, logoFiles);
              
              // Try to copy the first potential logo file found
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