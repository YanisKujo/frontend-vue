<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/">YR Web</router-link>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Accueil</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/contents/new">Créer un contenu</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/admin">Administration</router-link>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto" v-if="isLoggedIn">
          <li class="nav-item">
            <router-link class="nav-link" to="/profile">Mon profil</router-link>
          </li>
          <li class="nav-item">
            <span class="nav-link">Bonjour, {{ userFirstName }}</span>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-danger" @click="logout">Déconnexion</button>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto" v-else>
          <li class="nav-item">
            <router-link class="nav-link" to="/login">Connexion</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const userStore = useUserStore();
const { user, fetchUser, logout } = userStore;

// 🔥 Utilisation de `storeToRefs` pour que `user` devienne réactif
const { user: reactiveUser } = storeToRefs(userStore);

const userFirstName = computed(() => reactiveUser.value?.firstName);
const userRoles = computed(() => reactiveUser.value?.roles || []);

const isLoggedIn = computed(() => !!localStorage.getItem('token'));
const isAdmin = computed(() => userRoles.value.some(role => ['ROLE_ADMIN', 'ROLE_EDITOR'].includes(role)));

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchUser();
  }
});
</script>
