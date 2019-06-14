const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
// 初始化一个窗口对象
let mainWindow;

function createWindow() {
  // 创建窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "img/logo.png"),
    // 设置为true才能使用node的模块
    webPreferences: {
      nodeIntegration: true
    }
  });

  // loadFile
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
  mainWindow.webContents.openDevTools();
}

// app为主线程
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
