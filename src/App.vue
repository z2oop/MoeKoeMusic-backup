<template>
    <div id="app">
        <RouterView />
        <Disclaimer />
    </div>
</template>

<script setup>
import Disclaimer from '@/components/Disclaimer.vue';
</script>

<style scoped>
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}
</style>