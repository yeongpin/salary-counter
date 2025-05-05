const { BrowserWindow, screen } = require('electron');
const path = require('path');

function createWindow() {
  // Get screen dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: Math.min(900, width * 0.8),
    height: Math.min(700, height * 0.8),
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#f5f7fa',
    show: false
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:2512');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

module.exports = { createWindow }; 