const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchPython: () => ipcRenderer.invoke('run-script')
});
