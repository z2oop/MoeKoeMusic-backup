<template>
    <div class="lyrics-container" :class="{ 'draggable': !isLocked }">
        <div class="lyrics-wrapper">
            <div class="controls-overlay" :class="{ 'locked-state': isLocked }">
                <div class="controls-wrapper" :class="{ 'locked-controls': isLocked }">
                    <template v-if="!isLocked">
                        <button @click="previousSong">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        <button @click="togglePlay">
                            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                        </button>
                        <button @click="nextSong">
                            <i class="fas fa-step-forward"></i>
                        </button>
                    </template>
                    <button @click="toggleLock" class="lock-button">
                        <i :class="isLocked ? 'fas fa-lock' : 'fas fa-lock-open'"></i>
                    </button>
                    <template v-if="!isLocked">
                        <button @click="closeLyrics">
                            <i class="fas fa-times"></i>
                        </button>
                    </template>
                </div>
            </div>
            <div class="lyrics-content">
                <span v-if="currentLyric">
                    <span v-for="(char, index) in currentLyric.characters" :key="index" class="highlight-char" :style="{
                        backgroundPosition: `${(1 - char.progress) * 100}% 0`
                    }">
                        {{ char.char }}
                    </span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const currentLyric = ref({ characters: [] })
const isPlaying = ref(false)
const isLocked = ref(false)
const parsedLyrics = ref([])

// 更新逐字歌词的进度
const updateCurrentLyric = (time) => {
    if (!parsedLyrics.value || parsedLyrics.value.length === 0) {
        currentLyric.value = { characters: [] };
        return;
    }

    const currentTimeMs = time * 1000; 

    for (const line of parsedLyrics.value) {
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
            currentLyric.value = { ...line, characters: updatedCharacters };
            break;
        }
    }
};

window.electron.ipcRenderer.on('update-current-time', (time) => {
    updateCurrentLyric(time)
});

window.electron.ipcRenderer.on('lyrics-data', (newLyrics) => {
    if (!newLyrics || newLyrics.length === 0) {
        currentLyric.value = { characters: [] }
        parsedLyrics.value = []
    } else {
        parsedLyrics.value = newLyrics
    }
});

const previousSong = () => {
    emit('previous-song')
}

const nextSong = () => {
    emit('next-song')
}

const togglePlay = () => {
    isPlaying.value = !isPlaying.value
    emit('toggle-play')
}

const toggleLock = () => {
    isLocked.value = !isLocked.value
}

const closeLyrics = () => {
    emit('close-lyrics')
}

const emit = defineEmits(['previous-song', 'next-song', 'toggle-play', 'toggle-lock', 'close-lyrics'])
</script>

<style>
body,
html {
    background-color: rgba(0, 0, 0, 0) !important;
}
</style>

<style scoped>
.lyrics-container {
    position: relative;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(8px);
    border-radius: 8px;
    user-select: none;
}

.draggable {
    -webkit-app-region: drag;
}

.lyrics-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.controls-overlay {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    padding: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
}

.lyrics-container:hover .controls-overlay {
    opacity: 1;
}

.controls-overlay.locked-state {
    opacity: 0;
}

.lyrics-container:hover .controls-overlay.locked-state {
    opacity: 1;
}

.controls-wrapper {
    display: flex;
    gap: 15px;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    padding: 8px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
}

.controls-wrapper.locked-controls {
    background: none;
    backdrop-filter: none;
    padding: 0;
}


.lock-button {
    position: relative;
    z-index: 3;
}

.lock-button i {
    font-size: 13px !important;
}

/* 锁定状态下的按钮样式 */
.locked-controls .lock-button {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    opacity: 0;
}

.locked-controls .lock-button:hover {
    background: rgba(0, 0, 0, 0.7);
}

.controls-wrapper button {
    -webkit-app-region: no-drag;
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

.locked-controls .lock-button:hover {
    opacity: 1;
}

.controls-wrapper button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.controls-wrapper i {
    font-size: 16px;
}

.lyrics-container:hover .locked-controls .lock-button {
    opacity: 1;
}

.lyrics-content {
    font-size: 32px;
    text-align: center;
    z-index: 1;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
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