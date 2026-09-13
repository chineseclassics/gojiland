import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/fruit-crossing/' : './',
  server: {
    host: true,
    port: 5174,
  },
}))
