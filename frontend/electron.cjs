const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'public/icon-512x512.png')
  });

  // Check if we are in development mode
  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, load the Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // During dev, assume backend is already running or start it via maven
    console.log("Starting backend in dev mode via maven...");
    const backendDir = path.join(__dirname, '..', 'backend');
    const mvnCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
    
    backendProcess = spawn(mvnCommand, ['spring-boot:run'], {
      cwd: backendDir,
      shell: true
    });
  } else {
    // In production, run the packaged jar
    // We assume the jar is placed in a known location relative to the app
    const jarPath = path.join(process.resourcesPath, 'lan-file-share-backend.jar');
    backendProcess = spawn('java', ['-jar', jarPath]);
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  // Kill the backend process when the app closes
  if (backendProcess) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill();
    }
  }
});
