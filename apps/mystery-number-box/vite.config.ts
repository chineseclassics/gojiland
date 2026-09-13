import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/mystery-number-box/' : '/',
  build: {
    target: 'es2022'
  }
}));
