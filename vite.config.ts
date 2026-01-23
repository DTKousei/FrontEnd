import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
const BACKEND_HOST = '192.168.5.173'; // IP LAN para permitir acceso remoto (Redirecciones del Backend)

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    proxy: {
      '/api-biometrico': {
        target: `http://${BACKEND_HOST}:8000`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-biometrico/, '/api')
      },
      '/api-reportes': {
        target: `http://${BACKEND_HOST}:8001`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-reportes/, '/api')
      },
      '/api-auth': {
        target: `http://${BACKEND_HOST}:3001`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-auth/, '/api')
      },
      '/api-papeletas': {
        target: `http://${BACKEND_HOST}:3002`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-papeletas/, '/api')
      },
      '/api-incidencias': {
        target: `http://${BACKEND_HOST}:3003`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-incidencias/, '/api')
      }
    }
  }
})
