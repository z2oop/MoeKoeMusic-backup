<template>
    <div class="library-page">
        <div class="profile-section">
            <img class="profile-pic" :src="user.pic" alt="{{ $t('yong-hu-tou-xiang') }}" />
            <h2 class="section-title">{{ user.nickname }}<span>{{ $t('de-yin-le-ku') }}</span></h2>
            <img v-if="userVip[0] && userVip[0].is_vip == 1" class="user-level"
                :src="`/assets/images/${userVip[0].product_type === 'svip' ? 'vip2' : 'vip'}.png`"
                :title="`${ $t('gai-nian-ban') } ${userVip[0].vip_end_time}`" /> 
            <img v-if="userVip[1] && userVip[1].is_vip == 1" class="user-level"
                :src="`/assets/images/${userVip[1].product_type === 'svip' ? 'vip2' : 'vip'}.png`"
                :title="`${ $t('chang-ting-ban') } ${userVip[1].vip_end_time}`" />
        </div>
        <h2 class="section-title" style="margin-bottom: 0px;">{{ $t('wo-xi-huan-ting') }}</h2>
        <div class="favorite-section">
            <div class="song-list">
                <ul>
                    <li v-for="(song, index) in listenHistory" :key="index" class="song-item"
                        @click="playSong(song.hash, (song.album_name ? song.album_name : song.name), $getCover(song.image, 120), song.author_name)">
                        <img :src="$getCover(song.image, 120)" alt="album cover" class="album-cover" />
                        <div class="song-info">
                            <p class="album-name">{{ song.album_name ? song.album_name : song.name }}</p>
                            <p class="singer-name">{{ song.singername }}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 分类导航 -->
        <div class="category-tabs">
            <button v-for="(tab, index) in categories" :key="index" :class="{ 'active': selectedCategory === index }"
                @click="selectCategory(index)">
                {{ tab }}
            </button>
        </div>

        <!-- 音乐卡片网格（显示歌单或关注的歌手） -->
        <div class="music-grid">
            <div v-if="selectedCategory === 0" class="music-card" v-for="(playlist, index) in userPlaylists"
                :key="index">
                <router-link :to="{
                    path: '/PlaylistDetail',
                    query: { global_collection_id: playlist.list_create_gid }
                }">
                    <img :src="playlist.pic ? $getCover(playlist.pic, 240) : 'https://dummyimage.com/240x240/ff6347/fff&text=live'"
                        alt="playlist cover" class="album-image" />
                    <div class="album-info">
                        <h3>{{ playlist.name }}</h3>
                        <p>{{ playlist.count }} <span>{{ $t('shou-ge') }}</span></p>
                    </div>
                </router-link>
            </div>
            <div v-if="selectedCategory === 1" class="music-card" v-for="(playlist, index) in collectedPlaylists"
                :key="index">
                <router-link :to="{
                    path: '/PlaylistDetail',
                    query: { global_collection_id: playlist.list_create_gid }
                }">
                    <img :src="$getCover(playlist.pic, 240)" alt="playlist cover" class="album-image" />
                    <div class="album-info">
                        <h3>{{ playlist.name }}</h3>
                        <p>{{ playlist.count }} <span>{{ $t('shou-ge') }}</span></p>
                    </div>
                </router-link>
            </div>
            <div v-if="selectedCategory === 2" class="music-card" v-for="(artist, index) in followedArtists"
                :key="index">

                <img :src="artist.pic" alt="artist avatar" class="album-image" />
                <div class="album-info">
                    <h3>{{ artist.nickname }}</h3>
                </div>
            </div>
        </div>
        <el-empty v-if="(selectedCategory == 0 && userPlaylists.length === 0) || (selectedCategory == 1 && collectedPlaylists.length === 0) || (selectedCategory == 2 && followedArtists.length === 0)" :description="t('zhe-li-shi-mo-du-mei-you')" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { get } from '../utils/request';
import { MoeAuthStore } from '../stores/store';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const router = useRouter();
const MoeAuth = MoeAuthStore();
const user = ref({});
const userPlaylists = ref([]);
const collectedPlaylists = ref([]);
const followedArtists = ref([]);
const listenHistory = ref([]);
const userVip = ref({});
// 分类标签和选中状态
const categories = ref([t('wo-chuang-jian-de-ge-dan'), t('wo-shou-cang-de-ge-dan'), t('wo-guan-zhu-de-ge-shou')]);
const selectedCategory = ref(0); // 默认选中第一个

// 分类标签切换
const selectCategory = (index) => {
    selectedCategory.value = index;
};

const playSong = (hash, name, img, author) => {
    props.playerControl.addSongToQueue(hash, name, img, author);
};

const props = defineProps({
    playerControl: Object
});

onMounted(() => {
    if (MoeAuth.isAuthenticated) {
        user.value = MoeAuth.UserInfo;
        // 获取用户vip信息
        getVipInfo()
    }
});
const getUserDetails = () => {
    // 获取用户创建和收藏的歌单
    getplaylist()
    // 获取用户关注的歌手
    getfollow()
    // 获取用户听歌历史
    getlisten()

    if (canRequestVip()) {
        // 自动领取VIP
        get('/youth/vip')
        // 刷新token
        // get(`/login/token?token=${user.value.token}&userid=${user.value.userid}`);
    }
}
const getVipInfo = async () => {
    const VipInfoResponse = await get('/user/vip/detail');
    if (VipInfoResponse.status === 1) {
        userVip.value = VipInfoResponse.data.busi_vip
        getUserDetails();
    } else {
        window.$modal.alert(t('deng-lu-shi-xiao-qing-zhong-xin-deng-lu'));
        router.push('/login');
    }
}
const getlisten = async () => {
    const historyResponse = await get('/user/listen', { type: 1 });
    if (historyResponse.status === 1) {
        listenHistory.value = historyResponse.data.lists.slice(0, 16);
    }
}
const getfollow = async () => {
    const followResponse = await get('/user/follow');
    if (followResponse.status === 1) {
        followedArtists.value = followResponse.data.lists;
    }
}
const getplaylist = async () => {
    const playlistResponse = await get('/user/playlist');
    if (playlistResponse.status === 1) {
        userPlaylists.value = playlistResponse.data.info.filter(playlist => playlist.list_create_username === user.value.nickname);
        collectedPlaylists.value = playlistResponse.data.info.filter(playlist => playlist.list_create_username !== user.value.nickname);
    }
}
const canRequestVip = () => {
    const lastRequestTime = localStorage.getItem('lastVipRequestTime');
    if (lastRequestTime) {
        const now = new Date().getTime();
        const elapsedTime = now - parseInt(lastRequestTime);
        const threeHours = 3 * 60 * 60 * 1000;
        if (elapsedTime < threeHours) {
            return false;
        }
    }
    localStorage.setItem('lastVipRequestTime', new Date().getTime().toString());
    return true;
}
</script>

<style scoped>
.library-page {
    padding: 20px;
}

.user-level {
    width: 50px;
    margin-left: 10px;
    cursor: pointer;
}


.section-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
    color: var(--primary-color);
}

.profile-section {
    display: flex;
    align-items: center;
}

.profile-pic {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    margin-right: 15px;
}

.favorite-section {
    display: flex;
    justify-content: space-between;
}

.favorite-playlist {
    background-color: var(--background-color);
    padding: 20px;
    border-radius: 12px;
    flex: 1;
    margin-right: 20px;
    border: 1px solid var(--secondary-color);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.playlist-info p {
    margin: 10px 0;
}

.play-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 10px 15px;
    cursor: pointer;
}

.play-button i {
    font-size: 16px;
}

.song-list {
    flex: 1;
}

.song-list ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.song-list li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 250px;
    cursor: pointer;
    border-radius: 10px;
    padding-left: 10px;
}

.song-list li:hover {
    background-color: var(--background-color);
}

.song-list img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    border-radius: 6px;
}

.category-tabs {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.category-tabs button {
    padding: 10px 15px;
    border: none;
    background-color: #f5f5f5;
    border-radius: 20px;
    cursor: pointer;
}

.category-tabs button.active {
    background-color: var(--primary-color);
    color: white;
}

.music-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}

.music-card {
    text-align: center;
}

.album-image {
    width: 100%;
    border-radius: 12px;
}

.album-info h3 {
    margin: 10px 0 5px;
    font-size: 16px;
}

.album-info p {
    color: #666;
    font-size: 14px;
}

.song-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.album-cover {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    border-radius: 5px;
}

.song-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 190px;
}

.album-name,
.singer-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.album-name {
    font-weight: bold;
    margin-bottom: -5px;
    font-size: 14px;
    color: #333;
}

.singer-name {
    font-size: 12px;
    color: #666;
}
</style>