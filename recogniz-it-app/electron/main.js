const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('run-script', () => {
    const pythonScriptPath = path.join(__dirname, '..', '..', 'app-backend', 'open_urls.py');
    const python = spawn('python', [pythonScriptPath]);

    python.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
      console.log(`Python script exited with code ${code}`);
    });
  });
});
