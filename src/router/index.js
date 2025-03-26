import { createRouter, createWebHistory } from 'vue-router';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

import HomeView from '../views/HomeView.vue';
import AdminView from '../views/AdminView.vue';
import LoginView from '../components/Auth/Login.vue';
import RegisterView from '../components/Auth/Register.vue';
import ContentView from '../views/ContentView.vue';
import ContentList from '../components/Content/ContentList.vue';
import ContentForm from '../components/Content/ContentForm.vue';
import ContentDetail from '../components/Content/ContentDetail.vue';
import ProfileView from '../components/ProfileView.vue';

const routes = [
  { path: '/', component: ContentList },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/content/:slug', component: ContentView }, // ✅ Accessible sans connexion
  { path: '/contents/:slug', component: ContentDetail }, // ✅ Accessible sans connexion
  { path: '/contents/new', component: ContentForm, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/contents/edit/:slug', component: ContentForm, meta: { requiresAuth: true } },
  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_EDITOR'] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  // 🔓 Routes publiques (login, register, et accès aux contenus sans restriction)
  if (
    to.path === '/login' ||
    to.path === '/register' ||
    to.path.startsWith('/contents/') && !to.path.endsWith('/new')
  ) {
    next();
    return;
  }

  // 🔐 Bloquer l'accès à `/contents/new` pour les non-connectés
  if (!token && to.path === '/contents/new') {
    next('/login');
    return;
  }

  // 🔐 Vérifie si une connexion est requise
  if (!token && to.meta.requiresAuth) {
    next('/login');
    return;
  }

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;

      const res = await api.get('/api/users');
      const foundUser = res.data.member.find(user => user.email === userEmail);

      if (foundUser) {
        const userRoles = foundUser.roles;

        if (to.meta.requiresAuth) {
          if (!to.meta.roles || to.meta.roles.some(role => userRoles.includes(role))) {
            next();
          } else {
            next('/');
          }
        } else {
          next();
        }
      } else {
        next('/login');
      }
    } catch (e) {
      localStorage.removeItem('token');
      next('/login');
    }
  } else {
    next();
  }
});


export default router;
