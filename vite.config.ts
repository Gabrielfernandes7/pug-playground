import { cpSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

// Os scripts legados (js/, css/, assets/) são carregados por tags clássicas e não passam pelo
// grafo do Vite. Este plugin copia essas pastas para dist/ no fim do build.
// Some quando js/ for descomissionado (Fase 3).
const copyLegacyAssets = (): Plugin => ({
  name: 'copy-legacy-assets',
  apply: 'build',
  closeBundle() {
    for (const dir of ['js', 'css', 'assets']) {
      cpSync(dir, `dist/${dir}`, { recursive: true });
    }
  },
});

export default defineConfig({
  plugins: [copyLegacyAssets()],
  resolve: {
    // O pug chama assert() em tempo de compilação. O Vite trataria 'assert' como builtin do Node
    // e o externalizaria como stub, então apontamos para o pacote de navegador.
    alias: [{ find: /^assert$/, replacement: 'assert/' }],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
});
