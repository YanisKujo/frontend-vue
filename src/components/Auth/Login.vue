<template>
    <div class="container mt-5">
      <h2>Connexion</h2>
      <form @submit.prevent="login">
        <input v-model="email" class="form-control mb-3" placeholder="Email" required>
        <input v-model="password" type="password" class="form-control mb-3" placeholder="Mot de passe" required>
        <button class="btn btn-primary">Connexion</button>
      </form>
      <p class="mt-3">
        Pas encore de compte ? <router-link to="/register">Inscrivez-vous ici.</router-link>
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '../../api/api';
  import { useUserStore } from '../../stores/userStore';
  
  const email = ref('');
  const password = ref('');
  const router = useRouter();
  const userStore = useUserStore();
  const { fetchUser } = userStore;
  
  const login = async () => {
  try {
    const res = await api.post('/api/login', {
      email: email.value,
      password: password.value,
    });

    const token = res.data.token;
    console.log('✅ Token JWT reçu :', token);

    localStorage.setItem('token', token);

    await fetchUser();
    router.push('/').then(() => {
      location.reload();
    });
    
  } catch (e) {
    console.error('❌ Erreur de connexion:', e);
    alert('Erreur de connexion');
  }
};
  </script>  