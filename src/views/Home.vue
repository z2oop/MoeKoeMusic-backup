<template>
    <div class="container">
        <h2 class="section-title">{{ $t('tui-jian') }}</h2>
        <div class="recommendations">
            <div class="recommend-card">
                <a href="https://activity.kugou.com/download/v-a23b0cf0/index.html" target="_blank"><img
                        src="@/assets/images/home/recommend1.png" class="recommend-image" title="酷狗概念版下载"></a>
            </div>
            <div class="recommend-card">
                <a href="https://activity.kugou.com/getvips/v-4163b2d0/index.html" target="_blank"><img
                        src="@/assets/images/home/recommend2.png" class="recommend-image" title="每日领取VIP"></a>
            </div>

            <div class="recommend-card">
                <div class="card-content">
                    <router-link :to="{
                        path: '/PlaylistDetail',
                        query: { global_collection_id: 'collection_3_25230245_24_0' }
                    }">
                        <img src="@/assets/images/home/recommend3.png" class="recommend-image" title="阿珏酱の歌单">
                    </router-link>
                </div>
            </div>
        </div>

        <h2 class="section-title">{{ $t('tui-jian-ge-qu') }}</h2>
        <div v-if="isLoading" class="skeleton-loader">
            <div v-for="n in 16" :key="n" class="skeleton-item">
                <div class="skeleton-cover"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
        </div>
        <div v-else class="song-list">
            <div class="song-item" v-for="(song, index) in songs" :key="index"
                @click="playSong($getQuality(null, song), song.ori_audio_name, $getCover(song.sizable_cover, 480), song.author_name)"
                @contextmenu.prevent="showContextMenu($event, song)">
                <img :src="$getCover(song.sizable_cover, 64)" :alt="song.ori_audio_name" class="song-cover">
                <div class="song-info">
                    <div class="song-title">{{ song.ori_audio_name }}</div>
                    <div class="song-artist">{{ song.author_name }}</div>
                </div>
            </div>
        </div>
        <h2 class="section-title">{{ $t('tui-jian-ge-dan') }}</h2>
        <div class="playlist-grid">
            <div class="playlist-item" v-for="(playlist, index) in special_list" :key="index">
                <router-link :to="{
                    path: '/PlaylistDetail',
                    query: { global_collection_id: playlist.global_collection_id }
                }">
                    <img :src="$getCover(playlist.flexible_cover, 240)" class="playlist-cover">
                    <div class="playlist-info">
                        <div class="playlist-title">{{ playlist.specialname }}</div>
                        <div class="playlist-description">{{ playlist.intro }}</div>
                    </div>
                </router-link>
            </div>
        </div>
        <ContextMenu ref="contextMenuRef" :playerControl="playerControl" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { get } from '../utils/request';
import ContextMenu from '../components/ContextMenu.vue';
const songs = ref([]);
const special_list = ref([]);
const isLoading = ref(true);
const playSong = (hash, name, img, author) => {
    props.playerControl.addSongToQueue(hash, name, img, author);
};
const contextMenuRef = ref(null);
const showContextMenu = (event, song) => {
    if (contextMenuRef.value) {
        contextMenuRef.value.openContextMenu(event, { 
            OriSongName: song.filename, 
            FileHash: song.hash, 
            cover: song.sizable_cover.replace("{size}", 480),
            timeLength: song.time_length
        });
    }
};
const props = defineProps({
    playerControl: Object
});
onMounted(() => {
    recommend();
    playlist();
});

const recommend = async () => {
    const response = await get('/everyday/recommend');
    if (response.status == 1) {
        songs.value = response.data.song_list;
    }
    isLoading.value = false;
}

const playlist = async () => {
    const response = await get(`/top/playlist?category_id=0`);
    if (response.status == 1) {
        special_list.value = response.data.special_list;
    }
}

</script>

<style scoped>
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

.section-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
    color: var(--primary-color);
}

.recommendations {
    display: flex;
    gap: 35px;
    margin-bottom: 40px;
    cursor: pointer;
}

.recommend-card {
    width: 400px;
    height: 200px;
    border-radius: 15px;
    overflow: hidden;
}

.recommend-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
}

.play-icon {
    font-size: 30px;
    color: white;
    cursor: pointer;
}

.card-content {
    display: flex;
    align-items: center;
}

.song-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
}

.song-item {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 250px;
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    cursor: pointer;
}

.song-item:hover {
    transform: translateY(-5px);
}

.song-cover {
    width: 50px;
    height: 50px;
    border-radius: 5px;
}

.song-info {
    display: flex;
    flex-direction: column;
}

.song-title {
    font-size: 16px;
    font-weight: bold;
    color: var(--primary-color);
}

.song-artist {
    font-size: 14px;
    color: #666;
    width: 185px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.playlist-grid {
    display: flex;
    gap: 35px;
    flex-wrap: wrap;
    justify-content: space-evenly;
}

.playlist-item {
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 200px;
}

.playlist-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px var(--color-box-shadow);
}

.playlist-cover {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

.playlist-info {
    padding: 15px;
}

.playlist-title {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 16px;
    color: var(--primary-color);
}

.playlist-description {
    color: #666;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 50px;
    line-height: 25px;
}

.skeleton-loader {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 10px;
}

.skeleton-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 250px;
    border-radius: 10px;
    padding-left: 10px;
    background-color: #f0f0f0;
    height: 68px;
}

.skeleton-cover {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    border-radius: 10px;
    background-color: #e0e0e0;
}

.skeleton-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 190px;
}

.skeleton-line {
    height: 10px;
    background-color: #e0e0e0;
    margin-bottom: 5px;
    border-radius: 5px;
    width: 150px;
}
</style>