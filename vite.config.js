// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/', // ⚠️ 重要：设置为根路径，不要加 /仓库名/
  build: {
    outDir: 'dist',
  }
})