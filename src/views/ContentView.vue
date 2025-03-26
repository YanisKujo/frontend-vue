<template>
    <div class="container mt-5">
      <h2>{{ content.title }}</h2>
      <p>{{ content.content }}</p>
  
      <h4>Commentaires</h4>
      <ul>
        <li v-for="comment in comments" :key="comment.uuid">
          {{ comment.comment }}
        </li>
      </ul>
  
      <form v-if="token" @submit.prevent="postComment">
        <textarea v-model="commentText" class="form-control mb-3"></textarea>
        <button class="btn btn-primary">Ajouter commentaire</button>
      </form>
      <div v-else class="alert alert-warning">Connectez-vous pour commenter.</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import api from '../api/api';
  
  const route = useRoute();
  const content = ref({});
  const comments = ref([]);
  const commentText = ref('');
  const token = localStorage.getItem('token');
  
  onMounted(async () => {
    const resContent = await api.get(`/api/contents/${route.params.slug}`);
    content.value = resContent.data;
  
    const resComments = await api.get(`/api/comments?content=${content.value['@id']}`);
    comments.value = resComments.data.member;
  });
  
  const postComment = async () => {
    await api.post('/api/comments', {
      comment: commentText.value,
      content: content.value['@id'],
    });
    comments.value.push({ comment: commentText.value });
    commentText.value = '';
  };
  </script>  