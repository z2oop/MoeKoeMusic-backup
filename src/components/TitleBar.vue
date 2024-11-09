<template>
    <div class="custom-title-bar" v-if="isElectron && !isMac">
        <div class="window-controls">
            <div @click="closeWindow" class="control-button close">
                <i class="fas fa-close"></i> 
            </div>
            <div @click="minimizeWindow" class="control-button minimize">
                <i class="fas fa-minus"></i> 
            </div>
            <div @click="maximizeWindow" class="control-button maximize">
                <i class="fas fa-expand-arrows-alt"></i> 
            </div>
        </div>
    </div>
</template>

<script setup>
const isElectron = typeof window !== 'undefined' && typeof window.electron !== 'undefined';
const isMac = isElectron && window.electron.platform == 'darwin';
const closeWindow = () => window.electron.ipcRenderer.send('window-control', 'close');
const minimizeWindow = () => window.electron.ipcRenderer.send('window-control', 'minimize');
const maximizeWindow = () => window.electron.ipcRenderer.send('window-control', 'maximize');
</script>

<style scoped>
.custom-title-bar {
    height: 25px;
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    z-index: 10;
    position: fixed;
    flex-direction: row;
    right: 29px;
    top: 10px;
}

.window-controls {
    display: flex;
    gap: 8px;
}

.control-button {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    -webkit-app-region: no-drag; 
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    color: transparent;
    transition: color 0.2s ease;
    font-weight: bold;
}

.close {
    background-color: #ff5f57;
}

.minimize {
    background-color: #ffbd2e;
}

.maximize {
    background-color: #28c940;
}

.control-button:hover {
    color: rgb(55, 55, 55); 
}

.control-button:hover i {
    opacity: 1;
}

i {
    opacity: 0;
}
</style>