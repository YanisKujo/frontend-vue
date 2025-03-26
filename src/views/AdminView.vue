<template>
  <div class="container mt-5">
    <h2>Dashboard Admin</h2>
    <p>Bienvenue, {{ user?.email }} ({{ user?.roles?.join(', ') }})</p>

    <hr>

    <h3>Gestion des Contenus</h3>

    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Titre</th>
          <th>Auteur</th>
          <th>Tags</th>
          <th>Date de création</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="content in contents" :key="content.uuid">
          <td>
            <router-link :to="`/contents/${content.slug}`">{{ content.title }}</router-link>
          </td>
          <td>{{ getAuthorName(content.author) }}</td> <!-- 🔄 Affichage du nom de l'auteur -->
          <td>{{ content.tags?.join(', ') || 'Aucun' }}</td>
          <td>{{ formatDate(content.createdAt) }}</td>
          <td>
            <button @click="deleteContent(content.slug)" class="btn btn-danger btn-sm">
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <hr>

    <h3>Gestion des Utilisateurs</h3>

    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Email</th>
          <th>Rôles</th>
          <th>Date d'inscription</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.uuid">
          <td>{{ u.email }}</td>
          <td>{{ u.roles?.join(', ') || 'Aucun' }}</td>
          <td>{{ formatDate(u.createdAt) }}</td>
          <td>
            <button 
              @click="deleteUser(u.uuid)" 
              class="btn btn-sm btn-danger"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import api from '../api/api';

const router = useRouter();
const userStore = useUserStore();
const { user, fetchUser } = userStore;

const contents = ref([]);
const users = ref([]);
const authors = ref({}); // 🔥 Stocker les auteurs avec leurs UUID

onMounted(async () => {
  await fetchUser();
});

// 🔥 Vérifie que l'utilisateur est ADMIN avant d'afficher la page
watchEffect(() => {
  if (user.value && !user.value.roles.includes('ROLE_ADMIN')) {
    router.push('/');
  }
});

// 🔄 Chargement des contenus
const loadContents = async () => {
  try {
    const resContents = await api.get('/api/contents');
    contents.value = resContents.data.member;

    // 🔥 Extraire les UUID des auteurs
    const authorUUIDs = [...new Set(contents.value.map(content =>
      content.author.split('/').pop()
    ))];

    await loadAuthors(authorUUIDs);
  } catch (error) {
    console.error('❌ Erreur lors du chargement des contenus :', error);
  }
};

// 🔄 Chargement des auteurs
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

// 🔄 Chargement des utilisateurs
const loadUsers = async () => {
  try {
    const resUsers = await api.get('/api/users');
    users.value = resUsers.data.member;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des utilisateurs :', error);
  }
};


// 🗑️ Suppression d'un contenu
const deleteContent = async (slug) => {
  if (confirm('Voulez-vous vraiment supprimer ce contenu ?')) {
    try {
      await api.delete(`/api/contents/${slug}`);
      contents.value = contents.value.filter(content => content.slug !== slug);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du contenu :', error);
      alert('❌ Erreur lors de la suppression du contenu.');
    }
  }
};

// 🗑️ Suppression d'un utilisateur
const deleteUser = async (uuid) => {
  if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
    try {
      await api.delete(`/api/users/${uuid}`);
      users.value = users.value.filter(user => user.uuid !== uuid);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur :', error);
      alert('❌ Erreur lors de la suppression de l\'utilisateur.');
    }
  }
};

// 🔄 Charger les contenus et utilisateurs dès le montage du composant
onMounted(() => {
  loadContents();
  loadUsers();
});

// 🔎 Récupérer le nom de l'auteur
const getAuthorName = (authorIri) => {
  const uuid = authorIri.split('/').pop();
  return authors.value[uuid] || 'Inconnu';
};

// 🔎 Formatage de la date pour affichage propre
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
};
</script>
