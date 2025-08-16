const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Your Original Functions ---
  launchPython: () => ipcRenderer.invoke('run-script'),
  openExternal: (url) => shell.openExternal(url),

  // --- New Functions for Google OAuth ---
  // Function to tell the main process to start the login flow
  startGoogleLogin: () => ipcRenderer.send('start-google-login'),

  // Function to listen for the authorization code from the main process
  onGoogleOAuthCode: (callback) => {
    const listener = (_event, code) => callback(code);
    ipcRenderer.on('google-oauth-code', listener);
    // Return a function to remove the listener for cleanup
    return () => ipcRenderer.removeListener('google-oauth-code', listener);
  },
});
