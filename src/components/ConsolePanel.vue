<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useWorkspace } from '../app/workspace';

const ws = useWorkspace();
const collapsed = ref(false);
const output = ref<HTMLElement>();

// Um erro ou aviso novo abre o painel, mesmo que o usuário o tenha recolhido
watch(() => ws.consoleOpenRequest, () => { collapsed.value = false; });

watch(() => ws.console.length, async () => {
  await nextTick();
  if (output.value) output.value.scrollTop = output.value.scrollHeight;
});

function toggle(event: MouseEvent): void {
  if ((event.target as HTMLElement).closest('#console-clear-btn')) return;
  collapsed.value = !collapsed.value;
}

function clear(event: MouseEvent): void {
  event.stopPropagation();
  ws.clearConsole();
}
</script>

<template>
  <div id="console-panel" :class="{ collapsed }">
    <div id="console-header" @click="toggle">
      <div class="flex items-center">
        <i class="fas fa-terminal mr-2" style="font-size: 10px;"></i>
        Console
        <span id="console-badge" :class="{ visible: ws.consoleErrors > 0 }">{{ ws.consoleErrors }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button id="console-clear-btn" class="btn-pug btn-pug-ghost btn-pug-icon" style="width: 22px; height: 22px; padding: 0;" aria-label="Limpar console" title="Limpar console" @click="clear">
          <i class="fas fa-xmark" style="font-size: 10px;"></i>
        </button>
        <i id="console-chevron" class="fas fa-chevron-up" :style="{ fontSize: '10px', transition: 'transform .2s', transform: collapsed ? 'rotate(180deg)' : '' }"></i>
      </div>
    </div>
    <div id="console-output" ref="output">
      <div v-for="entry in ws.console" :key="entry.id" class="console-line" :class="`console-${entry.type}`">
        <span class="console-time">{{ entry.time }}</span><span class="console-msg">{{ entry.text }}</span>
      </div>
    </div>
  </div>
</template>
