<script setup>
import api from '../../api/api';
import { ref } from 'vue';

const props = defineProps(['contentSlug']); // 🟡 Remplacé contentId par contentSlug
const emit = defineEmits(['commentAdded']);
const comment = ref('');

const postComment = async () => {
  try {
    await api.post('/api/comments', {
      comment: comment.value,
      content: `/api/contents/${props.contentSlug}`, // 🔄 Utilisation du slug au lieu de l'uuid
    });
    comment.value = '';
    emit('commentAdded'); // 🔄 Émettre un événement pour recharger les commentaires
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du commentaire :', error);
    alert('❌ Erreur lors de l\'ajout du commentaire.');
  }
};
</script>

<template>
  <form @submit.prevent="postComment">
    <textarea v-model="comment" placeholder="Votre commentaire" class="form-control"></textarea>
    <button type="submit" data-cy="submit-comment" class="btn btn-primary mt-2">Publier</button>
  </form>
</template>
