import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

// Configuração global do axios: baseURL e token JWT
const apiBaseUrl = import.meta.env.VITE_API_URL
console.log('🔧 [AXIOS CONFIG] VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('🔧 [AXIOS CONFIG] apiBaseUrl final:', apiBaseUrl)
axios.defaults.baseURL = apiBaseUrl

axios.interceptors.request.use((config) => {
  console.log('🚀 [AXIOS REQUEST]', {
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL || ''}${config.url || ''}`,
    method: config.method?.toUpperCase()
  })
  
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
