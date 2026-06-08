import axios from 'axios';

// Création d'une instance Axios pointant vers notre backend FastAPI
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// INTERCEPTEUR : Ajoute automatiquement le Token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    // On récupère le token stocké dans le navigateur (après la connexion)
    const token = localStorage.getItem('token');
    
    // Si le token existe, on l'ajoute dans les en-têtes (Headers) de sécurité
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;