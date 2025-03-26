import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

export const useUserStore = defineStore('user', () => {
  const user = ref({});

  async function fetchUser() {
    console.log('🟡 fetchUser() appelé');
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ Aucun token trouvé.');
        return;
      }
  
      console.log('✅ Token trouvé :', token);
  
      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;
  
      console.log('🟢 Email du token décodé :', userEmail);
  
      const res = await api.get('/api/users');
      console.log('🔍 Résultat de l\'API :', res.data);
  
      const foundUser = res.data.member.find(user => user.email === userEmail);
  
      if (foundUser) {
        console.log('✅ Utilisateur trouvé :', foundUser);
        console.log('Prénom :', foundUser.firstName);
        console.log('Rôle :', foundUser.roles[0]);
        user.value = foundUser;
      } else {
        console.warn('⚠️ Utilisateur non trouvé.');
        user.value = {};
      }
    } catch (e) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', e);
      user.value = {};
    }
  }
  

  function logout() {
    localStorage.removeItem('token');
    user.value = {};
    // recharge la page pour forcer la redirection
    location.reload();
  }

  return { user, fetchUser, logout };
});