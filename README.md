# 🖥️ CMS Vue.js - Projet MMI

## 👤 Réalisé par : **Yanis Rechrach**

## 📦 Dépôts GitHub

- 🔗 [Frontend (Vue.js)](https://github.com/YanisKujo/frontend-vue)
- 🔗 [Backend (Symfony + API Platform)](https://github.com/YanisKujo/backend-api)

---

## 🚀 Fonctionnalités

- Authentification (inscription, connexion)
- Gestion de contenus (CRUD)
- Ajout, modification, suppression de commentaires
- Upload d'image pour chaque contenu
- Admin dashboard pour gérer les Users et Contenus
- Tests automatisés via Cypress

---

## 👥 Comptes de test

| Rôle         | Email              | Mot de passe |
|--------------|--------------------|--------------|
| 👑 Admin      | admin@gmail.com     | admin        |
| 👤 Utilisateur | test@gmail.com      | test         |

---

## ⚙️ Installation

### 1. Cloner le projet frontend
```
git clone https://github.com/YanisKujo/frontend-vue.git
cd frontend-vue
npm install
````
### 2. Lancer le frontend
```
npm run dev
```
Assurez-vous que le backend (API Symfony) est démarré et disponible sur https://localhost (le certif SSL est expiré, il faut valider le fait de continuer sur le site avant d'utiliser le Front)

### 3.🧪 Lancer les tests Cypress
```
npx cypress open
```
Les tests couvrent tout le parcours utilisateur : inscription, connexion, création/modification/suppression de contenu et commentaires, mise à jour du profil.
