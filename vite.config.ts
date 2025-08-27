import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://agenda.jm2.tec.br',
    }
  },
  resolve: {
    alias: {
      'rrule': 'rrule/dist/es5/rrule.js'
    }
  }
})
