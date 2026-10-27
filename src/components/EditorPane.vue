<script setup lang="ts">
import { FILE_KEYS, FILE_META } from '../config';
import { useWorkspace } from '../app/workspace';
import CodeEditor from './CodeEditor.vue';

const props = defineProps<{ width: string }>();
const ws = useWorkspace();

function clearAll(): void {
  if (ws.hasContent() && !confirm('Limpar todos os arquivos (Pug, CSS e JS)?')) return;
  ws.clearAll();
}
</script>

<template>
  <div id="editor-pane" class="flex flex-col overflow-hidden" :style="{ width: props.width, minWidth: '280px', background: 'var(--cm-bg)' }">
    <div class="file-tabs flex items-center shrink-0 border-b" style="height: 38px; background: var(--color-base-200); border-color: var(--border-subtle);">
      <div
        v-for="file in FILE_KEYS"
        :key="file"
        class="file-tab"
        :class="{ active: ws.activeFile === file }"
        :data-file="file"
        @click="ws.setActive(file)"
      >
        <span class="file-tab-icon"><img :src="FILE_META[file].icon" alt="" aria-hidden="true"></span>
        {{ FILE_META[file].label }}
      </div>
      <div class="flex-1"></div>
      <button id="clear-btn" class="btn-pug btn-pug-ghost btn-pug-icon" aria-label="Limpar todos os arquivos" title="Limpar Pug, CSS e JS (com confirmação)" @click="clearAll">
        <i class="fas fa-eraser"></i>
      </button>
    </div>
    <CodeEditor />
  </div>
</template>
