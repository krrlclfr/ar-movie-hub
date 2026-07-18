const { app, BrowserWindow, Menu, screen } = require('electron')
const path = require('node:path')

Menu.setApplicationMenu(null)

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    show: true,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    icon: path.resolve(__dirname, '..', 'public', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
      nativeWindowOpen: false,
    },
  })

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== 'http://127.0.0.1:3002') {
      event.preventDefault()
    }
  })

  const loadUrl = 'http://127.0.0.1:3002'
  const loadPath = path.join(__dirname, '..', 'dist', 'index.html')

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(loadPath)
  } else {
    win.loadURL(loadUrl)
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
