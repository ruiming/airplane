const electron = require('electron');
const app = require('app');
const BrowserWindow = require('browser-window');
var mainWindow = null;


function createWindow() {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 620,
        height: 840,
        center: true,
        minWidth: 600,
        minHeight: 800,
        resizable: false,
        title: "飞机大战",
        fullscreen: false
    });

    // 加载应用的 index.html。
    mainWindow.loadUrl(`file://${__dirname}/index.html`);

    // 启用开发工具。
    // mainWindow.webContents.openDevTools();

    // 当 window 被关闭，这个事件会被触发。
    mainWindow.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null;
});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    app.quit();
}
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
    createWindow();
}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.