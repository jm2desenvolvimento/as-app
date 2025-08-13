import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

// Configuração global do axios: baseURL e token JWT
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
axios.defaults.baseURL = apiBaseUrl
axios.interceptors.request.use((config) => {
  const isLogin = typeof config.url === 'string' && config.url.includes('/auth/login')
  if (!isLogin) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
