<template>
    <div class="lyrics-container" :class="{ 'locked': isLocked }">
        <!-- 控制栏 -->
        <div class="controls-overlay" ref="controlsOverlay">
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
        <div 
            class="lyrics-container" 
            ref="lyricsContainerRef"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            :class="{ 'hovering': isHovering,'locked': isLocked }"
        >
            <template v-if="lyrics.length">
                <div class="lyrics-line current">
                    <div class="lyrics-content" 
                        :style="currentLineStyle"
                        :class="{ 'hovering': isHovering && !isLocked }"
                    >
                        <span
                            v-for="(char, index) in lyrics[displayedLines[0]]?.characters"
                            :key="`line1-${index}`"
                            class="character"
                            :style="getCharacterStyle(char)"
                        >{{ char.char }}</span>
                    </div>
                </div>
                <div class="lyrics-line next" v-if="lyrics[displayedLines[1]]">
                    <div class="lyrics-content"
                        :class="{ 'hovering': isHovering && !isLocked }"
                    >
                        <span
                            v-for="(char, index) in lyrics[displayedLines[1]]?.characters"
                            :key="`line2-${index}`"
                            class="character"
                            :style="getCharacterStyle(char)"
                        >{{ char.char }}</span>
                    </div>
                </div>
            </template>
            <div v-else class="lyrics-content hovering">暂无歌词</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
const isPlaying = ref(false)
const isLocked = ref(false)
const controlsOverlay = ref(null)
const lyricsContainerRef = ref(null)
const currentTime = ref(0)
const currentLineIndex = ref(0)
const lyrics = ref([])
const currentLineScrollX = ref(0)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
// 计算属性
const currentLine = computed(() => lyrics.value[currentLineIndex.value] || { characters: [] })

const currentLineStyle = computed(() => ({
    transform: `translateX(${currentLineScrollX.value}px)`
}))

// 新增显示行索引状态
const displayedLines = ref([0, 1]) // [当前显示的第一行索引, 当前显示的第二行索引]

// 字符样式计算
const getCharacterStyle = (char) => {
    const startTime = char.startTime / 1000
    const endTime = char.endTime / 1000
    const progress = (currentTime.value - startTime) / (endTime - startTime)
    
    let fillPercent = 0
    if (currentTime.value < startTime) {
        fillPercent = 0
    } else if (currentTime.value >= endTime) {
        fillPercent = 100
    } else {
        fillPercent = Math.max(0, Math.min(100, progress * 100))
    }
    
    return {
        backgroundImage: `linear-gradient(to right, #FF69B4 0%, #FF69B4 ${fillPercent}%, #999 ${fillPercent}%)`
    }
}


// 播放控制
const sendAction = (action) => {
    window.electron.ipcRenderer.send('desktop-lyrics-action', action)
}

const togglePlay = () => {
    isPlaying.value = !isPlaying.value
    sendAction('toggle-play')
}

const toggleLock = () => {
    isLocked.value = !isLocked.value
    localStorage.setItem('lyrics-lock', isLocked.value)
    if (isLocked.value) {
        isHovering.value = false
        window.electron.ipcRenderer.send('set-ignore-mouse-events', true)
    }
}

// 歌词滚动处理
const updateScroll = () => {
    if (!currentLine.value) return
    
    const container = lyricsContainerRef.value
    if (!container) return
    
    const currentLineEl = container.querySelector('.lyrics-line.current')
    const contentEl = currentLineEl?.querySelector('.lyrics-content')
    if (!contentEl) return
    
    const contentWidth = contentEl.offsetWidth
    const containerWidth = currentLineEl.offsetWidth
    
    if (contentWidth <= containerWidth) {
        currentLineScrollX.value = 0
        return
    }
    
    // 找到当前正在播放的字符
    const currentChar = currentLine.value.characters.find(char => 
        currentTime.value >= char.startTime / 1000 && 
        currentTime.value <= char.endTime / 1000
    )
    
    if (!currentChar) return
    
    const charIndex = currentLine.value.characters.indexOf(currentChar)
    const charPosition = (charIndex / currentLine.value.characters.length) * contentWidth
    
    const targetPosition = containerWidth * 0.3
    const scrollAmount = -(charPosition - targetPosition)
    
    const maxScroll = 0
    const minScroll = -(contentWidth - containerWidth)
    currentLineScrollX.value = Math.min(maxScroll, Math.max(minScroll, scrollAmount))
}

// 修改更新当前行索引的逻辑
const updateCurrentLineIndex = () => {
    const currentTimeMs = currentTime.value * 1000
    
    for (let i = 0; i < lyrics.value.length; i++) {
        const line = lyrics.value[i]
        if (!line?.characters?.length) continue
        
        const lineStartTime = line.characters[0].startTime
        const lineEndTime = line.characters[line.characters.length - 1].endTime
        
        if (currentTimeMs >= lineStartTime && currentTimeMs <= lineEndTime) {
            if (currentLineIndex.value !== i) {
                currentLineIndex.value = i
                updateDisplayedLines()
            }
            break
        }
    }
}

// 新增更新显示行的逻辑
const updateDisplayedLines = () => {
    const currentIdx = currentLineIndex.value
    if (currentIdx > displayedLines.value[1]) {
        displayedLines.value = [currentIdx, currentIdx + 1]
        currentLineScrollX.value = 0
    }
}

// 监听时间变化
watch(currentTime, () => {
    updateCurrentLineIndex()
    updateScroll()
})


// 修改开始拖动函数
const startDrag = (event) => {
    // 如果锁定了，或者不是在控制栏/歌词内容区域，则不处理
    if (isLocked.value || 
        (!event.target.closest('.controls-overlay') && 
         !event.target.closest('.lyrics-content'))) return

    isDragging.value = true
    dragOffset.value = {
        x: event.clientX,
        y: event.clientY
    }
}

// 修改检查鼠标是否在交互区域的逻辑
const checkMousePosition = (event) => {
    // 如果是锁定状态，只检查控制栏
    if (isLocked.value) {
        const isMouseInControls = event.target.closest('.controls-overlay') !== null
        window.electron.ipcRenderer.send('set-ignore-mouse-events', !isMouseInControls)
        return
    }

    // 非锁定状态，检查是否在控制栏或悬停的歌词内容上
    const isMouseInControls = event.target.closest('.controls-overlay') !== null
    const isMouseInLyrics = event.target.closest('.lyrics-content') !== null && isHovering.value

    window.electron.ipcRenderer.send('set-ignore-mouse-events', !(isMouseInControls || isMouseInLyrics))
}

window.electron.ipcRenderer.on('lyrics-data', (newLyrics) => {
    lyrics.value = newLyrics
    currentLineIndex.value = 0
    currentTime.value = 0
    currentLineScrollX.value = 0
})

window.electron.ipcRenderer.on('update-current-time', (time) => {
    currentTime.value = time
})

onMounted(() => {
    isLocked.value = localStorage.getItem('lyrics-lock') === 'true'
    window.electron.ipcRenderer.send('set-ignore-mouse-events', true)
    

    document.addEventListener('mousemove', checkMousePosition)
    document.addEventListener('mousedown', startDrag)
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)
})

// 拖动中
const onDrag = (event) => {
    if (!isDragging.value) return

    const deltaX = event.screenX - dragOffset.value.x
    const deltaY = event.screenY - dragOffset.value.y

    window.electron.ipcRenderer.send('window-drag', {
        mouseX: deltaX,
        mouseY: deltaY
    })
}

// 结束拖动
const endDrag = () => {
    isDragging.value = false
}

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', checkMousePosition)
    document.removeEventListener('mousedown', startDrag)
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', endDrag)
})

// 添加新的 ref 来控制背景状态
const isHovering = ref(false)

// 修改鼠标移入移出处理函数
const handleMouseEnter = () => {
    if (!isLocked.value) {
        isHovering.value = true
        window.electron.ipcRenderer.send('set-ignore-mouse-events', false)
    }
}

const handleMouseLeave = () => {
    isHovering.value = false
    if (!isLocked.value) {
        window.electron.ipcRenderer.send('set-ignore-mouse-events', true)
    }
}
</script>

<style>
body,
html {
    background-color: rgba(0, 0, 0, 0);
}

.character {
    display: inline-block;
    color: transparent;
    position: relative;
    margin: 0 2px;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    font-weight: bold;
}

.lyrics-container {
    backdrop-filter: blur(8px);
    border-radius: 8px;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: inherit;
    width: 100%;
    font-size: 32px;
    font-weight: bold;
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

.lyrics-line {
    overflow: hidden;
    position: relative;
    transition: transform 0.3s ease-out;
}

.lyrics-line.current {
    text-align: left;
}

.lyrics-line.next {
    text-align: right;
}

.lyrics-content {
    display: inline-block;
    white-space: nowrap;
    transition: all 0.3s ease-out;
    padding: 4px 8px;
    border-radius: 4px;
}

.lyrics-container:not(.locked) .lyrics-content.hovering:hover {
    cursor: move;
    background-color: rgba(0, 0, 0, 0.3);
}

.controls-wrapper:not(.locked-controls) {
    cursor: move;
}
</style>