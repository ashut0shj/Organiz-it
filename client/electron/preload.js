const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchPython: () => ipcRenderer.invoke('run-script'),
  openExternal: (url) => shell.openExternal(url)
});
