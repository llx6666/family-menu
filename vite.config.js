import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 本地 dev 时把 /api 转发给 Vercel dev (vercel dev --listen 3000) 或改指向线上
      '/api': 'http://localhost:3000'
    }
  },
  build: { outDir: 'dist' }
})
