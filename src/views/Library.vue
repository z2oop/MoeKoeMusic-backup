<template>
    <div class="library-page">
        <div class="profile-section">
            <img class="profile-pic" :src="user.pic" alt="{{ $t('yong-hu-tou-xiang') }}" />
            <h2 class="section-title">{{ user.nickname }}<span>{{ $t('de-yin-le-ku') }}</span></h2>
            <img v-if="userVip[0] && userVip[0].is_vip == 1" class="user-level"
                :src="`./assets/images/${userVip[0].product_type === 'svip' ? 'vip2' : 'vip'}.png`"
                :title="`${$t('gai-nian-ban')} ${userVip[0].vip_end_time}`" />
            <img v-if="userVip[1] && userVip[1].is_vip == 1" class="user-level"
                :src="`./assets/images/${userVip[1].product_type === 'svip' ? 'vip2' : 'vip'}.png`"
                :title="`${$t('chang-ting-ban')} ${userVip[1].vip_end_time}`" />
        </div>
        <h2 class="section-title" style="margin-bottom: 0px;">{{ $t('wo-xi-huan-ting') }}</h2>
        <div class="favorite-section">
            <div class="song-list">
                <ul v-if="listenHistory.length > 0">
                    <li v-for="(song, index) in listenHistory" :key="index" class="song-item"
                        @click="playSong($getQuality(null, song), song.name.split(' - ')[1] || song.name, $getCover(song.image, 480), song.singername)">
                        <img :src="song.image ? $getCover(song.image, 120) : './assets/images/ico.png'" alt="cover"
                            class="album-cover" />
                        <div class="song-info">
                            <p class="album-name">{{ song.name.split(' - ')[1] || song.name }}</p>
                            <p class="singer-name">{{ song.singername }}</p>
                        </div>
                    </li>
                </ul>
                <el-empty v-else :description="t('zhe-li-shi-mo-du-mei-you')" />
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
            <template v-if="selectedCategory === 0 || selectedCategory === 1 || selectedCategory === 2">
                <div class="music-card"
                    v-for="(item, index) in (selectedCategory === 0 ? userPlaylists : selectedCategory === 1 ? collectedPlaylists : collectedAlbums)"
                    :key="index">
                    <router-link :to="{
                        path: '/PlaylistDetail',
                        query: { global_collection_id: item.list_create_gid || item.global_collection_id, listid: item.listid}
                    }">
                        <img :src="item.pic ? $getCover(item.pic, 480) : './assets/images/live.png'"
                            class="album-image" />
                        <div class="album-info">
                            <h3>{{ item.name }}</h3>
                            <p>{{ item.count }} <span>{{ $t('shou-ge') }}</span></p>
                        </div>
                    </router-link>
                </div>
                <div v-if="selectedCategory === 0" class="music-card" @click="createPlaylist">
                    <div class="create-playlist-button">
                        <i class="fas fa-plus"></i>
                        <img :src="`./assets/images/ti111mg.png`" alt="cover">
                    </div>
                    <div class="album-info">
                        <h3>{{ $t('chuang-jian-ge-dan') }}</h3>
                    </div>
                </div>
            </template>
            <div v-if="selectedCategory === 3 || selectedCategory === 4" class="music-card"
                v-for="(artist, index) in (selectedCategory === 3 ? followedArtists : collectedFriends)" :key="index">

                <img :src="artist.pic" alt="artist avatar" class="album-image" />
                <div class="album-info">
                    <h3>{{ artist.nickname }}</h3>
                </div>
            </div>
        </div>
        <el-empty v-if="
        (selectedCategory == 0 && userPlaylists.length === 0) || 
        (selectedCategory == 1 && collectedPlaylists.length === 0) || 
        (selectedCategory == 2 && collectedAlbums.length === 0) || 
        (selectedCategory == 3 && followedArtists.length === 0) || 
        (selectedCategory == 4 && collectedFriends.length === 0)"
            :description="t('zhe-li-shi-mo-du-mei-you')" />
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
const userPlaylists = ref([]); // 创建的歌单
const collectedPlaylists = ref([]); // 收藏的歌单
const collectedAlbums = ref([]); // 收藏的专辑
const collectedFriends = ref([]); // 好友
const followedArtists = ref([]); // 关注的歌手
const listenHistory = ref([]); // 听歌历史
const userVip = ref({});
const categories = ref([t('wo-chuang-jian-de-ge-dan'), t('wo-shou-cang-de-ge-dan'), t('wo-shou-cang-de-zhuan-ji'), t('wo-guan-zhu-de-ge-shou'), t('wo-guan-zhu-de-hao-you')]);
const selectedCategory = ref(0);
const selectCategory = (index) => {
    selectedCategory.value = index;
    router.replace({ path: '/library', query: { category: index } });
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
    selectedCategory.value = parseInt(router.currentRoute.value.query.category || 0);
}
const getVipInfo = async () => {
    try {
        const VipInfoResponse = await get('/user/vip/detail');
        if (VipInfoResponse.status === 1) {
            userVip.value = VipInfoResponse.data.busi_vip
            getUserDetails();
        }
    } catch (error) {
        window.$modal.alert(t('deng-lu-shi-xiao-qing-zhong-xin-deng-lu'));
        router.push('/login');
    }
}

const getlisten = async () => {
    const historyResponse = await get('/user/listen', { type: 1 });
    if (historyResponse.status === 1) {
        const allLists = historyResponse.data.lists;
        const shuffled = allLists.sort(() => 0.5 - Math.random());
        listenHistory.value = shuffled.slice(0, 16);
    }
}
const getfollow = async () => {
    const followResponse = await get('/user/follow');
    if (followResponse.status === 1) {
        if (!followResponse.data.lists || followResponse.data.lists.length == 0) return;
        const artists = followResponse.data.lists.map(artist => ({
            ...artist,
            pic: artist.pic.replace('/100/', '/480/')
        }));
        collectedFriends.value = artists.filter(artist => artist.userid !== 0);
        followedArtists.value = artists.filter(artist => artist.userid === 0);
    }
}
const getplaylist = async () => {
    const playlistResponse = await get('/user/playlist?pagesize=100');
    if (playlistResponse.status === 1) {
        userPlaylists.value = playlistResponse.data.info.filter(playlist => playlist.list_create_userid === user.value.userid || playlist.name === '我喜欢').sort((a, b) => a.name === '我喜欢' ? -1 : 1);
        collectedPlaylists.value = playlistResponse.data.info.filter(playlist => playlist.list_create_userid !== user.value.userid && !playlist.authors);
        collectedAlbums.value = playlistResponse.data.info.filter(playlist => playlist.list_create_userid !== user.value.userid && playlist.authors);
    }
}
const createPlaylist = async () => {
    const result = await window.$modal.prompt(t('qing-shu-ru-xin-de-ge-dan-ming-cheng'), '');
    if (result) {
        try {
            const playlistResponse = await get('/playlist/add', { name: result, list_create_userid: user.value.userid });
            if (playlistResponse.status === 1) {
                window.$modal.alert(t('chuang-jian-cheng-gong-deng-dai-huan-cun-geng-xin'));
            }
        } catch (error) {
            window.$modal.alert(t('chuang-jian-shi-bai'));
        }
    }
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

.create-playlist-button {
    width: 100%;
    height: 68%;
    color: var(--primary-color);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--secondary-color);
    cursor: pointer;
    position: relative;
}

.create-playlist-button img {
    position: absolute;
    right: 0px;
    bottom: 0px;
}

.create-playlist-button i {
    font-size: 30px;
}
</style>