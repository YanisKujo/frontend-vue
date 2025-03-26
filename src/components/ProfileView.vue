<template>
    <div class="container mt-5">
      <h2>Modifier mon profil</h2>
  
      <form @submit.prevent="updateProfile" v-if="userLoaded">
        <div class="mb-3">
          <label for="firstName" class="form-label">Prénom</label>
          <input
            v-model="firstName"
            id="firstName"
            class="form-control"
            required
          />
        </div>
  
        <div class="mb-3">
          <label for="lastName" class="form-label">Nom</label>
          <input
            v-model="lastName"
            id="lastName"
            class="form-control"
            required
          />
        </div>
  
        <div class="mb-3">
          <label for="email" class="form-label">Email (non modifiable)</label>
          <input
            v-model="email"
            id="email"
            class="form-control"
            readonly
          />
        </div>
  
        <div class="mb-3">
          <label for="password" class="form-label">Nouveau mot de passe (laisser vide si inchangé)</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="form-control"
          />
        </div>
  
        <button class="btn btn-primary">Enregistrer les modifications</button>
      </form>
  
      <!-- 🔎 Message de chargement si l'utilisateur n'est pas encore prêt -->
      <p v-else class="alert alert-info">Chargement des informations du profil...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '../stores/userStore';
  import { storeToRefs } from 'pinia';
  import api from '../api/api';
  
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore); // 🔥 `user` en tant que `ref`
  const { fetchUser } = userStore;         // 🔥 `fetchUser` directement depuis `userStore`
  
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const password = ref('');
  const userLoaded = ref(false);
  
  onMounted(async () => {
    await fetchUser(); 
    if (user.value && user.value.firstName) {
      firstName.value = user.value.firstName;
      lastName.value = user.value.lastName;
      email.value = user.value.email;
      userLoaded.value = true; // ✅ Indique que les données sont bien chargées
    } else {
      console.warn('⚠️ Aucune donnée utilisateur trouvée dans ProfileView.');
    }
  });
  
  const updateProfile = async () => {
  try {
    const updatedData = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value || user.value.password, // 🔥 important pour éviter null
      roles: user.value.roles,
    };

    await api.put(`/api/users/${user.value.uuid}`, updatedData);
    await fetchUser();
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil :', error);
    alert('❌ Erreur lors de la mise à jour du profil.');
  }
};



    </script>  