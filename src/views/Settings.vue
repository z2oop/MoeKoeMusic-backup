<template>
    <div class="settings-page">
        <section class="setting-section">
            <div class="setting-item">
                <span>语言</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.language }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('themeColor')">
                <span>主色调</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.themeColor }}</span>
                </div>
            </div>

            <div class="setting-item">
                <span>外观</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.theme }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>声音</h3>
            <div class="setting-item">
                <span>音质选择</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.quality }}</span>
                </div>
            </div>
            <div class="setting-item">
                <span>启动问候语</span>
                <div class="setting-control" @click="openSelection('greetings')">
                    <span>{{ selectedSettings.greetings }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>歌词</h3>
            <div class="setting-item" @click="openSelection('lyricsBackground')">
                <span>显示歌词背景</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsBackground }}</span>
                </div>
            </div>

            <div class="setting-item">
                <span>显示桌面歌词</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.desktopLyrics }}</span>
                </div>
            </div>

            <div class="setting-item">
                <span>歌词字体大小</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsFontSize }}</span>
                </div>
            </div>
        </section>

        <div v-if="isSelectionOpen" class="modal">
            <div class="modal-content">
                <h3>{{ selectionTypeMap[selectionType].title }}</h3>
                <ul>
                    <li v-for="option in selectionTypeMap[selectionType].options" :key="option" @click="selectOption(option)">
                        {{ option }}
                    </li>
                </ul>
                <button @click="closeSelection">关闭</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();

const selectedSettings = ref({
    language: '🇨🇳 简体中文',
    themeColor: '少女粉',
    theme: '浅色',
    quality: '普通音质 - 128Kbps',
    lyricsBackground: '打开',
    desktopLyrics: '关闭',
    lyricsFontSize: '中',
    greetings:'开启'
});

const isSelectionOpen = ref(false);
const selectionType = ref('');

const selectionTypeMap = {
    language: { title: '选择语言', options: ['🇨🇳 简体中文', '🇨🇳 繁体中文', '🇺🇸 English', '🇯🇵 日本語'] },
    themeColor: { title: '选择主色调', options: ['少女粉', '男男蓝', '头顶绿'] },
    theme: { title: '选择外观', options: ['自动', '浅色', '深色'] },
    quality: { title: '音质选择', options: ['普通音质 - 128Kbps', '高音质 - 320Kbps'] },
    lyricsBackground: { title: '显示歌词背景', options: ['打开', '关闭'] },
    desktopLyrics: { title: '显示桌面歌词', options: ['打开', '关闭'] },
    lyricsFontSize: { title: '歌词字体大小', options: ['小', '中', '大'] },
    greetings: { title: '启动问候语', options: ['开启', '关闭'] }
};

const openSelection = (type) => {
    selectionType.value = type;
    isSelectionOpen.value = true;
};

const selectOption = (option) => {
    selectedSettings.value[selectionType.value] = option;
    if (selectionType.value === 'themeColor') {
        proxy.$applyColorTheme(option);
    }else if (selectionType.value === 'theme') {
        // proxy.$setTheme(option); 
    }
    localStorage.setItem('settings', JSON.stringify(selectedSettings.value));
    closeSelection();
};

const closeSelection = () => {
    isSelectionOpen.value = false;
};

onMounted(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        selectedSettings.value = JSON.parse(savedSettings);
    }
});


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
</style>