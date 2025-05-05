const fs = require('fs-extra');
const path = require('path');

// Clean build directories (dist and public)
async function cleanDirectories() {
  try {
    // Directories to clean
    const directories = [
      {
        path: path.resolve(__dirname, '../dist'),
        name: 'dist'
      },
      {
        path: path.resolve(__dirname, '../public'),
        name: 'public'
      }
    ];
    
    // Clean each directory
    for (const dir of directories) {
      console.log(`Cleaning directory: ${dir.path}`);
      
      // Check if directory exists
      if (fs.existsSync(dir.path)) {
        // Empty the directory
        await fs.emptyDir(dir.path);
        console.log(`Successfully cleaned ${dir.name} directory`);
      } else {
        console.log(`${dir.name} directory does not exist, creating it...`);
        await fs.ensureDir(dir.path);
        console.log(`Created empty ${dir.name} directory`);
      }
    }
    
    console.log('All directories cleaned successfully');
  } catch (err) {
    console.error('Error cleaning directories:', err);
  }
}

cleanDirectories(); 