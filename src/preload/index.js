const { contextBridge, ipcRenderer } = require('electron');

// 確保所有方法都正確暴露
contextBridge.exposeInMainWorld('electron', {
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  getAlwaysOnTopState: () => ipcRenderer.invoke('get-always-on-top-state'),
  minimize: () => ipcRenderer.send('minimize-window'),
  quit: () => ipcRenderer.send('quit-app'),
});

contextBridge.exposeInMainWorld('electronAPI', {
  // ... 其他 API ...
}); 