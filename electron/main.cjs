const { app, BrowserWindow } = require("electron")
const fs = require("fs")
const http = require("http")
const path = require("path")

const isDev = !app.isPackaged
let localServer
let appUrl = "http://localhost:5173"

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
}

async function startStaticServer() {
  const distDir = path.join(__dirname, "..", "dist")

  localServer = http.createServer((request, response) => {
    const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0]
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "")
    let filePath = path.join(distDir, safePath)

    if (!filePath.startsWith(distDir)) {
      response.writeHead(403)
      response.end("Forbidden")
      return
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html")
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(500)
        response.end("Internal Server Error")
        return
      }

      response.writeHead(200, { "Content-Type": getMimeType(filePath) })
      response.end(data)
    })
  })

  await new Promise((resolve) => {
    localServer.listen(0, "127.0.0.1", () => resolve())
  })

  const address = localServer.address()
  appUrl = `http://127.0.0.1:${address.port}`
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: "#131313",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("did-fail-load", { errorCode, errorDescription, validatedURL })
  })

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("render-process-gone", details)
  })

  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log("renderer-console", { level, message, line, sourceId })
  })

  if (isDev) {
    mainWindow.loadURL(appUrl)
  } else {
    mainWindow.loadURL(appUrl)
  }
}

app.whenReady().then(async () => {
  if (!isDev) {
    await startStaticServer()
  }

  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (localServer) {
    localServer.close()
  }
  if (process.platform !== "darwin") {
    app.quit()
  }
})
