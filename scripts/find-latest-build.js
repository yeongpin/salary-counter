const fs = require('fs-extra');
const path = require('path');

// Find the latest build files
async function findLatestBuild() {
  try {
    // Possible build directories
    const possibleDirs = [
      path.resolve(__dirname, '../dist'),
      path.resolve(__dirname, '../src/renderer/dist'),
      path.resolve(process.cwd(), 'dist'),
      path.resolve(process.cwd(), 'src/renderer/dist')
    ];
    
    console.log('Searching for build files...');
    
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        console.log(`Found directory: ${dir}`);
        const files = fs.readdirSync(dir);
        console.log(`Files in ${dir}:`, files);
        
        // Check for assets directory
        const assetsDir = path.join(dir, 'assets');
        if (fs.existsSync(assetsDir)) {
          const assetFiles = fs.readdirSync(assetsDir);
          console.log(`Files in ${assetsDir}:`, assetFiles);
        }
      }
    }
  } catch (err) {
    console.error('Error finding build files:', err);
  }
}

findLatestBuild(); 