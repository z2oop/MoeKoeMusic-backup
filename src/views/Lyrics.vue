<template>
    <div class="lyrics-container">
      <div class="lyrics-text">{{ lyrics }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  const lyrics = ref('正在播放: 歌词加载中...');
  
  onMounted(() => {
    window.electron.ipcRenderer.on('lyrics-update', (event, newLyrics) => {
      lyrics.value = newLyrics;
    });
  });
  </script>
  <style>

body {
  background-color: rgba(0, 0, 0, 0);
}

</style>
  <style scoped>
  .lyrics-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    background-color: rgba(0, 0, 0, 0); 
    -webkit-app-region: drag; 
  }
  </style>