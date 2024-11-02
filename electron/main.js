import { app, BrowserWindow, screen, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import { spawn } from 'child_process';
import log from 'electron-log';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let apiProcess;
let tray = null;
let mainWindow = null;
const store = new Store();

function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    const windowWidth = Math.min(1280, screenWidth * 0.8);  // 窗口宽度
    const windowHeight = Math.min(900, screenHeight * 0.9); // 窗口高度

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: Math.floor((screenWidth - windowWidth) / 2),  // 计算水平居中
        y: Math.floor((screenHeight - windowHeight) / 2), // 计算垂直居中
        titleBarStyle: 'hiddenInset',  // 使用兼容的隐藏样式
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'), // 使用 preload 脚本
            contextIsolation: true, // 启用上下文隔离
            nodeIntegration: false,
            enableRemoteModule: false, // 禁用 remote 模块
            sandbox: false, // 禁用沙盒模式，确保 preload 中的功能可用
        },
        icon: path.join(__dirname, '../build/icons/icon.png')
    });

    mainWindow.center();
    if (process.env.NODE_ENV == 'development') {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.webContents.on('dom-ready', () => {
        console.log('DOM Ready');
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });

    // 隐藏滚动条
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page Loaded Successfully');
        mainWindow.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
        if (!store.get('disclaimerAccepted')) {
            mainWindow.webContents.send('show-disclaimer');
        }
    });

    // 处理窗口关闭事件，最小化到托盘而不是退出
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();  // 隐藏窗口
        }
    });
}

// 创建托盘图标
function createTray() {
    if (process.env.NODE_ENV == 'development') {
        tray = new Tray(path.join(__dirname, '../build/icons/tray-icon.png'));
    } else {
        tray = new Tray(path.join(process.resourcesPath, 'icons/tray-icon.png'));
    }


    const contextMenu = Menu.buildFromTemplate([
        { label: '显示', click: () => mainWindow.show() },
        {
            label: '退出', click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('MoeKoe Music');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow.show();
    });
}

app.on('ready', () => {
    try {
        let apiPath = '';
        if (process.env.NODE_ENV == 'development') {
            apiPath = path.join(__dirname, '../api/app_api');
        } else {
            // 生产环境下，针对不同平台设置 API 路径
            switch (process.platform) {
                case 'win32':
                    apiPath = path.join(process.resourcesPath, '../api/app_win.exe');
                    break;
                case 'darwin':
                    apiPath = path.join(process.resourcesPath, '../api/app_macos');
                    break;
                case 'linux':
                    apiPath = path.join(process.resourcesPath, '../api/app_linux');
                    break;
                default:
                    throw new Error(`Unsupported platform: ${process.platform}`);
            }
        }
        log.info(`API路径: ${apiPath}`);

        // 启动 API 服务器，隐藏窗口
        apiProcess = spawn(apiPath, [], { windowsHide: true });

        apiProcess.stdout.on('data', (data) => {
            log.info(`API输出: ${data}`);
            if (data.toString().includes('running')) { // 替换为 API 启动成功的实际标志信息
                createWindow();
            }
        });

        apiProcess.stderr.on('data', (data) => {
            log.error(`API 错误: ${data}`);
        });

        apiProcess.on('close', (code) => {
            log.info(`API 关闭，退出码: ${code}`);
        });

        apiProcess.on('error', (error) => {
            alert('后台服务启动失败!')
            log.error('启动 API 失败:', error);
        });

        // setTimeout(() => {
        //     createWindow();
        // }, 500);

        createTray();

    } catch (error) {
        log.error('启动 API Server 时出错:', error);
    }
});

app.on('before-quit', () => {
    // 关闭API服务器
    if (apiProcess) apiProcess.kill();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
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