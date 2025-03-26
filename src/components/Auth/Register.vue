<template>
    <div class="container mt-5">
      <h2>Inscription</h2>
      <form @submit.prevent="register">
        <input v-model="email" class="form-control mb-3" placeholder="Email" required>
        <input v-model="firstName" class="form-control mb-3" placeholder="Prénom" required>
        <input v-model="lastName" class="form-control mb-3" placeholder="Nom" required>
        <input v-model="password" type="password" class="form-control mb-3" placeholder="Mot de passe" required>
        <button class="btn btn-success">Inscription</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '../../api/api';
  
  const email = ref('');
  const firstName = ref('');
  const lastName = ref('');
  const password = ref('');
  const router = useRouter();
  
  const register = async () => {
    try {
      await api.post('/api/users', {
        email: email.value,
        firstName: firstName.value,
        lastName: lastName.value,
        password: password.value,
      });
      alert('Inscription réussie, connectez-vous !');
      router.push('/login');
    } catch (e) {
      alert('Erreur d\'inscription');
    }
  };
  </script>  