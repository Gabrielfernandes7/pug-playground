<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { CodeMirror5Adapter } from '../adapters/CodeMirror5Adapter';
import type { EditorDocument } from '../ports/editor';
import { FILE_KEYS, FILE_META, type FileKey } from '../config';
import { useWorkspace } from '../app/workspace';
import { fileForName } from '../app/logic';

const ERROR_CLASS = 'cm-error-line';
const ws = useWorkspace();
const host = ref<HTMLElement>();
const dragging = ref(false);

let editor: CodeMirror5Adapter;
const docs = {} as Record<FileKey, EditorDocument>;

onMounted(() => {
  editor = new CodeMirror5Adapter(host.value!, {
    'Ctrl-Enter': () => { void ws.compileNow(); },
    'Cmd-Enter': () => { void ws.compileNow(); },
    'Ctrl-S': () => { ws.downloadHtml(); },
    'Cmd-S': () => { ws.downloadHtml(); },
    'Ctrl-Shift-V': () => { void ws.pasteAndRender(); },
    'Cmd-Shift-V': () => { void ws.pasteAndRender(); },
  });

  for (const file of FILE_KEYS) {
    docs[file] = editor.createDocument(ws.sources[file], FILE_META[file].mode);
  }
  editor.show(docs[ws.activeFile]);
  editor.onChange(() => ws.setSource(ws.activeFile, docs[ws.activeFile].getValue()));
  editor.onCursorMove(() => {
    const p = editor.cursor();
    ws.setCursor(p.line + 1, p.ch + 1);
  });
  const p = editor.cursor();
  ws.setCursor(p.line + 1, p.ch + 1);
});

// Store -> editor: conteúdo trocado pelo app (importar, limpar, converter)
for (const file of FILE_KEYS) {
  watch(() => ws.sources[file], text => {
    const doc = docs[file];
    if (doc && doc.getValue() !== text) doc.setValue(text);
  });
}

watch(() => ws.activeFile, file => {
  editor.show(docs[file]);
  editor.focus();
});

watch(() => ws.errorLine, (line, previous) => {
  if (previous !== null && previous !== undefined) editor.clearLine(previous, ERROR_CLASS);
  if (line !== null && line < editor.lineCount()) {
    editor.highlightLine(line, ERROR_CLASS);
    editor.scrollToLine(line);
  }
});

watch(() => ws.layoutVersion, () => editor.refresh());

function onDragOver(event: DragEvent): void {
  event.preventDefault();
  dragging.value = true;
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  dragging.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) void ws.importFiles(Array.from(files).filter(f => fileForName(f.name) !== null));
}
</script>

<template>
  <div
    id="editor-host"
    ref="host"
    class="editor-host"
    :class="{ dragging }"
    @dragover="onDragOver"
    @dragleave="dragging = false"
    @drop="onDrop"
  ></div>
</template>
