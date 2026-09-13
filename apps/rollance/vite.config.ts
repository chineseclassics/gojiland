import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/rollance/' : '/',
  build: {
    target: 'es2022'
  }
}));
