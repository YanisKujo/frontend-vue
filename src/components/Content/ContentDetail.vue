<template>
  <div class="container mt-5">
    <div class="content-card p-4 shadow-sm rounded bg-white mb-5">
      <h2 class="content-title mb-3">{{ content.title }}</h2>

      <img 
        v-if="coverPath" 
        :src="`https://localhost${coverPath}`" 
        class="img-fluid rounded mb-4 content-image"
        alt="Image de couverture"
      />

      <p class="content-body fs-5 lh-lg mb-4">{{ content.content }}</p>

      <p class="text-muted small">
        <i class="bi bi-person-circle"></i> Rédigé par :
        <strong>{{ getAuthorName(content.author) }}</strong><br />
        <i class="bi bi-calendar-event"></i> Créé le :
        <strong>{{ formatDate(content.createdAt) }}</strong>
      </p>

      <div class="d-flex gap-2 mt-3">
        <router-link 
          v-if="user && user['@id'] === content.author"
          :to="`/contents/edit/${content.slug}`" 
          class="btn btn-outline-warning"
        >
          ✏️ Modifier
        </router-link>

        <button 
          v-if="user && (user['@id'] === content.author || user.roles?.includes('ROLE_ADMIN'))"
          @click="deleteContent" 
          class="btn btn-outline-danger"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>

    <!-- 📝 Zone des Commentaires -->
    <h3>Commentaires</h3>
    <div v-if="comments.length > 0" class="comment-section">
      <div
        v-for="comment in comments"
        :key="comment.uuid"
        class="card comment-card mb-3"
      >
        <div class="card-body">
          <div v-if="editingCommentId === comment.uuid">
            <textarea v-model="editCommentText" class="form-control mb-2"></textarea>
            <button @click="updateComment(comment.uuid)" class="btn btn-success btn-sm me-2">
              Enregistrer
            </button>
            <button @click="cancelEdit" class="btn btn-secondary btn-sm">
              Annuler
            </button>
          </div>

          <div v-else>
            <p class="card-text">{{ comment.comment }}</p>
            <small class="text-muted">
              Posté par : {{ getAuthorName(comment.author) || 'Inconnu' }} |
              {{ formatDate(comment.createdAt) }}
            </small>
          </div>

          <div class="btn-group float-end">
            <button
              v-if="user && (user.roles?.includes('ROLE_ADMIN') || userIri === comment.author)"
              @click="deleteComment(comment.uuid)"
              class="btn btn-danger btn-sm"
            >
              🗑️
            </button>

            <button
              v-if="user && userIri === comment.author"
              @click="startEdit(comment)"
              class="btn btn-warning btn-sm ms-2"
            >
              ✏️ Modifier
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="alert alert-info">Aucun commentaire pour l'instant.</p>
    </div>

    <div v-if="isLoggedIn">
      <CommentForm :contentSlug="content.slug" @commentAdded="loadComments" />
    </div>
    <div v-else>
      <p class="alert alert-warning">Connectez-vous pour ajouter un commentaire.</p>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api/api';
import { useUserStore } from '../../stores/userStore';
import CommentForm from '../Comments/CommentForm.vue';

const userStore = useUserStore();
const { fetchUser } = userStore;
const { user } = storeToRefs(userStore);

const route = useRoute();
const content = ref({});
const comments = ref([]);
const authors = ref({});
const coverPath = ref('');
const editingCommentId = ref(null);
const editCommentText = ref('');
const isLoggedIn = !!localStorage.getItem('token');

const userIri = computed(() =>
  user.value?.uuid ? `/api/users/${user.value.uuid}` : null
);

onMounted(async () => {
  await fetchUser();

  const resContent = await api.get(`/api/contents/${route.params.slug}`);
  content.value = resContent.data;

  if (content.value.cover) {
    const resUpload = await api.get(content.value.cover);
    coverPath.value = resUpload.data.path;
  }

  const contentAuthorUUID = content.value.author?.split('/').pop();

  const resComments = await api.get(`/api/comments`);
  comments.value = resComments.data.member.filter(comment =>
    comment.content.endsWith(`/${content.value.slug}`)
  );

  const commentAuthorUUIDs = comments.value.map(comment =>
    comment.author?.split('/').pop()
  );

  const allUUIDs = [...new Set([contentAuthorUUID, ...commentAuthorUUIDs].filter(Boolean))];

  await loadAuthors(allUUIDs);
});

const deleteContent = async () => {
  if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;

  try {
    await api.delete(`/api/contents/${content.value.slug}`);
    window.location.href = '/';
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du contenu :', error);
    alert('❌ Erreur lors de la suppression du contenu.');
  }
};

const loadAuthors = async (authorUUIDs) => {
  try {
    const resUsers = await api.get('/api/users');
    const allUsers = resUsers.data.member;

    authors.value = authorUUIDs.reduce((acc, uuid) => {
      const foundUser = allUsers.find(user => user.uuid === uuid);
      acc[uuid] = foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Inconnu';
      return acc;
    }, {});
  } catch (error) {
    console.error('❌ Erreur lors du chargement des auteurs :', error);
  }
};

const loadComments = async () => {
  try {
    const resComments = await api.get(`/api/comments`);
    comments.value = resComments.data.member.filter(comment =>
      comment.content.endsWith(`/${content.value.slug}`)
    );

    const commentAuthorUUIDs = comments.value.map(comment =>
      comment.author?.split('/').pop()
    );

    await loadAuthors(commentAuthorUUIDs);
  } catch (error) {
    console.error('❌ Erreur lors du chargement des commentaires :', error);
  }
};


const deleteComment = async (uuid) => {
  if (confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
    try {
      await api.delete(`/api/comments/${uuid}`);
      comments.value = comments.value.filter(comment => comment.uuid !== uuid);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du commentaire :', error);
      alert('❌ Erreur lors de la suppression du commentaire.');
    }
  }
};

const startEdit = (comment) => {
  editingCommentId.value = comment.uuid;
  editCommentText.value = comment.comment;
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editCommentText.value = '';
};

const updateComment = async (uuid) => {
  try {
    await api.put(`/api/comments/${uuid}`, {
      comment: editCommentText.value,
      content: content.value['@id'],
      author: userIri.value,
    });

    const updatedComment = comments.value.find(c => c.uuid === uuid);
    if (updatedComment) {
      updatedComment.comment = editCommentText.value;
    }

    editingCommentId.value = null;
  } catch (error) {
    console.error('❌ Erreur lors de la modification du commentaire :', error);
    alert('❌ Erreur lors de la modification du commentaire.');
  }
};

const getAuthorName = (authorIri) => {
  if (!authorIri) return 'Inconnu';
  const uuid = authorIri.split('/').pop();
  return authors.value[uuid] || 'Inconnu';
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
};
</script>

<style scoped>
.content-card {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
}

.content-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.content-image {
  max-height: 350px;
  object-fit: cover;
  border: 1px solid #ddd;
}

.content-body {
  color: #444;
}

.comment-card {
  border-left: 4px solid #007bff;
  background-color: #f8f9fa;
}
.comment-card .btn-danger,
.comment-card .btn-warning {
  font-size: 0.8rem;
}
</style>
