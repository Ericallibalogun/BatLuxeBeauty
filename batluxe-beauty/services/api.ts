
import axios from 'axios';

const API_BASE_URL = 'https://beauty-ecommerceapp-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalized public paths to prevent redirects for guest users
const PUBLIC_FRONTEND_PATHS = ['/', '/shop', '/contact', '/cart', '/faqs', '/terms', '/privacy', '/about', '/shipping'];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else {
    delete config.headers.Authorization;
  }
  
  if (config.url && !config.url.startsWith('http')) {
    if (!config.url.startsWith('/')) {
      config.url = '/' + config.url;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentHash = window.location.hash || '#/';
    const isLoginPage = currentHash.includes('/login') || currentHash.includes('/admin-login');
    
    // Better path cleaning for HashRouter
    let cleanPath = currentHash.replace(/^#/, '').split('?')[0] || '/';
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    if (error.response) {
      const status = error.response.status;

      // Handle session expiration (401)
      if (status === 401 && !isLoginPage) {
        const isPublicPage = PUBLIC_FRONTEND_PATHS.some(p => cleanPath === p);
        
        if (!isPublicPage) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('storage'));
          window.location.hash = currentHash.includes('/admin/') ? '/admin-login' : '/login';
        } else {
          // Stay on the public page but clear stale session
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('storage'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
