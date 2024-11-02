<template>
    <div class="search-page">
        <div v-if="searchResults.length > 0" class="search-results">
            <h2 class="section-title">搜索结果</h2>
            <ul>
                <li v-for="(result, index) in searchResults" :key="index" class="result-item" @click="playSong(result.FileHash, result.FileName, $getCover(result.Image, 480), result.SingerName)">
                    <img :src="$getCover(result.Image, 100)" alt="Cover" />
                    <div class="result-info">
                        <p class="result-name">{{ result.SongName }}</p>
                        <p class="result-type">{{ result.SingerName }}</p>
                    </div>
                </li>
            </ul>
            <div class="pagination">
                <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
                <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
                <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { get } from '../utils/request';
import { useRoute } from 'vue-router';
const route = useRoute();
const searchQuery = ref(route.query.q || '');
const searchResults = ref([]);
const currentPage = ref(1);
const pageSize = ref(30);
const totalPages = ref(1);

onMounted(() => {
    performSearch();
});
watch(() => route.query.q, (newQuery) => {
    searchQuery.value = newQuery;
    performSearch(); 
});
const props = defineProps({
  playerControl: Object
});
const playSong = (hash, name, img, author) => {
    props.playerControl.addSongToQueue(hash, name, img, author);
};
const performSearch = async () => {
    if (!searchQuery.value) return;
    try {
        const response = await get('/search', {
            keywords: searchQuery.value,
            page: currentPage.value,
            pagesize: pageSize.value,
        });

        if (response.status === 1) {
            searchResults.value = response.data.lists;
            totalPages.value = Math.ceil(response.data.total / pageSize.value);
        }
    } catch (error) {
        console.error("搜索请求失败", error);
    } 
};

// 分页操作
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
        performSearch(); // 执行搜索
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        performSearch(); // 执行搜索
    }
};
</script>

<style scoped>
.search-results {
    padding: 20px;
}

.result-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s;
    cursor: pointer;
    border-radius: 5px;
    padding-left: 10px;
}

.result-item:hover {
    background-color: #f5f5f5;
}

.result-item img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    margin-right: 10px;
}

.result-info {
    display: flex;
    flex-direction: column;
}

.result-name {
    font-size: 16px;
    font-weight: bold;
    height: 23px;
    margin: 0;
    max-width: 900px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.result-type {
    font-size: 14px;
    color: #666;
    height: 18px;
    max-width: 900px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 6px;
    margin-bottom: 0px;
}

.pagination {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.pagination button {
    padding: 10px 15px;
    margin: 0 5px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
.section-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
    color: var(--primary-color);
}
.pagination span {
    font-size: 14px;
    color: #666;
    line-height: 38px;
}
</style>