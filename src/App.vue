<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import AppHeader from './components/AppHeader.vue';
import EditorPane from './components/EditorPane.vue';
import PreviewPane from './components/PreviewPane.vue';
import ConverterModal from './components/ConverterModal.vue';
import { useWorkspace } from './app/workspace';
import { usePreferences, applyPageTheme, applyEditorColors } from './app/preferences';
import { CONFIG } from './config';

const ws = useWorkspace();
const prefs = usePreferences();

// Tema da página e do editor: aplicados sempre que mudam
watch(() => prefs.theme, applyPageTheme, { immediate: true });
watch(() => prefs.editorThemeId, applyEditorColors, { immediate: true });

// Celular: um painel por vez (Código | Preview)
const phoneQuery = window.matchMedia('(max-width: 767px)');
const view = ref<'editor' | 'preview'>('editor');
const runFromHeader = () => { if (phoneQuery.matches) view.value = 'preview'; };

// Divisor arrastável entre editor e preview
const editorWidth = ref('50%');
const dragging = ref(false);
const mainArea = ref<HTMLElement>();

function onPointerMove(event: PointerEvent): void {
  if (!mainArea.value) return;
  const rect = mainArea.value.getBoundingClientRect();
  const resizer = 10;
  const max = rect.width - CONFIG.MIN_PANE_WIDTH - resizer;
  const width = Math.max(CONFIG.MIN_PANE_WIDTH, Math.min(max, event.clientX - rect.left));
  editorWidth.value = `${width}px`;
  ws.requestLayoutRefresh();
}

function stopDrag(): void {
  dragging.value = false;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', stopDrag);
  window.removeEventListener('pointercancel', stopDrag);
}

function startDrag(event: PointerEvent): void {
  dragging.value = true;
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);
  event.preventDefault();
}

function resetWidth(): void {
  editorWidth.value = '50%';
  ws.requestLayoutRefresh();
}

// Aviso ao fechar a página quando há o que salvar ou o salvamento falhou
function onBeforeUnload(event: BeforeUnloadEvent): void {
  if (!ws.persistedOk || ws.isDirty) {
    event.preventDefault();
    event.returnValue = '';
  }
}

function reload(): void {
  window.location.reload();
}

function onPhoneChange(): void {
  ws.requestLayoutRefresh();
}

onMounted(() => {
  ws.init();
  window.addEventListener('beforeunload', onBeforeUnload);
  phoneQuery.addEventListener('change', onPhoneChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload);
  phoneQuery.removeEventListener('change', onPhoneChange);
});

</script>

<template>
  <div id="app-root" class="flex flex-col h-dvh">
    <AppHeader @run="runFromHeader" />

    <div id="main-area" ref="mainArea" class="flex flex-1 overflow-hidden" style="min-height: 0;" :data-view="view">
      <EditorPane :width="editorWidth" />

      <div
        id="resizer"
        class="resizer shrink-0"
        :class="{ active: dragging }"
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar painéis"
        @pointerdown="startDrag"
        @dblclick="resetWidth"
      ></div>

      <PreviewPane />
    </div>

    <nav id="view-switch" class="view-switch" role="tablist" aria-label="Alternar entre código e preview">
      <button class="view-switch-btn" :class="{ active: view === 'editor' }" role="tab" :aria-selected="view === 'editor'" data-view-btn="editor" @click="view = 'editor'"><i class="fas fa-code"></i><span>Código</span></button>
      <button class="view-switch-btn" :class="{ active: view === 'preview' }" role="tab" :aria-selected="view === 'preview'" data-view-btn="preview" @click="view = 'preview'"><i class="fas fa-eye"></i><span>Preview</span></button>
    </nav>

    <footer class="flex items-center justify-between px-3 shrink-0 border-t" style="height: 26px; background: var(--color-base-100); border-color: var(--border-subtle); font-family: var(--pug-font-mono); font-size: 11px; color: color-mix(in oklch, var(--color-base-content) 55%, transparent);">
      <div class="flex items-center gap-4">
        <span>Ln <span id="cursor-line">{{ ws.cursor.line }}</span>, Col <span id="cursor-col">{{ ws.cursor.col }}</span></span>
        <span class="hidden sm:inline" id="active-file-label">{{ ws.activeLabel }}</span>
        <span class="hidden md:inline">UTF-8</span>
      </div>
      <div class="flex items-center gap-4">
        <span id="compile-time">{{ ws.compileMs.toFixed(1) }} ms</span>
        <span id="save-indicator" aria-live="polite">
          <template v-if="ws.saveLabel === 'salvando'">salvando…</template>
          <template v-else-if="ws.saveLabel === 'salvo'">salvo <i class="fas fa-check"></i></template>
          <template v-else>salvar: off</template>
        </span>
        <span class="hidden sm:inline">Ctrl+Enter · Ctrl+S · Ctrl+Shift+V</span>
      </div>
    </footer>

    <div id="toast" role="status" aria-live="polite" :class="{ show: ws.toastText }">{{ ws.toastText }}</div>

    <div v-if="ws.criticalError" id="critical-error" class="visible" role="alert">
      <h2><i class="fas fa-circle-exclamation"></i> Falha ao inicializar o playground</h2>
      <p>Não foi possível carregar o compilador Pug.</p>
      <div class="diag" id="critical-diag">{{ ws.criticalError }}</div>
      <button id="critical-reload" class="btn-pug btn-pug-primary" style="margin-top: 20px;" @click="reload">
        <i class="fas fa-rotate-right"></i> Tentar novamente
      </button>
    </div>

    <ConverterModal />
  </div>
</template>
