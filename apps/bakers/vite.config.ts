import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/bakers/' : './',
  server: {
    host: true,
    port: 5176,
  },
}))
