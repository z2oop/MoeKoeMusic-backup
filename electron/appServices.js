import { app, BrowserWindow, screen, Tray, Menu, globalShortcut } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import log from 'electron-log';
import Store from 'electron-store';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import fs from 'fs';
import kill from 'tree-kill';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const store = new Store();
let mainWindow = null;
let apiProcess = null;
let tray = null;

// 创建主窗口
export function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    const windowWidth = Math.min(1200, screenWidth * 0.8);
    const windowHeight = Math.min(938, screenHeight * 0.9);
    const lastWindowState = store.get('windowState') || {};
    mainWindow = new BrowserWindow({
        width: lastWindowState.width || windowWidth,
        height: lastWindowState.height || windowHeight,
        x: lastWindowState.x || Math.floor((screenWidth - windowWidth) / 2),
        y: lastWindowState.y || Math.floor((screenHeight - windowHeight) / 2),
        minWidth: 980,
        minHeight: 800,
        frame: false,
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: true
        },
        icon: isDev
            ? path.join(__dirname, '../build/icons/icon.ico')
            : path.join(process.resourcesPath, 'icons', 'icon.ico')
    });

    if (isDev) {
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

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page Loaded Successfully');
        mainWindow.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
        if (!store.get('disclaimerAccepted')) {
            mainWindow.webContents.send('show-disclaimer');
        }
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
    
    const savedConfig = store.get('settings');
    if(savedConfig?.desktopLyrics === 'on'){
        createLyricsWindow();
    }
    return mainWindow;
}

let lyricsWindow;

export function createLyricsWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 800;
    const windowHeight = 150;
    
    lyricsWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: Math.floor((screenWidth - windowWidth) / 2), 
        y: screenHeight - windowHeight, 
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        resizable: false,
        skipTaskbar: true,
        hasShadow: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'), 
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: true
        }
    });
    mainWindow.lyricsWindow = lyricsWindow;
    if (isDev) {
        lyricsWindow.loadURL('http://localhost:8080/#/lyrics');
        lyricsWindow.webContents.openDevTools();
    } else {
        lyricsWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
            hash: 'lyrics'
        });
    }

    // 设置窗口置顶级别
    lyricsWindow.setAlwaysOnTop(true, 'screen-saver');
    
    // 允许窗口透明
    lyricsWindow.setBackgroundColor('#00000000');
}

// 创建托盘图标及菜单
export function createTray(mainWindow) {
    const trayIconPath = isDev
        ? path.join(__dirname, '../build/icons/tray-icon.png')
        : ((process.platform === 'win32') ? path.join(process.resourcesPath, 'icons', 'tray-icon.ico') : path.join(process.resourcesPath, 'icons', 'tray-icon.png'));

    tray = new Tray(trayIconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示/隐藏', accelerator: 'CmdOrCtrl+Shift+S', click: () => {
                if (mainWindow) {
                    if (mainWindow.isVisible()) {
                        mainWindow.hide();
                    } else {
                        mainWindow.show();
                    }
                }
            }
        },
        {
            label: '退出程序',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('MoeKoe Music');
    tray.on('right-click', () => {
        tray.popUpContextMenu(contextMenu);
    });
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
    tray.on('double-click', () => {
        mainWindow.show();
    });
    return tray;
}

// 启动 API 服务器
export function startApiServer() {
    return new Promise((resolve, reject) => {
        let apiPath = '';
        if (isDev) {
            return resolve();
            // apiPath = path.join(__dirname, '../api/app_api');
        } else {
            switch (process.platform) {
                case 'win32':
                    apiPath = path.join(process.resourcesPath, '../api', 'app_win.exe');
                    break;
                case 'darwin':
                    apiPath = path.join(process.resourcesPath, '../api', 'app_macos');
                    break;
                case 'linux':
                    apiPath = path.join(process.resourcesPath, '../api', 'app_linux');
                    break;
                default:
                    reject(new Error(`Unsupported platform: ${process.platform}`));
                    return;
            }
        }

        log.info(`API路径: ${apiPath}`);

        if (!fs.existsSync(apiPath)) {
            const error = new Error(`API可执行文件未找到：${apiPath}`);
            log.error(error.message);
            reject(error);
            return;
        }

        // 启动 API 服务器进程
        apiProcess = spawn(apiPath, [], { windowsHide: true });

        apiProcess.stdout.on('data', (data) => {
            log.info(`API输出: ${data}`);
            if (data.toString().includes('running')) {
                console.log('API服务器已启动');
                resolve();
            }
        });

        apiProcess.stderr.on('data', (data) => {
            log.error(`API 错误: ${data}`);
        });

        apiProcess.on('close', (code) => {
            log.info(`API 关闭，退出码: ${code}`);
        });

        apiProcess.on('error', (error) => {
            log.error('启动 API 失败:', error);
            reject(error);
        });
    });
}

// 停止 API 服务器
export function stopApiServer() {
    if (apiProcess) {
        kill(apiProcess.pid);
        apiProcess = null;
    }
}

// 注册快捷键
export function registerShortcut() {
    if (process.platform === 'darwin') {
        app.on('before-quit', () => { app.isQuitting = true; });
    } else {
        globalShortcut.register('CmdOrCtrl+Q', () => {
            app.isQuitting = true;
            app.quit();
        });
    }
    globalShortcut.register('CmdOrCtrl+Shift+S', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
            }
        }
    });

    globalShortcut.register('MediaPreviousTrack', () => {
        mainWindow.webContents.send('play-previous-track');
    });
    globalShortcut.register('MediaNextTrack', () => {
        mainWindow.webContents.send('play-next-track');
    });
    globalShortcut.register('Alt+CommandOrControl+Left', () => {
        mainWindow.webContents.send('play-previous-track');
    });
    globalShortcut.register('Alt+CommandOrControl+Right', () => {
        mainWindow.webContents.send('play-next-track');
    });
    globalShortcut.register('Alt+CommandOrControl+Up', () => {
        mainWindow.webContents.send('volume-up');
    });
    globalShortcut.register('Alt+CommandOrControl+Down', () => {
        mainWindow.webContents.send('volume-down');
    });
    globalShortcut.register('MediaPlayPause', () => {
        mainWindow.webContents.send('toggle-play-pause');
    });
    globalShortcut.register('Alt+CommandOrControl+Space', () => {
        mainWindow.webContents.send('toggle-play-pause'); 
    });
}
// 播放启动问候语
export function playStartupSound() {
    const savedConfig = store.get('settings');
    if (!savedConfig || (savedConfig['greetings'] !== 'on' && savedConfig['greetings'] !== 'null')) {
        return;
    }
    const audioFiles = [
        '/assets/sound/yise-jp.mp3',
        '/assets/sound/qiqi-jp.mp3',
        '/assets/sound/qiqi-zh.mp3'
    ];
    const randomIndex = Math.floor(Math.random() * audioFiles.length);
    const soundPath = isDev 
        ? path.join(__dirname, '..', 'public', audioFiles[randomIndex])
        : path.join(process.resourcesPath, 'public', audioFiles[randomIndex]);
    try {
        switch (process.platform) {
            case 'win32':
                exec(`powershell -c (New-Object Media.SoundPlayer '${soundPath}').PlaySync()`);
                break;
            case 'darwin':
                exec(`afplay "${soundPath}"`);
                break;
            case 'linux':
                exec(`paplay "${soundPath}"`, (error) => {
                    if (error) {
                        exec(`play "${soundPath}"`);
                    }
                });
                break;
        }
    } catch (error) {
        console.error('播放启动问候语失败:', error);
    }
}