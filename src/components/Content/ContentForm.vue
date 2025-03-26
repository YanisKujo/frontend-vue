<template>
  <div class="container mt-5">
    <h2>{{ isEditing ? 'Modifier le contenu' : 'Créer un nouveau contenu' }}</h2>

    <form @submit.prevent="handleSubmit">
      <input v-model="title" class="form-control mb-3" placeholder="Titre" required />
      <textarea v-model="content" class="form-control mb-3" placeholder="Contenu" required></textarea>

      <!-- 🖼️ Affichage de l'image existante lors de la modification -->
      <div v-if="isEditing && coverPath" class="mb-3">
        <p>Image actuelle :</p>
        <img 
          :src="`https://localhost${coverPath}`" 
          class="img-fluid mb-3"
          style="max-height: 300px;"
          alt="Image de couverture"
        />
        <button 
          @click.prevent="deleteCurrentImage" 
          class="btn btn-danger btn-sm"
        >
          Supprimer l'image actuelle
        </button>
      </div>

      <!-- 📂 Téléversement d'une nouvelle image -->
      <input 
        type="file" 
        @change="handleFileUpload" 
        class="form-control mb-3"
        accept="image/*"
      />

      <input v-model="metaTitle" class="form-control mb-3" placeholder="Meta Title" />
      <textarea v-model="metaDescription" class="form-control mb-3" placeholder="Meta Description"></textarea>
      <input v-model="tags" class="form-control mb-3" placeholder="Tags (séparés par des virgules)" />

      <button class="btn btn-success" data-cy="submit-content">
        {{ isEditing ? 'Modifier' : 'Créer' }}
      </button>

    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api/api';
import { useUserStore } from '../../stores/userStore';

const emit = defineEmits(['contentCreated']); // ✅ Ajout pour émettre un événement vers le parent

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const title = ref('');
const content = ref('');
const coverPath = ref('');
const uploadedFile = ref(null);
const metaTitle = ref('');
const metaDescription = ref('');
const tags = ref('');
const isEditing = computed(() => !!route.params.slug);

onMounted(async () => {
  if (isEditing.value) {
    const res = await api.get(`/api/contents/${route.params.slug}`);
    const contentData = res.data;

    title.value = contentData.title;
    content.value = contentData.content;
    metaTitle.value = contentData.metaTitle;
    metaDescription.value = contentData.metaDescription;
    tags.value = contentData.tags.join(', ');

    if (contentData.cover) {
      const resUpload = await api.get(contentData.cover);
      coverPath.value = resUpload.data.path;
    }
  }
});

const handleFileUpload = (event) => {
  uploadedFile.value = event.target.files[0];
};

const deleteCurrentImage = () => {
  coverPath.value = '';
  uploadedFile.value = null;
};

const handleSubmit = async () => {
  const contentData = {
    title: title.value,
    content: content.value,
    cover: uploadedFile.value ? null : coverPath.value,
    metaTitle: metaTitle.value || null,
    metaDescription: metaDescription.value || null,
    tags: tags.value ? tags.value.split(',').map(tag => tag.trim()) : [],
    author: `/api/users/${userStore.user.uuid}` 
  };

  try {
    console.log('🔎 Données envoyées :', contentData);

    if (uploadedFile.value) {
      const formData = new FormData();
      formData.append('file', uploadedFile.value);

      const resUpload = await api.post('/api/uploads', formData);
      contentData.cover = resUpload.data['@id'];
    }

    if (isEditing.value) {
      await api.put(`/api/contents/${route.params.slug}`, contentData);
      router.push('/');
    } else {
      await api.post('/api/contents', contentData);
      emit('contentCreated');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création/modification du contenu :', error.response?.data || error);
    alert('❌ Erreur lors de la création/modification du contenu.');
  }
};
</script>
