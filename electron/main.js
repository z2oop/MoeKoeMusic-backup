import { app, ipcMain, globalShortcut, dialog } from 'electron';
import { createWindow, createTray, startApiServer, stopApiServer, registerShortcut, playStartupSound } from './appServices.js';
import Store from 'electron-store';

let mainWindow = null;
const store = new Store();

app.on('ready', () => {
    startApiServer().then(() => {
        mainWindow = createWindow();
        mainWindow.webContents.on('did-finish-load', () => {
            createTray(mainWindow);
        });
        playStartupSound();
        registerShortcut();
    }).catch((error) => {
        createTray(null);
        dialog.showMessageBox({
            type: 'error',
            title: '错误',
            message: 'API 服务启动失败，请检查！',
            buttons: ['确定']
        }).then(result => {
            if (result.response === 0) {
                app.isQuitting = true;
                app.quit();
            }
            return;
        });
    });
});

// 即将退出
app.on('before-quit', () => {
    if (mainWindow) {
        const windowBounds = mainWindow.getBounds();
        store.set('windowState', windowBounds);
    }
    stopApiServer();
});
// 关闭所有窗口
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit(); // 非 macOS 系统上关闭所有窗口后退出应用
    }
});
// 图标被点击 Mac上
app.on('activate', () => {
    if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
    } else if (!mainWindow) {
        mainWindow = createWindow();
    }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('Unhandled Exception:', error);
});

// 监听渲染进程发送的免责声明结果
ipcMain.on('disclaimer-response', (event, accepted) => {
    if (accepted) {
        store.set('disclaimerAccepted', true);
    } else {
        app.quit();
    }
});

ipcMain.on('window-control', (event, action) => {
    switch (action) {
        case 'close':
            mainWindow.close();
            break;
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
            break;
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
ipcMain.on('save-settings', (event, settings) => {
    store.set('settings', settings);
});