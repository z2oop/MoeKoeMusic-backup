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
                {{ currentLyric }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const currentLyric = ref('暂无歌词')
const isPlaying = ref(false)
const isLocked = ref(false)

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
    background-color: rgba(0, 0, 0, 0);
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

.lyrics-content {
    color: white;
    font-size: 24px;
    text-align: center;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1;
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
</style>