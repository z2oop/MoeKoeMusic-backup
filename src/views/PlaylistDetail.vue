<template>
    <div class="playlist-detail-page">
        <div class="playlist-header">
            <img class="album-art" :src="detail.pic? $getCover(detail.pic, 240) : './assets/images/live.png'" />
            <div class="playlist-info">
                <h1 class="playlist-title">{{ detail.name }}</h1>
                <p class="playlist-subtitle">{{ detail.publish_date }} | {{ detail.list_create_username }}</p>
                <p class="playlist-meta">{{ detail.tags }}</p>
                <p class="playlist-description">{{ detail.intro }}</p>
                <div class="playlist-actions">
                    <button class="play-btn" @click="getPlaylistAllSongs(detail.global_collection_id)"><i
                            class="fas fa-play"></i> {{ $t('bo-fang') }}</button>
                    <button class="fav-btn" @click="toggleFavorite(detail.global_collection_id)"><i
                            class="fas fa-heart"></i></button>
                    <button class="more-btn" v-if="detail.list_create_userid == MoeAuth.UserInfo?.userid"><i
                            class="fas fa-ellipsis-h"></i></button>
                </div>
            </div>
        </div>

        <div class="track-list">
            <h2 class="track-list-title"><span>{{ $t('ge-qu-lie-biao') }}</span> ( {{ detail.count }} )</h2>
            <ul>
                <li v-for="(track, index) in tracks" :key="index"
                    @click="playSong($getQuality(track.relate_goods), track.name, $getCover(track.cover, 480), track.name)"
                    @contextmenu.prevent="showContextMenu($event, track)">
                    <div class="track-number">{{ (currentPage - 1) * pageSize + index + 1 }}</div>
                    <div class="track-title">{{ track.name }}
                        <span v-if="track.privilege == 10" class="icon vip-icon">VIP</span>
                        <span v-if="track.relate_goods.length > 2" class="icon sq-icon">SQ</span>
                        <span v-else-if="track.relate_goods.length > 1" class="icon sq-icon">HQ</span>
                    </div>
                    <div class="track-duration">{{ $formatMilliseconds(track.timelen) }}</div>
                </li>
            </ul>
            <div class="pagination">
                <button @click="prevPage" :disabled="currentPage === 1">{{ $t('shang-yi-ye') }}</button>
                <span class="current-page-info"><span>{{ $t('di') }}</span> {{ currentPage }} <span>{{ $t('ye')
                        }}</span> / <span>{{ $t('gong') }}</span> {{ totalPages }} <span>{{ $t('ye') }}</span></span>
                <button @click="nextPage" :disabled="currentPage === totalPages">{{ $t('xia-yi-ye') }}</button>
            </div>
        </div>
        <ContextMenu ref="contextMenuRef" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ContextMenu from '../components/ContextMenu.vue';
import { get } from '../utils/request';
import { useRoute } from 'vue-router';
import { MoeAuthStore } from '../stores/store';
const MoeAuth = MoeAuthStore();
const route = useRoute();
const tracks = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const detail = ref([]);
const contextMenuRef = ref(null);
const totalPages = computed(() => Math.ceil(detail.value.count / pageSize.value));
const playSong = (hash, name, img, author) => {
    props.playerControl.addSongToQueue(hash, name, img, author);
};
const getPlaylistAllSongs = (id) => {
    props.playerControl.getPlaylistAllSongs(id);
}
const toggleFavorite = (id) => {

}
const props = defineProps({
    playerControl: Object
});
onMounted(() => {
    getdetail();
});

watch(currentPage, () => {
    getTracks();
});
const showContextMenu = (event, song) => {
    if (contextMenuRef.value) {
        contextMenuRef.value.openContextMenu(event, { 
            OriSongName: song.name, 
            FileHash: song.hash, 
            fileid: song.fileid,
            userid: detail.value.list_create_userid
        }, detail.value.listid);
    }
};
const getdetail = async () => {
    const response = await get('/playlist/detail', { ids: route.query.global_collection_id });
    if (response.status == 1) {
        detail.value = response.data[0];
        getTracks();
    }
};

const getTracks = async () => {
    const response = await get('/playlist/track/all', {
        id: route.query.global_collection_id,
        page: currentPage.value,
        pagesize: pageSize.value
    });
    if (response.status == 1) {
        tracks.value = response.data.info;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

</script>

<style scoped>
.playlist-detail-page {
    padding: 20px;
}

.playlist-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.album-art {
    width: 200px;
    height: 200px;
    border-radius: 10px;
    margin-right: 20px;
}

.playlist-info {
    max-width: 600px;
}

.playlist-title {
    font-size: 36px;
    font-weight: bold;
    width: 800px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.playlist-subtitle {
    font-size: 18px;
    color: #666;
}

.playlist-meta {
    font-size: 14px;
    margin-bottom: 10px;
    color: #999;
}

.playlist-description {
    font-size: 16px;
    margin-bottom: 20px;
    max-height: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: break-spaces;
}

.playlist-actions {
    display: flex;
    gap: 10px;
}

.play-btn {
    background-color: #ff69b4;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.play-btn i {
    margin-right: 5px;
}

.fav-btn,
.more-btn {
    background-color: transparent;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
}

.track-list {
    margin-top: 20px;
}

.track-list-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.track-list ul {
    list-style: none;
    padding: 0;
}

.track-list li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    padding-left: 10px;
    border-radius: 5px;
    padding-right: 10px;
    cursor: pointer;
}

.track-list li:hover {
    background-color: #f0f0f0;
}

.track-number {
    font-weight: bold;
    margin-right: 10px;
}

.track-title {
    flex-grow: 1;
}

.track-duration {
    margin-left: 10px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

.pagination .current-page-info {
    line-height: 29px;
}

.pagination button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;
    border-radius: 5px;
}

.pagination button:disabled {
    cursor: not-allowed;
    background-color: #f0f0f0;
}

.pagination span {
    font-size: 14px;
    color: #666;
}

.icon {
    margin-left: 5px;
    border: 1px solid;
    border-radius: 5px;
    font-size: 10px;
    padding: 2px;
    padding-left: 6px;
    padding-right: 6px;
}

.vip-icon {
    color: #ff6d00;
}

.sq-icon {
    color: #0094ff;
}
</style>