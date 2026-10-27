<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IframeSandboxRunner } from '../adapters/IframeSandboxRunner';
import { useWorkspace } from '../app/workspace';
import ConsolePanel from './ConsolePanel.vue';

const ws = useWorkspace();
const frame = ref<HTMLIFrameElement>();
const pane = ref<HTMLElement>();
const deviceWidth = ref(0);
const fullscreen = ref(false);

const frameStyle = computed(() => ({
  width: deviceWidth.value > 0 ? `${deviceWidth.value}px` : '100%',
  maxWidth: '100%',
}));

const devices = [
  { width: 0, label: 'Desktop', aria: 'desktop', icon: 'fas fa-desktop' },
  { width: 768, label: 'Tablet (768px)', aria: 'tablet (768px)', icon: 'fas fa-tablet-screen-button' },
  { width: 375, label: 'Mobile (375px)', aria: 'mobile (375px)', icon: 'fas fa-mobile-screen' },
];

let runner: IframeSandboxRunner | undefined;

// Único ponto que escreve no iframe (pela porta ISandboxRunner) e que recebe o console dele
watch(() => ws.renderVersion, () => runner?.render(ws.previewHtml));

onMounted(() => {
  runner = new IframeSandboxRunner(frame.value!);
  runner.onMessage(message => ws.addConsole(message));
  runner.render(ws.previewHtml);
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreenChange));

function toggleFullscreen(): void {
  if (!document.fullscreenElement) void pane.value?.requestFullscreen?.();
  else void document.exitFullscreen?.();
}

function onFullscreenChange(): void {
  fullscreen.value = !!document.fullscreenElement;
}
</script>

<template>
  <div id="preview-pane" ref="pane" class="flex flex-col overflow-hidden flex-1" style="min-width: 280px;">
    <div class="preview-toolbar">
      <div class="preview-title"><i class="fas fa-eye"></i> Preview</div>
      <div class="preview-arrows flex items-center gap-1">
        <button class="preview-nav-btn" disabled aria-label="Voltar" title="Voltar"><i class="fas fa-arrow-left"></i></button>
        <button class="preview-nav-btn" disabled aria-label="Avançar" title="Avançar"><i class="fas fa-arrow-right"></i></button>
      </div>
      <input class="preview-url" type="text" value="http://localhost:3000/" readonly tabindex="-1" aria-label="Endereço (apenas visual)">
      <button id="refresh-btn" class="preview-nav-btn" aria-label="Recarregar" title="Recarregar (Ctrl+Enter)" @click="ws.compileNow()"><i class="fas fa-rotate"></i></button>
      <div class="preview-tools">
        <button
          v-for="device in devices"
          :key="device.width"
          class="device-btn"
          :class="{ active: deviceWidth === device.width }"
          :aria-label="`Visualizar em ${device.aria}`"
          :title="device.label"
          @click="deviceWidth = device.width"
        ><i :class="device.icon"></i></button>
        <span id="status-dot" class="w-2 h-2 rounded-full inline-block mx-1" :style="{ background: ws.statusColor }" aria-hidden="true"></span>
        <span id="status-text" class="text-xs hidden md:inline" style="color: color-mix(in oklch, var(--color-base-content) 55%, transparent);" aria-live="polite" role="status">{{ ws.statusText }}</span>
        <button id="open-external-btn" class="preview-nav-btn" aria-label="Abrir em nova aba" title="Abrir em nova aba" @click="ws.openExternal()"><i class="fas fa-arrow-up-right-from-square"></i></button>
        <button id="fullscreen-btn" class="preview-nav-btn" :aria-label="fullscreen ? 'Sair da tela cheia' : 'Tela cheia'" :title="fullscreen ? 'Sair da tela cheia' : 'Tela cheia'" @click="toggleFullscreen">
          <i :class="fullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
      </div>
    </div>
    <div id="error-banner" role="alert" :class="{ visible: ws.kind === 'error' }">
      <div class="title"><i class="fas fa-triangle-exclamation mr-1"></i> Erro de compilação</div>
      <div id="error-message">{{ ws.errorMessage }}</div>
    </div>
    <div id="iframe-wrapper">
      <iframe
        id="preview-frame"
        ref="frame"
        title="Pré-visualização do template Pug"
        sandbox="allow-scripts allow-popups allow-forms"
        :style="frameStyle"
      ></iframe>
      <div id="outdated-overlay" :class="{ visible: ws.outdated }">
        <div class="outdated-badge">
          <i class="fas fa-triangle-exclamation"></i>
          <div>
            <strong>Preview desatualizado</strong>
            <span>Corrija o erro para atualizar</span>
          </div>
        </div>
      </div>
    </div>
    <ConsolePanel />
  </div>
</template>
