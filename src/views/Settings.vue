<template>
    <div class="settings-page">
        <section class="setting-section">
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
                <span>{{ $t('xian-shi-ge-ci-bei-jing') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsBackground.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('desktopLyrics')">
                <span>{{ $t('xian-shi-zhuo-mian-ge-ci') }} (实验性功能)</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.desktopLyrics.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('lyricsFontSize')">
                <span>{{ $t('ge-ci-zi-ti-da-xiao') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsFontSize.displayText }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>系统</h3>
            <div class="setting-item" @click="openShortcutSettings">
                <span>全局快捷键</span>
                <div class="setting-control">
                    <span>自定义快捷键</span>
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
                <h3>快捷键设置</h3>
                <div class="shortcut-list">
                    <div class="shortcut-item">
                        <span>显示/隐藏主窗口</span>
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
                        <span>退出主程序</span>
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
                        <span>上一首</span>
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
                        <span>下一首</span>
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
                        <span>暂停/播放</span>
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
                        <span>音量增加</span>
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
                        <span>音量减小</span>
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
                        <span>静音</span>
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
                    <button @click="closeShortcutSettings">取消</button>
                    <button @click="saveShortcuts" class="primary">保存</button>
                </div>
            </div>
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

const selectedSettings = ref({
    language: { displayText: '🌏 ' + t('zi-dong'), value: 'ja' },
    themeColor: { displayText: t('shao-nv-fen'), value: 'pink' },
    theme: { displayText: '☀️ ' + t('qian-se'), value: 'light' },
    quality: { displayText: t('pu-tong-yin-zhi'), value: 'normal' },
    lyricsBackground: { displayText: t('da-kai'), value: 'on' },
    desktopLyrics: { displayText: t('guan-bi'), value: 'off' },
    lyricsFontSize: { displayText: t('zhong'), value: '32px' },
    greetings: { displayText: t('kai-qi'), value: 'on' }
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
            { displayText: t('tou-ding-lv'), value: 'green' }
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
            { displayText: t('wu-sun-yin-zhi-1104kbps'), value: 'lossless' }
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
            { displayText: t('xiao'), value: '24px' },
            { displayText: t('zhong'), value: '32px' },
            { displayText: t('da'), value: '40px' }
        ]
    },
    greetings: {
        title: t('qi-dong-wen-hou-yu'),
        options: [
            { displayText: t('kai-qi'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    }
};

const openSelection = (type) => {
    isSelectionOpen.value = true;
    selectionType.value = type;
};

const selectOption = (option) => {
    selectedSettings.value[selectionType.value] = option;
    if (selectionType.value === 'themeColor') {
        proxy.$applyColorTheme(option.value);
    } else if (selectionType.value === 'theme') {
        proxy.$setTheme(option.value);
    } else if (selectionType.value === 'language') {
        proxy.$i18n.locale = option.value;
    }else if( selectionType.value === 'quality' && !MoeAuth.isAuthenticated) {
        window.$modal.alert(t('gao-pin-zhi-yin-le-xu-yao-deng-lu-hou-cai-neng-bo-fango'));
        return
    }else if(selectionType.value === 'desktopLyrics'){
        const action = selectedSettings.value.desktopLyrics.value === 'on' ? 'display-lyrics' : 'close-lyrics';
        if(isElectron()){
            window.electron.ipcRenderer.send('desktop-lyrics-action', action);
        }else{
            window.$modal.alert('非客户端环境，无法启用');
            return;
        }
    }else if(selectionType.value === 'lyricsFontSize'){
        if(isElectron()){
            window.electron.ipcRenderer.send('lyrics-font-size', selectedSettings.value.lyricsFontSize.value);
        }else{
            window.$modal.alert('非客户端环境，无法启用');
            return;
        }
    }
    saveSettings();
    closeSelection();
};

const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electron !== 'undefined';
};

const saveSettings = () => {
    const settingsToSave = Object.fromEntries(
        Object.entries(selectedSettings.value).map(([key, setting]) => [key, setting.value])
    );
    localStorage.setItem('settings', JSON.stringify(settingsToSave));
    isElectron() && window.electron.ipcRenderer.send('save-settings',settingsToSave);
};

const closeSelection = () => {
    isSelectionOpen.value = false;
};

onMounted(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings'));
    if (savedSettings) {
        for (const key in savedSettings) {
            if (selectionTypeMap[key] && selectionTypeMap[key].options) {
                const displayText = selectionTypeMap[key].options.find(
                    (option) => option.value === savedSettings[key]
                ).displayText;
                selectedSettings.value[key] = { displayText, value: savedSettings[key] };
            }
        }
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
    shortcuts.value[key] = '请按下修饰键';
    window.addEventListener('keydown', recordShortcut);
};

const recordShortcut = (e) => {
    if (!recordingKey.value) return;
    
    e.preventDefault();
    const keys = [];
    
    // 修饰键
    if (e.metaKey) keys.push('Command');
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    
    // 如果按下了修饰键，更新提示
    if (keys.length > 0 && ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        shortcuts.value[recordingKey.value] = keys.join('+') + ' + [请按下其他键]';
        return;
    }
    
    // 特殊键映射
    const specialKeys = {
        ' ': 'Space',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'Escape': 'Esc',
        'Backspace': '⌫',
        'Delete': 'Del',
        'Enter': '↵',
        'Tab': '⇥'
    };

    const key = e.key;
    // 只有当按下的不是单独的修饰键时才结束记录
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
        keys.push(specialKeys[key] || key.toUpperCase());
        
        if (keys.length > 0) {
            // 检查是否包含必要的修饰键
            if (!keys.some(k => ['Ctrl', 'Alt', 'Shift', 'Command'].includes(k))) {
                window.$modal.alert('快捷键必须包含至少一个修饰键(Ctrl/Alt/Shift/Command)');
                return;
            }
            
            // 检查快捷键冲突
            const newShortcut = keys.join('+');
            const conflictKey = Object.entries(shortcuts.value).find(([k, v]) => 
                v === newShortcut && k !== recordingKey.value
            );
            
            if (conflictKey) {
                window.$modal.alert(`该快捷键与"${conflictKey[0]}"的快捷键冲突`);
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

// 修改保存函数，添加验证
const saveShortcuts = () => {
    // 验证所有快捷键
    const invalidShortcuts = Object.entries(shortcuts.value).filter(([key, value]) => 
        value && !validateShortcut(value)
    );
    
    if (invalidShortcuts.length > 0) {
        window.$modal.alert('存在无效的快捷键设置，请确保每个快捷键都包含修饰键');
        return;
    }
    
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts.value));
    if (isElectron()) {
        window.electron.ipcRenderer.send('set-shortcuts', shortcuts.value);
    }
    closeShortcutSettings();
};

onMounted(() => {
    const savedShortcuts = localStorage.getItem('shortcuts');
    if (savedShortcuts) {
        shortcuts.value = JSON.parse(savedShortcuts);
    } else {
        // 如果没有保存的快捷键，使用默认值
        shortcuts.value = {
            mainWindow: 'Ctrl+Shift+S',      // 显示/关闭主窗口
            quitApp: 'Ctrl+Q',            // 退出主程序
            prevTrack: 'Alt+Ctrl+Left',       // 上一首
            nextTrack: 'Alt+Ctrl+Right',      // 下一首
            playPause: 'Alt+Ctrl+Space',          // 暂停/播放
            volumeUp: 'Alt+Ctrl+Up',          // 音量大
            volumeDown: 'Alt+Ctrl+Down',      // 音量小
            mute: 'Alt+Ctrl+M'               // 静音
        };
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts.value));
        if (isElectron()) {
            window.electron.ipcRenderer.send('set-shortcuts', shortcuts.value);
        }
    }
});

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
</style>