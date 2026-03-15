// src/api/axios.js
// ---------------------------------------------------------------------------
// Axios Instance Configuration
// Sets the base URL and automatically adds the JWT token to every request.
// ---------------------------------------------------------------------------

import axios from 'axios'

// Create an axios instance with our backend's base URL
// In production: VITE_API_URL = https://your-backend.railway.app/api
// In local dev: falls back to '/api' (proxied by vite.config.js to localhost:5000)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})


// ── Request Interceptor ────────────────────────────────────────────────────
// Runs before every request. Attaches the JWT token from localStorage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ───────────────────────────────────────────────────
// If a 401 is received, the token expired → clear and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
