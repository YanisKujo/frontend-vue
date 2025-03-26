import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost',
    headers: {
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🟢 Token ajouté à la requête :', `Bearer ${token}`);
    } else {
      console.warn('⚠️ Aucun token trouvé.');
    }
    return config;
  });  


export default api;