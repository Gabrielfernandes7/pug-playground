<script setup lang="ts">
import { nextTick, onBeforeUnmount, watch, ref } from 'vue';
import { createTextEditor } from '../adapters/CodeMirror5Adapter';
import type { ITextEditor } from '../ports/editor';
import { useWorkspace } from '../app/workspace';

const ws = useWorkspace();
const pugHost = ref<HTMLElement>();
const htmlHost = ref<HTMLElement>();
let pugEditor: ITextEditor | null = null;
let htmlEditor: ITextEditor | null = null;

// Os editores existem só enquanto o diálogo está aberto: destroy() remove os listeners globais
watch(() => ws.converterOpen, async open => {
  if (open) {
    await nextTick();
    pugEditor = createTextEditor(pugHost.value!, 'pug');
    htmlEditor = createTextEditor(htmlHost.value!, 'text/html');
    pugEditor.setValue(ws.sources.pug);
    if (pugEditor.getValue().trim()) await pugToHtml();
    pugEditor.focus();
    window.addEventListener('keydown', onKey);
  } else {
    closeEditors();
  }
});

onBeforeUnmount(closeEditors);

function closeEditors(): void {
  window.removeEventListener('keydown', onKey);
  pugEditor?.destroy();
  htmlEditor?.destroy();
  pugEditor = null;
  htmlEditor = null;
}

function close(): void {
  ws.closeConverter();
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') close();
}

async function pugToHtml(): Promise<void> {
  if (!pugEditor || !htmlEditor) return;
  try {
    htmlEditor.setValue(await ws.renderPug(pugEditor.getValue()));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ws.toast('Erro no Pug: ' + message.split('\n')[0]);
  }
}

function htmlToPug(): void {
  if (!pugEditor || !htmlEditor) return;
  pugEditor.setValue(ws.htmlToPug(htmlEditor.getValue()));
}

async function copy(editor: ITextEditor | null, label: string): Promise<void> {
  const text = editor?.getValue() ?? '';
  if (!text.trim()) return ws.toast(`Nada para copiar em ${label}`);
  try {
    await navigator.clipboard.writeText(text);
    ws.toast(`${label} copiado`);
  } catch {
    ws.toast('Não foi possível acessar o clipboard');
  }
}

function apply(): void {
  const source = pugEditor?.getValue() ?? '';
  if (!source.trim()) return ws.toast('Nada para aplicar: o Pug está vazio');
  // Confirma só quando vai substituir um código que já existe e está diferente
  if (source !== ws.sources.pug && ws.sources.pug.trim()
    && !confirm('Substituir o index.pug atual pelo código convertido?')) return;
  ws.replaceSource('pug', source);
  ws.setActive('pug');
  ws.toast('index.pug atualizado');
  close();
}

function onBackdrop(event: MouseEvent): void {
  if (event.target === event.currentTarget) close();
}
</script>

<template>
  <div id="converter" role="dialog" aria-modal="true" aria-labelledby="converter-title" :hidden="!ws.converterOpen" @click="onBackdrop">
    <div class="converter-panel">
      <header class="converter-header">
        <h2 id="converter-title"><i class="fas fa-right-left"></i> Conversor Pug ⇄ HTML</h2>
        <div class="converter-actions">
          <button id="converter-to-html" class="btn-pug btn-pug-primary" @click="pugToHtml"><i class="fas fa-arrow-right"></i> Pug → HTML</button>
          <button id="converter-to-pug" class="btn-pug btn-pug-ghost" @click="htmlToPug"><i class="fas fa-arrow-left"></i> HTML → Pug</button>
          <button id="converter-close" class="btn-pug btn-pug-ghost btn-pug-icon" aria-label="Fechar conversor" title="Fechar (Esc)" @click="close"><i class="fas fa-xmark"></i></button>
        </div>
      </header>
      <div class="converter-body">
        <section class="converter-pane">
          <div class="converter-pane-bar">
            <span>index.pug</span>
            <div class="converter-actions">
              <button id="converter-copy-pug" class="btn-pug btn-pug-ghost" @click="copy(pugEditor, 'Pug')"><i class="fas fa-copy"></i> Copiar</button>
              <button id="converter-apply" class="btn-pug btn-pug-ghost" title="Substituir o index.pug do editor" @click="apply"><i class="fas fa-file-import"></i> Usar no editor</button>
            </div>
          </div>
          <div id="converter-pug" ref="pugHost" class="converter-host"></div>
        </section>
        <section class="converter-pane">
          <div class="converter-pane-bar">
            <span>index.html</span>
            <div class="converter-actions">
              <button id="converter-copy-html" class="btn-pug btn-pug-ghost" @click="copy(htmlEditor, 'HTML')"><i class="fas fa-copy"></i> Copiar</button>
            </div>
          </div>
          <div id="converter-html" ref="htmlHost" class="converter-host"></div>
        </section>
      </div>
    </div>
  </div>
</template>
