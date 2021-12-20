import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src/'
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '/src/styles/global_mixins.scss';`
      }
    }
  },
  plugins: [vue()]
})
