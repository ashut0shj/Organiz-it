const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const url = require('url');

let backendProcess;
let mainWindow;

let authServer;

function startAuthServer(authWindow) {
  return new Promise((resolve, reject) => {
    authServer = http.createServer((req, res) => {
      const queryObject = url.parse(req.url, true).query;
      if (queryObject.code) {
        mainWindow.webContents.send('google-oauth-code', queryObject.code);
        res.end('<h1>Authentication successful!</h1><p>You can close this window now.</p>');
        authWindow.close();
        authServer.close();
        resolve(queryObject.code);
      } else {
        res.end('Authentication failed.');
        authWindow.close();
        authServer.close();
        reject(new Error('No authorization code received.'));
      }
    }).listen(54321, 'localhost');
  });
}

ipcMain.on('start-google-login', () => {
  const clientId = '790145978088-ucvbkj8udlh07lckiq7hbv4enu7qa60p.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:54321';
  const scope = 'email profile openid';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  let authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  authWindow.loadURL(authUrl);
  startAuthServer(authWindow);

  authWindow.on('closed', () => {
    authWindow = null;
    if (authServer) authServer.close();
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }
}

function startBackend() {
  // Correctly use 'main.exe' as the executable name
  const devBackendPath = path.join(__dirname, '../app-backend/dist/main.exe');
  const prodBackendPath = path.join(process.resourcesPath, 'backend', 'main.exe');
  const exePath = app.isPackaged ? prodBackendPath : devBackendPath;

  console.log(`[Backend] Attempting to start backend from: ${exePath}`);

  try {
    backendProcess = spawn(exePath);

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend STDOUT]: ${data.toString()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend STDERR]: ${data.toString()}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`[Backend] Process exited with code ${code}`);
    });

  } catch (error) {
    console.error('[Backend] Failed to start process:', error);
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
