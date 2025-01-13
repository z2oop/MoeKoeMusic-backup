<template>
    <div class="lyrics-container">
        <!-- 控制栏 -->
        <div class="controls-overlay">
            <div class="controls-wrapper" :class="{ 'locked-controls': isLocked }">
                <template v-if="!isLocked">
                    <button @click="sendAction('previous-song')">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button @click="togglePlay">
                        <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                    </button>
                    <button @click="sendAction('next-song')">
                        <i class="fas fa-step-forward"></i>
                    </button>
                </template>
                <button @click="toggleLock" class="lock-button">
                    <i :class="isLocked ? 'fas fa-lock' : 'fas fa-lock-open'"></i>
                </button>
                <template v-if="!isLocked">
                    <button @click="sendAction('close-lyrics')">
                        <i class="fas fa-times"></i>
                    </button>
                </template>
            </div>
        </div>
        <!-- 歌词内容 -->
        <div class="lyrics-content">
            <div class="lyrics-top-left">
                <span v-if="currentLyric && currentLyric.characters.length > 0">
                    <span v-for="(char, index) in currentLyric.characters" :key="index" class="highlight-char" :style="{
                        backgroundPosition: `${(1 - char.progress) * 100}% 0`
                    }">
                        {{ char.char }}
                    </span>
                </span>
                <span v-else>暂无歌词</span>
            </div>
            <div class="lyrics-bottom-right">
                <span v-if="nextLyric && nextLyric.characters.length > 0">
                    <span v-for="(char, index) in nextLyric.characters" :key="index" class="highlight-char" :style="{
                        backgroundPosition: `${(1 - char.progress) * 100}% 0`
                    }">
                        {{ char.char }}
                    </span>
                </span>
                <span v-else>暂无歌词</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const currentLyric = ref({ characters: [] })
const nextLyric = ref({ characters: [] })
const isPlaying = ref(false)
const isLocked = ref(false)
const parsedLyrics = ref([])
let currentIndex = ref(0)
let controlsOverlay = null;
onMounted(() => {
    const savedConfig = JSON.parse(localStorage.getItem('settings'));
    const lyricsFontSize = savedConfig.lyricsFontSize || '32px';
    document.querySelector('.lyrics-content').style.fontSize = lyricsFontSize;
    isLocked.value = localStorage.getItem('lyrics-lock') === 'true'
    setWindowIgnoreMouseEvents(true);

    // 添加鼠标移动事件监听
    controlsOverlay = document.querySelector('.controls-overlay');
    controlsOverlay.addEventListener('mousemove', ()=>setWindowIgnoreMouseEvents(false));
    controlsOverlay.addEventListener('mouseleave', ()=>setWindowIgnoreMouseEvents(true));
})
const setWindowIgnoreMouseEvents = (ignore) => {
    window.electron.ipcRenderer.send('set-ignore-mouse-events', ignore);
};
// 窗口关闭取消监听
onBeforeUnmount(() => {
    controlsOverlay.removeEventListener('mousemove', handleMouseMove);
    controlsOverlay.removeEventListener('mouseleave', handleMouseLeave);
})
// 更新逐字歌词的进度
const updateCurrentLyric = (time) => {
    if (!parsedLyrics.value || parsedLyrics.value.length === 0) {
        currentLyric.value = { characters: [] };
        nextLyric.value = { characters: [] };
        return;
    }

    const currentTimeMs = time * 1000;

    for (let i = currentIndex.value; i < parsedLyrics.value.length; i++) {
        const line = parsedLyrics.value[i];
        const lineStartTime = line.characters[0]?.startTime || 0;
        const lineEndTime = line.characters[line.characters.length - 1]?.endTime || 0;

        if (currentTimeMs >= lineStartTime && currentTimeMs < lineEndTime) {
            const updatedCharacters = line.characters.map(char => {
                const charProgress = Math.min(
                    Math.max((currentTimeMs - char.startTime) / (char.endTime - char.startTime), 0),
                    1
                );
                return { ...char, progress: charProgress };
            });

            if (i === currentIndex.value) {
                currentLyric.value = { ...line, characters: updatedCharacters };
            } else {
                nextLyric.value = { ...line, characters: updatedCharacters };
            }

            // 检查当前行是否播放完毕
            if (updatedCharacters.every(char => char.progress === 1) && i === currentIndex.value) {
                // 当前行播放完毕，切换到下一行
                currentIndex.value++;
                currentLyric.value = nextLyric.value;
                if (currentIndex.value + 1 < parsedLyrics.value.length) {
                    nextLyric.value = parsedLyrics.value[currentIndex.value + 1];
                } else {
                    nextLyric.value = { characters: [] };
                }
            }
            break;
        }
    }
};

window.electron.ipcRenderer.on('lyrics-font-size', (fontSize) => {
    document.querySelector('.lyrics-content').style.fontSize = fontSize;
});

window.electron.ipcRenderer.on('update-current-time', (time) => {
    updateCurrentLyric(time)
});

window.electron.ipcRenderer.on('lyrics-data', (newLyrics) => {
    console.log(newLyrics)
    if (!newLyrics || newLyrics.length === 0) {
        currentLyric.value = { characters: [] }
        nextLyric.value = { characters: [] }
        parsedLyrics.value = []
    } else {
        parsedLyrics.value = newLyrics
        currentIndex.value = 0
        currentLyric.value = parsedLyrics.value[0] || { characters: [] }
        nextLyric.value = parsedLyrics.value[1] || { characters: [] }
    }
});
const sendAction = (action) => {
    window.electron.ipcRenderer.send('desktop-lyrics-action', action);
}

const togglePlay = () => {
    isPlaying.value = !isPlaying.value
    sendAction('toggle-play');
}

const toggleLock = () => {
    isLocked.value = !isLocked.value
    localStorage.setItem('lyrics-lock', isLocked.value)
}

</script>

<style>
body,
html {
    background-color: rgba(0, 0, 0, 0) !important;
}
</style>

<style scoped>
.lyrics-container {
    backdrop-filter: blur(8px);
    border-radius: 8px;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: inherit;
}

.controls-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
    margin-top: 10px;
}

.controls-overlay:hover {
    opacity: 1;
}

.controls-wrapper {
    display: flex;
    gap: 15px;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    padding: 6px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
    width: 430px;
}

.lock-button {
    position: relative;
    z-index: 3;
}

.lock-button i {
    font-size: 13px !important;
}

.controls-wrapper.locked-controls {
    background: none;
    padding: 0;
    width: auto;
}

.controls-wrapper button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.controls-wrapper i {
    font-size: 16px;
}

.lyrics-content {
    width: 100%;
}
.lyrics-content:hover {
    cursor: move;
}

.lyrics-top-left {
    font-weight: bold;
    text-align: left;
}

.lyrics-bottom-right {
    font-weight: bold;
    text-align: right;
}


.highlight-char {
    color: transparent;
    background: linear-gradient(to right, #FF69B4 50%, #878787 50%);
    background-size: 200% 100%;
    background-position: 100% 0px;
    -webkit-background-clip: text;
    background-clip: text;
    transition: background-position 0.6s ease;
}
</style>