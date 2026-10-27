<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkspace } from '../app/workspace';
import { usePreferences } from '../app/preferences';

const emit = defineEmits<{ run: [] }>();
const ws = useWorkspace();
const prefs = usePreferences();
const fileInput = ref<HTMLInputElement>();

const themeIcon = computed(() => (prefs.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'));

function onEditorTheme(event: Event): void {
  prefs.setEditorTheme((event.target as HTMLSelectElement).value);
}

function onImport(event: Event): void {
  const input = event.target as HTMLInputElement;
  void ws.importFiles(Array.from(input.files ?? []));
  input.value = '';
}
</script>

<template>
  <header class="flex items-center px-3 gap-2 shrink-0 border-b" style="height: 56px; background: var(--color-base-100); border-color: var(--border-subtle);">
    <a href="#" class="flex items-center gap-2 mr-2">
      <span class="brand-logo" id="brand-logo"><img src="/assets/pug-logo.svg" alt="" aria-hidden="true"></span>
      <span class="brand-name text-base hidden sm:inline">Pug Render</span>
    </a>
    <div class="flex-1"></div>
    <select
      id="editor-theme"
      class="theme-select hidden sm:block"
      aria-label="Tema do editor e do console"
      title="Tema do editor e do console"
      :value="prefs.editorThemeId"
      @change="onEditorTheme"
    >
      <option v-for="theme in prefs.editorThemes" :key="theme.id" :value="theme.id">{{ theme.label }}</option>
    </select>
    <button id="theme-btn" class="btn-pug btn-pug-ghost btn-pug-icon" aria-label="Alternar tema claro/escuro" title="Alternar tema claro/escuro" @click="prefs.toggleTheme()">
      <i id="theme-icon" :class="themeIcon"></i>
    </button>
    <button id="converter-btn" class="btn-pug btn-pug-ghost" aria-label="Abrir conversor Pug ⇄ HTML" title="Conversor Pug ⇄ HTML" @click="ws.openConverter()">
      <i class="fas fa-right-left"></i>
      <span class="hidden md:inline">Converter</span>
    </button>
    <button id="import-btn" class="btn-pug btn-pug-ghost" aria-label="Importar arquivo" title="Importar arquivo (.pug, .css, .js)" @click="fileInput?.click()">
      <i class="fas fa-file-import"></i>
      <span class="hidden md:inline">Importar</span>
    </button>
    <input ref="fileInput" id="import-input" type="file" accept=".pug,.jade,.css,.js" multiple hidden @change="onImport">
    <button id="run-btn" class="btn-pug btn-pug-primary" title="Ctrl+Enter" @click="ws.compileNow(); emit('run')">
      <i class="fas fa-play"></i> Run
    </button>
  </header>
</template>
