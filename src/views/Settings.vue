<template>
    <div class="settings-page">
        <section class="setting-section">
            <h3>{{ $t('jie-mian') }}</h3>
            <div class="setting-item" @click="openSelection('language')">
                <span>{{ $t('yu-yan') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.language.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('themeColor')">
                <span>{{ $t('zhu-se-tiao') }}</span>
                <div class="setting-control">
                    <span>🎨 {{ selectedSettings.themeColor.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('theme')">
                <span>{{ $t('wai-guan') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.theme.displayText }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>{{ $t('sheng-yin') }}</h3>
            <div class="setting-item">
                <span>{{ $t('yin-zhi-xuan-ze') }}</span>
                <div class="setting-control" @click="openSelection('quality')">
                    <span>🎧 {{ selectedSettings.quality.displayText }}</span>
                </div>
            </div>
            <div class="setting-item">
                <span>{{ $t('qi-dong-wen-hou-yu') }}</span>
                <div class="setting-control" @click="openSelection('greetings')">
                    <span>👋 {{ selectedSettings.greetings.displayText }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>{{ $t('ge-ci') }}</h3>
            <div class="setting-item" @click="openSelection('lyricsBackground')">
                <span>{{ $t('xian-shi-ge-ci-bei-jing') }}
                    <span v-if="showRefreshHint.lyricsBackground" class="refresh-hint"> {{ $t('shua-xin-hou-sheng-xiao') }}</span>
                </span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsBackground.displayText }}</span>
                </div>
            </div>
            
            <div class="setting-item" @click="openSelection('lyricsFontSize')">
                <span>{{ $t('ge-ci-zi-ti-da-xiao') }}
                    <span v-if="showRefreshHint.lyricsFontSize" class="refresh-hint"> {{ $t('shua-xin-hou-sheng-xiao') }}</span>
                </span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsFontSize.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('desktopLyrics')">
                <span>{{ $t('xian-shi-zhuo-mian-ge-ci') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.desktopLyrics.displayText }}</span>
                </div>
            </div>

        </section>

        <section class="setting-section">
            <h3>{{ $t('xi-tong') }}</h3>
            <div class="setting-item" @click="openSelection('gpuAcceleration')">
                <span>{{ $t('jin-yong-gpu-jia-su-zhong-qi-sheng-xiao') }}
                    <span v-if="showRefreshHint.gpuAcceleration" class="refresh-hint"> {{ $t('zhong-qi-hou-sheng-xiao') }}</span>
                </span>
                <div class="setting-control">
                    <span>{{ selectedSettings.gpuAcceleration.displayText }}</span>
                </div>
            </div>
            
            <div class="setting-item" @click="openSelection('highDpi')">
                <span>{{ $t('shi-pei-gao-dpi') }}
                    <span v-if="showRefreshHint.highDpi" class="refresh-hint"> {{ $t('zhong-qi-hou-sheng-xiao') }}</span>
                </span>
                <div class="setting-control">
                    <span>{{ selectedSettings.highDpi.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('minimizeToTray')">
                <span>{{ $t('guan-bi-shi-minimize-to-tray') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.minimizeToTray.displayText }}</span>
                </div>
            </div>
            
            <div class="setting-item" @click="openShortcutSettings">
                <span>{{ $t('quan-ju-kuai-jie-jian') }}</span>
                <div class="setting-control">
                    <span>{{ $t('zi-ding-yi-kuai-jie-jian') }}</span>
                </div>
            </div>
        </section>

        <div v-if="isSelectionOpen" class="modal">
            <div class="modal-content">
                <h3>{{ selectionTypeMap[selectionType].title }}</h3>
                <ul>
                    <li v-for="option in selectionTypeMap[selectionType].options" :key="option" @click="selectOption(option)">
                        {{ option.displayText }}
                    </li>
                </ul>
                <button @click="closeSelection">{{ $t('guan-bi') }}</button>
            </div>
        </div>

        <!-- 快捷键设置弹窗 -->
        <div v-if="showShortcutModal" class="shortcut-modal">
            <div class="shortcut-modal-content">
                <h3>{{ $t('kuai-jie-jian-she-zhi') }}</h3>
                <div class="shortcut-list">
                    <div class="shortcut-item">
                        <span>{{ $t('xian-shi-yin-cang-zhu-chuang-kou') }}</span>
                        <div class="shortcut-input" @click="startRecording('mainWindow')" 
                             :class="{ 'recording': recordingKey === 'mainWindow' }">
                            {{ shortcuts.mainWindow || '点击设置快捷键' }}
                            <div v-if="shortcuts.mainWindow" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('mainWindow')">
                                ×
                            </div>
                        </div>
                    </div>
                    
                    <div class="shortcut-item">
                        <span>{{ $t('tui-chu-zhu-cheng-xu') }}</span>
                        <div class="shortcut-input" @click="startRecording('quitApp')"
                             :class="{ 'recording': recordingKey === 'quitApp' }">
                            {{ shortcuts.quitApp || '点击设置快捷键' }}
                            <div v-if="shortcuts.quitApp" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('quitApp')">
                                ×
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-item">
                        <span>{{ $t('shang-yi-shou') }}</span>
                        <div class="shortcut-input" @click="startRecording('prevTrack')"
                             :class="{ 'recording': recordingKey === 'prevTrack' }">
                            {{ shortcuts.prevTrack || '点击设置快捷键' }}
                            <div v-if="shortcuts.prevTrack" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('prevTrack')">
                                ×
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-item">
                        <span>{{ $t('xia-yi-shou') }}</span>
                        <div class="shortcut-input" @click="startRecording('nextTrack')"
                             :class="{ 'recording': recordingKey === 'nextTrack' }">
                            {{ shortcuts.nextTrack || '点击设置快捷键' }}
                            <div v-if="shortcuts.nextTrack" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('nextTrack')">
                                ×
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-item">
                        <span>{{ $t('zan-ting-bo-fang') }}</span>
                        <div class="shortcut-input" @click="startRecording('playPause')"
                             :class="{ 'recording': recordingKey === 'playPause' }">
                            {{ shortcuts.playPause || '点击设置快捷键' }}
                            <div v-if="shortcuts.playPause" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('playPause')">
                                ×
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-item">
                        <span>{{ $t('yin-liang-zeng-jia') }}</span>
                        <div class="shortcut-input" @click="startRecording('volumeUp')"
                             :class="{ 'recording': recordingKey === 'volumeUp' }">
                            {{ shortcuts.volumeUp || '点击设置快捷键' }}
                            <div v-if="shortcuts.volumeUp" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('volumeUp')">
                                ×
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-item">
                        <span>{{ $t('yin-liang-jian-xiao') }}</span>
                        <div class="shortcut-input" @click="startRecording('volumeDown')"
                             :class="{ 'recording': recordingKey === 'volumeDown' }">
                            {{ shortcuts.volumeDown || '点击设置快捷键' }}
                            <div v-if="shortcuts.volumeDown" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('volumeDown')">
                                ×
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-item">
                        <span>{{ $t('jing-yin') }}</span>
                        <div class="shortcut-input" @click="startRecording('mute')"
                             :class="{ 'recording': recordingKey === 'mute' }">
                            {{ shortcuts.mute || '点击设置快捷键' }}
                            <div v-if="shortcuts.mute" 
                                 class="clear-shortcut" 
                                 @click.stop="clearShortcut('mute')">
                                ×
                            </div>
                        </div>
                    </div>
                </div>
                <div class="shortcut-modal-footer">
                    <button @click="closeShortcutSettings">{{ $t('qu-xiao') }}</button>
                    <button @click="saveShortcuts" class="primary">{{ $t('bao-cun') }}</button>
                </div>
            </div>
        </div>
        <div class="version-info">
            <p>© MoeKoe Music</p>
            <span v-if="appVersion">V{{ appVersion }} - {{ platform }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { MoeAuthStore } from '../stores/store';

const MoeAuth = MoeAuthStore();
const { t } = useI18n();
const { proxy } = getCurrentInstance();
const appVersion = ref('');
const platform = ref('');
const selectedSettings = ref({
    language: { displayText: '🌏 ' + t('zi-dong'), value: '' },
    themeColor: { displayText: t('shao-nv-fen'), value: 'pink' },
    theme: { displayText: '☀️ ' + t('qian-se'), value: 'light' },
    quality: { displayText: t('pu-tong-yin-zhi'), value: 'normal' },
    lyricsBackground: { displayText: t('da-kai'), value: 'on' },
    desktopLyrics: { displayText: t('guan-bi'), value: 'off' },
    lyricsFontSize: { displayText: t('zhong'), value: '24px' },
    greetings: { displayText: t('kai-qi'), value: 'on' },
    gpuAcceleration: { displayText: t('guan-bi'), value: 'off' },
    minimizeToTray: { displayText: t('da-kai'), value: 'on' },
    highDpi: { displayText: t('guan-bi'), value: 'off' }
});

const isSelectionOpen = ref(false);
const selectionType = ref('');

const selectionTypeMap = {
    language: {
        title: t('xuan-ze-yu-yan'),
        options: [
            { displayText: '🇨🇳 简体中文', value: 'zh-CN' },
            { displayText: '🇨🇳 繁体中文', value: 'zh-TW' },
            { displayText: '🇺🇸 English', value: 'en' },
            { displayText: '🇯🇵 日本語', value: 'ja' },
            { displayText: '🇰🇷 한국어', value: 'ko' }
        ]
    },
    themeColor: {
        title: t('xuan-ze-zhu-se-tiao'),
        options: [
            { displayText: t('shao-nv-fen'), value: 'pink' },
            { displayText: t('nan-nan-lan'), value: 'blue' },
            { displayText: t('tou-ding-lv'), value: 'green' },
            { displayText: t('mi-gan-cheng'), value: 'orange' }
        ]
    },
    theme: {
        title: t('xuan-ze-wai-guan'),
        options: [
            { displayText: '🌗 ' + t('zi-dong'), value: 'auto' },
            { displayText: '☀️ ' + t('qian-se'), value: 'light' },
            { displayText: '🌙 ' + t('shen-se'), value: 'dark' }
        ]
    },
    quality: {
        title: t('yin-zhi-xuan-ze'),
        options: [
            { displayText: t('pu-tong-yin-zhi'), value: 'normal' },
            { displayText: t('gao-yin-zhi-320kbps'), value: 'high' },
            { displayText: t('wu-sun-yin-zhi-1104kbps'), value: 'lossless' },
            { displayText: t('hires-yin-zhi'), value: 'hires' }
        ]
    },
    lyricsBackground: {
        title: t('xian-shi-ge-ci-bei-jing'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    desktopLyrics: {
        title: t('xian-shi-zhuo-mian-ge-ci'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    lyricsFontSize: {
        title: t('ge-ci-zi-ti-da-xiao'),
        options: [
            { displayText: t('xiao'), value: '20px' },
            { displayText: t('zhong'), value: '24px' },
            { displayText: t('da'), value: '32px' }
        ]
    },
    greetings: {
        title: t('qi-dong-wen-hou-yu'),
        options: [
            { displayText: t('kai-qi'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    gpuAcceleration: {
        title: t('jin-yong-gpu-jia-su-zhong-qi-sheng-xiao'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    minimizeToTray: {
        title: t('guan-bi-shi-minimize-to-tray'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    highDpi: {
        title: t('shi-pei-gao-dpi'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    }
};

const showRefreshHint = ref({
    lyricsBackground: false,
    lyricsFontSize: false,
    gpuAcceleration: false,
});

const openSelection = (type) => {
    isSelectionOpen.value = true;
    selectionType.value = type;
};

const selectOption = (option) => {
    const electronFeatures = ['desktopLyrics', 'gpuAcceleration', 'minimizeToTray'];
    if (!isElectron() && electronFeatures.includes(selectionType.value)) {
        window.$modal.alert(t('fei-ke-hu-duan-huan-jing-wu-fa-qi-yong'));
        return;
    }
    selectedSettings.value[selectionType.value] = option;
    const actions = {
        'themeColor': () => proxy.$applyColorTheme(option.value),
        'theme': () => proxy.$setTheme(option.value),
        'language': () => {
            proxy.$i18n.locale = option.value;
            document.documentElement.lang = option.value;
        },
        'quality': () => {
            if (!MoeAuth.isAuthenticated) {
                window.$modal.alert(t('gao-pin-zhi-yin-le-xu-yao-deng-lu-hou-cai-neng-bo-fango'));
                return;
            }
        },
        'desktopLyrics': () => {
            const action = option.value === 'on' ? 'display-lyrics' : 'close-lyrics';
            window.electron.ipcRenderer.send('desktop-lyrics-action', action);
        },
    };
    actions[selectionType.value]?.();
    saveSettings();
    closeSelection();
    if (selectionType.value == 'lyricsBackground' || selectionType.value == 'lyricsFontSize' || selectionType.value == 'gpuAcceleration' || selectionType.value == 'highDpi') {
        showRefreshHint.value[selectionType.value] = true;
    }
};

const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electron !== 'undefined';
};
const saveSettings = () => {
    const settingsToSave = Object.fromEntries(
        Object.entries(selectedSettings.value).map(([key, setting]) => [key, setting.value])
    );
    settingsToSave.shortcuts = shortcuts.value;
    localStorage.setItem('settings', JSON.stringify(settingsToSave));
    isElectron() && window.electron.ipcRenderer.send('save-settings', JSON.parse(JSON.stringify(settingsToSave)));
};

const closeSelection = () => {
    isSelectionOpen.value = false;
};

onMounted(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings'));
    if (savedSettings) {
        for (const key in savedSettings) {
            if (key === 'shortcuts') continue;
            if (selectionTypeMap[key] && selectionTypeMap[key].options) {
                const displayText = selectionTypeMap[key].options.find(
                    (option) => option.value === savedSettings[key]
                )?.displayText || '🌏 ' + t('zi-dong');
                selectedSettings.value[key] = { displayText, value: savedSettings[key] };
            }
        }
    }
    if (savedSettings?.shortcuts) {
        shortcuts.value = savedSettings.shortcuts;
    } else {
        shortcuts.value = {
            mainWindow: 'Ctrl+Shift+S',      // 显示/关闭主窗口
            quitApp: 'Ctrl+Q',               // 退出主程序
            prevTrack: 'Alt+Ctrl+Left',      // 上一首
            nextTrack: 'Alt+Ctrl+Right',     // 下一首
            playPause: 'Alt+Ctrl+Space',     // 暂停/播放
            volumeUp: 'Alt+Ctrl+Up',         // 音量大
            volumeDown: 'Alt+Ctrl+Down',     // 音量小
            mute: 'Alt+Ctrl+M'               // 静音
        };
    }
    if(isElectron()){
        appVersion.value = localStorage.getItem('version');
        platform.value = window.electron.platform;
    }
});

const showShortcutModal = ref(false);
const recordingKey = ref('');
const shortcuts = ref({});

const openShortcutSettings = () => {
    showShortcutModal.value = true;
};

const closeShortcutSettings = () => {
    showShortcutModal.value = false;
    recordingKey.value = '';
};

const startRecording = (key) => {
    recordingKey.value = key;
    shortcuts.value[key] = t('qing-an-xia-xiu-shi-jian');
    window.addEventListener('keydown', recordShortcut);
};

const recordShortcut = (e) => {
    if (!recordingKey.value) return;
    
    e.preventDefault();
    const keys = [];
    
    // 修饰键
    if (e.metaKey) keys.push('CommandOrControl');
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    
    // 如果按下了修饰键，更新提示
    if (keys.length > 0 && ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        shortcuts.value[recordingKey.value] = keys.join('+') + t('qing-an-xia-qi-ta-jian');
        return;
    }
    
    // 特殊键映射
    const specialKeys = {
        ' ': 'Space',
        'ArrowUp': 'Up',
        'ArrowDown': 'Down',
        'ArrowLeft': 'Left',
        'ArrowRight': 'Right',
        'Escape': 'Esc',
        'Backspace': 'Backspace',
        'Delete': 'Delete',
        'Enter': 'Return',
        'Tab': 'Tab',
        'PageUp': 'PageUp',
        'PageDown': 'PageDown',
        'Home': 'Home',
        'End': 'End',
        '+': 'numadd',
        '-': 'numsub',
        '*': 'nummult',
        '/': 'numdiv',
        '=': 'Equal'
    };

    const key = specialKeys[e.key] || e.key.toUpperCase();
    
    // 只有当按下的不是单独的修饰键时才结束记录
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(key);
        
        if (keys.length > 0) {
            // 检查是否包含必要的修饰键
            if (!keys.some(k => ['Ctrl', 'Alt', 'Shift', 'CommandOrControl'].includes(k))) {
                window.$modal.alert(t('kuai-jie-jian-bi-xu-bao-han-zhi-shao-yi-ge-xiu-shi-jian-ctrlaltshiftcommand'));
                return;
            }
            
            // 检查快捷键冲突
            const newShortcut = keys.join('+');
            const conflictKey = Object.entries(shortcuts.value).find(([k, v]) => 
                v === newShortcut && k !== recordingKey.value
            );
            
            if (conflictKey) {
                window.$modal.alert(t('gai-kuai-jie-jian-yu')+conflictKey[0]+t('de-kuai-jie-jian-chong-tu'));
                return;
            }
            
            shortcuts.value[recordingKey.value] = newShortcut;
            recordingKey.value = '';
            window.removeEventListener('keydown', recordShortcut);
        }
    }
};

// 添加快捷键验证函数
const validateShortcut = (shortcut) => {
    const keys = shortcut.split('+');
    return keys.some(k => ['Ctrl', 'Alt', 'Shift', 'Command'].includes(k));
};

// 修改 saveShortcuts 函数，添加检查
const saveShortcuts = () => {
    if (!isElectron()) {
        window.$modal.alert(t('fei-ke-hu-duan-huan-jing-wu-fa-qi-yong'));
        return;
    }

    // 验证所有快捷键
    const invalidShortcuts = Object.entries(shortcuts.value).filter(([key, value]) => 
        value && !validateShortcut(value)
    );
    
    if (invalidShortcuts.length > 0) {
        window.$modal.alert(t('cun-zai-wu-xiao-de-kuai-jie-jian-she-zhi-qing-que-bao-mei-ge-kuai-jie-jian-du-bao-han-xiu-shi-jian'));
        return;
    }
    
    try {
        let settingsToSave = JSON.parse(localStorage.getItem('settings')) || {};
        settingsToSave.shortcuts = shortcuts.value;
        localStorage.setItem('settings', JSON.stringify(settingsToSave));
        window.electron.ipcRenderer.send('save-settings',  JSON.parse(JSON.stringify(settingsToSave)));
        window.electron.ipcRenderer.send('custom-shortcut');
    } catch (error) {
        console.error('保存设置失败:', error);
        window.$modal.alert(t('bao-cun-she-zhi-shi-bai'));
    }
    
    closeShortcutSettings();
};

onUnmounted(() => {
    window.removeEventListener('keydown', recordShortcut);
});

const clearShortcut = (key) => {
    shortcuts.value[key] = '';
};
</script>

<style scoped>
.settings-page {
    padding: 20px;
    font-family: Arial, sans-serif;
}

.setting-section {
    margin-bottom: 30px;
}

.setting-section h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}

.setting-control {
    background-color: #f5f5f5;
    padding: 8px 16px;
    border-radius: 8px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in-out;
    z-index: 9;
}

.modal-content {
    background: white;
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-in-out;
}

.modal-content h3 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #333;
}

.modal-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.modal-content li {
    padding: 12px;
    margin: 6px 0;
    background-color: var(--background-color);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.modal-content li:hover {
    background-color:var(--secondary-color);
}

.modal-content button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.modal-content button:hover {
    background-color: var(--color-primary)
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateY(-20px); }
    to { transform: translateY(0); }
}

.shortcut-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.shortcut-modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
}

.shortcut-modal-content h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    text-align: center;
}

.shortcut-list {
    margin-bottom: 20px;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
}

.shortcut-input {
    position: relative;
    background: #f5f5f5;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    min-width: 150px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.shortcut-input.recording {
    background: var(--color-primary);
    color: white;
}

.shortcut-input.recording .clear-shortcut {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.shortcut-input.recording .clear-shortcut:hover {
    background: rgba(255, 255, 255, 0.3);
    color: white;
}

.clear-shortcut {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    cursor: pointer;
    font-size: 14px;
    color: #666;
    transition: all 0.2s;
    position: absolute;
    right: 2px;
}

.shortcut-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.shortcut-modal-footer button {
    padding: 8px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.shortcut-modal-footer button.primary {
    background: var(--color-primary);
    color: white;
}

.refresh-hint {
    color: red;
}

.version-info {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #666;
}
</style>