<template>
    <div class="container mt-4">
      <h2>Articles</h2>
      <ul class="list-group">
        <li v-for="content in contents" :key="content.uuid" class="list-group-item">
          <router-link :to="`/content/${content.slug}`">{{ content.title }}</router-link>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import api from '../api/api';
  
  const contents = ref([]);
  
  onMounted(async () => {
    const res = await api.get('/api/contents');
    contents.value = res.data.member;
  });
  </script>  