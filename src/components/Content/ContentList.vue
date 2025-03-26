<template>
  <div class="content-container">
    <h2 class="page-title">Contenus disponibles</h2>

    <button 
      class="btn btn-outline-primary filter-toggle"
      @click="showFilters = !showFilters"
    >
      {{ showFilters ? 'Masquer les filtres' : 'Afficher les filtres' }}
    </button>

    <div v-if="showFilters" class="filters p-3 mb-4">
      <input 
        v-model="filters.keyword" 
        @input="filterContents" 
        placeholder="🔎 Rechercher par mots-clés" 
        class="form-control mb-2"
      />

      <input 
        v-model="filters.author" 
        @input="filterContents" 
        placeholder="👤 Filtrer par auteur" 
        class="form-control mb-2"
      />

      <input 
        v-model="filters.date" 
        @input="filterContents" 
        type="date" 
        class="form-control"
      />
    </div>

    <div class="content-list">
      <div v-for="content in filteredContents" :key="content.uuid" class="content-card">
        <RouterLink :to="`/contents/${content.slug}`" class="content-title">
          {{ content.title }}
        </RouterLink>

        <div v-if="isAuthorOrAdmin(content)" class="content-actions">
          <router-link 
            :to="`/contents/edit/${content.slug}`" 
            class="btn btn-warning btn-sm"
          >
            Modifier
          </router-link>
          <button 
            @click="deleteContent(content.slug)" 
            class="btn btn-danger btn-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- 🔘 Bouton d'ouverture du modal -->
    <button class="btn btn-success create-content-btn" @click="showModal = true">
      ➕ Créer un nouveau contenu
    </button>

    <!-- 🧩 Modal avec ContentForm -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-content">
        <button class="btn-close" @click="showModal = false">✖</button>
        <ContentForm @contentCreated="handleContentCreated" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/api';
import { useUserStore } from '../../stores/userStore';
import ContentForm from './ContentForm.vue'; // 👈 Import du formulaire

const contents = ref([]);
const filteredContents = ref([]);
const showFilters = ref(false);
const showModal = ref(false);
const filters = ref({
  keyword: '',
  author: '',
  date: '',
});

const userStore = useUserStore();
const { user } = userStore;

onMounted(async () => {
  const res = await api.get('/api/contents');
  contents.value = res.data.member;
  filteredContents.value = contents.value;
});

const filterContents = () => {
  filteredContents.value = contents.value.filter(content => {
    const matchesKeyword = content.title.toLowerCase().includes(filters.value.keyword.toLowerCase()) 
                        || content.content.toLowerCase().includes(filters.value.keyword.toLowerCase());

    const matchesAuthor = filters.value.author 
                        ? content.author.toLowerCase().includes(filters.value.author.toLowerCase()) 
                        : true;

    const matchesDate = filters.value.date 
                      ? new Date(content.createdAt) >= new Date(filters.value.date)
                      : true;

    return matchesKeyword && matchesAuthor && matchesDate;
  });
};

const isAuthorOrAdmin = (content) => {
  return user.value?.roles.includes('ROLE_ADMIN') || content.author === user.value?.['@id'];
};

const deleteContent = async (slug) => {
  if (confirm('Voulez-vous vraiment supprimer ce contenu ?')) {
    await api.delete(`/api/contents/${slug}`);
    contents.value = contents.value.filter(content => content.slug !== slug);
    filteredContents.value = filteredContents.value.filter(content => content.slug !== slug);
    alert('Contenu supprimé avec succès !');
  }
};

// 🔄 Recharge la liste après ajout
const handleContentCreated = async () => {
  showModal.value = false;
  const res = await api.get('/api/contents');
  contents.value = res.data.member;
  filteredContents.value = contents.value;
};
</script>

<style scoped>
.content-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.page-title {
  text-align: center;
  margin-bottom: 20px;
  color: #007bff;
  font-weight: bold;
}

.filters {
  background-color: #f0f2f5;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.filter-toggle {
  display: block;
  width: 100%;
  text-align: center;
  margin-bottom: 15px;
}

.content-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.content-card {
  background-color: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out;
}

.content-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.content-title {
  display: block;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
  margin-bottom: 8px;
}

.content-title:hover {
  text-decoration: underline;
}

.content-actions {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.create-content-btn {
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 20px;
}

/* 🧩 Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 20px;
  width: 90%;
  max-width: 700px;
  border-radius: 10px;
  position: relative;
  box-shadow: 0 0 15px rgba(0,0,0,0.3);
}

.btn-close {
  position: absolute;
  right: 15px;
  top: 10px;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
}
</style>
