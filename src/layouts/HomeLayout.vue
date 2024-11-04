<template>
    <Header />
    <main>
        <router-view :playerControl="playerControl"></router-view>
    </main>
    <PlayerControl ref="playerControl" />
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import Header from "@/components/Header.vue";
import PlayerControl from "@/components/PlayerControl.vue";
const playerControl = ref(null);
const { proxy } = getCurrentInstance();
const audio = ref(null);
const audioFiles = [
    '/assets/sound/yise-jp.mp3',
    '/assets/sound/qiqi-jp.mp3',
    '/assets/sound/qiqi-zh.mp3'
];
onMounted(() => {
    const savedConfig = JSON.parse(localStorage.getItem('settings'));
    if (savedConfig) {
        proxy.$applyColorTheme(savedConfig['themeColor']);
    }
    if (savedConfig && savedConfig['greetings']=='开启') {
        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        const selectedAudioFile = audioFiles[randomIndex];
        audio.value = new Audio(selectedAudioFile);
        audio.value.play().catch(error => {
            console.error('未交互', error);
        });
    }
});
</script>

<style>
:root {
    /* 粉红色主色调 */
    --primary-color: #FF69B4;
    /* 浅粉红色辅助色 */
    --secondary-color: #FFB6C1;
    --text-color: #333;
    /* 浅粉色背景 */
    --background-color: #FFF0F5;
    /* 高亮色 */
    --color-primary: #ea33e4;
    --color-secondary-bg-for-transparent: rgba(209, 209, 214, 0.28);
    --color-box-shadow: rgba(255, 105, 180, 0.2);
}

/* 深色主题 */
[data-theme="dark"] {
    --primary-color: #1E90FF;
    --secondary-color: #ADD8E6;
    --text-color: #f5f5f5;
    --background-color: #1a1a1a;
    --color-box-shadow: rgba(30, 144, 255, 0.2);
}

* {
    user-select: none;
}

body,
html {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #FFF;
    color: var(--text-color);
    overflow: auto;
    height: 100%;
}

body {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

::-webkit-scrollbar {
    width: 0;
    height: 0;
}

main {
    min-height: calc(100vh - 80px - 188px);
    max-width: 1200px;
    margin: 0 auto;
    margin-bottom: 150px;
    padding-top: 80px;
}

a {
    text-decoration: none;
    color: inherit;
    display: block;
}
</style>