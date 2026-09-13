import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/typing-island/' : './',
  server: {
    host: true,
    port: 5175,
  },
}))
