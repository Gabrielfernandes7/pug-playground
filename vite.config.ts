import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// `public/` (logo e ícones) é copiado para dist/ pelo próprio Vite.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // O assert do pacote pug é um builtin do Node; apontamos para a versão de navegador
  resolve: {
    alias: [{ find: /^assert$/, replacement: 'assert/' }],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
