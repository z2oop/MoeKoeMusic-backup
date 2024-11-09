<template>
    <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
            <h2>用户条款</h2>
            <p>1. 本程序是酷狗第三方客户端，并非酷狗官方，需要更完善的功能请下载官方客户端体验.</p>
            <p>2. 本项目仅供学习交流使用，您在使用过程中应尊重版权，不得用于商业或非法用途。</p>
            <p>3. 在使用本项目的过程中，可能会生成版权内容。本项目不拥有这些版权内容的所有权。为了避免侵权行为，您需在 24 小时内清除由本项目产生的版权内容。</p>
            <p>4. 本项目的开发者不对因使用或无法使用本项目所导致的任何损害承担责任，包括但不限于数据丢失、停工、计算机故障或其他经济损失。</p>
            <p>5. 您不得在违反当地法律法规的情况下使用本项目。因违反法律法规所导致的任何法律后果由用户承担。</p>
            <p>6. 本项目仅用于技术探索和研究，不接受任何商业合作、广告或捐赠。如果官方音乐平台对此项目存有疑虑，可随时联系开发者移除相关内容。</p>
            <p>同意继续使用本项目，您即接受以上条款声明内容。</p>
            <div class="button-group">
                <button @click="agree">同意</button>
                <button @click="disagree">不同意</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showModal = ref(false);

onMounted(() => {
    if(isElectron()){
        window.electron.ipcRenderer.on('show-disclaimer', () => {
            showModal.value = true;
        });
        return
    }
    if(!localStorage.getItem('disclaimerAccepted')){
        showModal.value = true;
    }
});
const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electron !== 'undefined';
};
const agree = () => {
    showModal.value = false;
    if(isElectron()){
        window.electron.ipcRenderer.send('disclaimer-response', true);
        return;
    }
    localStorage.setItem('disclaimerAccepted', true);
};

const disagree = () => {
    if(isElectron()){
        window.electron.ipcRenderer.send('disclaimer-response', false);
    }
    window.close();
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 700px;
    width: 90%;
}

.button-group {
    display: flex;
    justify-content: space-around;
    margin-top: 15px;
}

button {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    background-color:var(--primary-color);
    color: white;
}

</style>