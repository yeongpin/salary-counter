const { globalShortcut } = require('electron');

function registerShortcuts(mainWindow) {
  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow.webContents.toggleDevTools();
  });

  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.webContents.reload();
  });

  globalShortcut.register('F11', () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  });
}

module.exports = { registerShortcuts }; 