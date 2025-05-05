const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { createWindow } = require('./windowManager');
const { registerShortcuts } = require('./shortcuts');

// Prevent garbage collection
let mainWindow;
let tray = null;

// Flag to control forced exit
let forceQuit = false;

// Register all IPC handlers
function registerIpcHandlers() {
  // Handle window control events
  ipcMain.handle('toggle-always-on-top', () => {
    const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
    return !isAlwaysOnTop;
  });

  ipcMain.handle('get-always-on-top-state', () => {
    return mainWindow.isAlwaysOnTop();
  });

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  // Modified exit logic
  ipcMain.on('quit-app', () => {
    forceQuit = true;
    if (tray) {
      tray.destroy();
    }
    app.quit();
    if (process.platform !== 'darwin') {
      app.exit(0);
    }
  });
}

function createTray() {
  // Use path.join to correctly handle paths
  const iconPath = path.join(__dirname, '../../src/assets/salary-calculator.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  try {
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show',
        click: () => mainWindow.show()
      },
      { type: 'separator' },
      { 
        label: 'Exit',
        click: () => {
          forceQuit = true;
          if (tray) {
            tray.destroy();
          }
          app.quit();
          if (process.platform !== 'darwin') {
            app.exit(0);
          }
        }
      }
    ]);
    
    tray.setToolTip('Salary Calculator');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow.show();
    });
  } catch (error) {
    console.error('Error creating tray:', error);
    // Use default values as fallback
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show',
        click: () => mainWindow.show()
      },
      { type: 'separator' },
      { 
        label: 'Exit',
        click: () => {
          forceQuit = true;
          if (tray) {
            tray.destroy();
          }
          app.quit();
          if (process.platform !== 'darwin') {
            app.exit(0);
          }
        }
      }
    ]);
    
    tray.setToolTip('Salary Calculator');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow.show();
    });
  }
}

function initialize() {
  app.whenReady().then(() => {
    mainWindow = createWindow();
    registerShortcuts(mainWindow);
    registerIpcHandlers();
    createTray();

    mainWindow.on('close', (event) => {
      if (!forceQuit) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (forceQuit) {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    forceQuit = true;
    if (tray) {
      tray.destroy();
    }
  });

  app.on('activate', () => {
    mainWindow.show();
  });
}

initialize(); 