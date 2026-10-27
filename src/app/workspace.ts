import { defineStore } from 'pinia';
import { CONFIG, FILE_KEYS, FILE_META, STARTER, type FileKey } from '../config';
import type { SandboxMessage } from '../ports/sandbox';
import { loadCompiler, loadPug, storage, htmlConverter } from './services';
import {
  type Sources, emptyStateDoc, errorStateDoc, fileForName, isBlank, parseErrorLine,
  parseSaved, serialize, tooLarge,
} from './logic';

export type StatusKind = 'loading' | 'idle' | 'pending' | 'success' | 'error';
export type SaveLabel = 'salvando' | 'salvo' | 'off';

export interface ConsoleEntry {
  id: number;
  time: string;
  type: SandboxMessage['type'];
  text: string;
}

const STATUS_TEXT: Record<StatusKind, string> = {
  loading: 'Inicializando…',
  idle: 'Vazio',
  pending: 'Digitando…',
  success: 'Compilado',
  error: 'Erro',
};

const STATUS_COLOR: Record<StatusKind, string> = {
  loading: 'var(--color-warning)',
  idle: 'var(--color-success)',
  pending: 'var(--color-warning)',
  success: 'var(--color-success)',
  error: 'var(--color-error)',
};

// Timers ficam fora do estado reativo: não são dados de tela
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let entryId = 0;

const readFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsText(file);
});

export const useWorkspace = defineStore('workspace', {
  state: () => ({
    sources: { ...STARTER } as Sources,
    activeFile: 'pug' as FileKey,
    kind: 'loading' as StatusKind,
    previewHtml: emptyStateDoc(),
    // Sobe a cada compilação: recarrega o iframe mesmo quando o HTML é igual (como srcdoc no legado)
    renderVersion: 0,
    lastGoodHtml: '',
    errorMessage: '',
    errorLine: null as number | null,
    compileMs: 0,
    cursor: { line: 1, col: 1 },
    saveLabel: 'salvo' as SaveLabel,
    persistedOk: true,
    lastSaved: serialize(STARTER),
    console: [] as ConsoleEntry[],
    consoleErrors: 0,
    consoleOpenRequest: 0,
    layoutVersion: 0,
    toastText: '',
    converterOpen: false,
    criticalError: '',
  }),
  getters: {
    statusText: (state): string => STATUS_TEXT[state.kind],
    statusColor: (state): string => STATUS_COLOR[state.kind],
    outdated: (state): boolean => state.errorMessage !== '' && state.lastGoodHtml !== '',
    isDirty: (state): boolean => serialize(state.sources) !== state.lastSaved,
    activeLabel: (state): string => FILE_META[state.activeFile].label,
  },
  actions: {
    init(): void {
      const saved = parseSaved(storage.get(CONFIG.STORAGE_KEY));
      this.sources = { ...this.sources, ...saved };
      this.lastSaved = serialize(this.sources);
      void this.compileNow();
    },

    // Edição do usuário no editor: agenda a compilação com debounce
    setSource(file: FileKey, text: string): void {
      if (this.sources[file] === text) return;
      this.sources[file] = text;
      this.kind = 'pending';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => void this.compileNow(), CONFIG.DEBOUNCE_MS);
      this.scheduleSave();
    },

    // Troca de conteúdo feita pelo app (importar, colar, converter): compila já
    replaceSource(file: FileKey, text: string): void {
      this.sources[file] = text;
      clearTimeout(debounceTimer);
      this.scheduleSave();
      void this.compileNow();
    },

    setActive(file: FileKey): void {
      this.activeFile = file;
    },

    setCursor(line: number, col: number): void {
      this.cursor = { line, col };
    },

    requestLayoutRefresh(): void {
      this.layoutVersion++;
    },

    async compileNow(): Promise<void> {
      this.clearConsole();
      // Sem código não há o que compilar: não baixa o Pug à toa
      if (isBlank(this.sources)) {
        this.showPreview(emptyStateDoc());
        this.clearError();
        this.kind = 'idle';
        return;
      }
      let compiler;
      try {
        compiler = await loadCompiler();
      } catch (error) {
        this.criticalError = error instanceof Error ? error.message : String(error);
        return;
      }
      const result = compiler.compile({ ...this.sources });
      this.compileMs = result.elapsed;

      if (!result.ok && result.reason === 'empty') {
        this.showPreview(emptyStateDoc());
        this.clearError();
        this.kind = 'idle';
        return;
      }
      if (result.ok) {
        this.lastGoodHtml = result.html;
        this.showPreview(result.html);
        this.clearError();
        this.kind = 'success';
        return;
      }
      if (!this.lastGoodHtml) this.showPreview(errorStateDoc());
      this.errorMessage = result.error.message || String(result.error);
      this.errorLine = parseErrorLine(this.errorMessage);
      this.kind = 'error';
    },

    showPreview(html: string): void {
      this.previewHtml = html;
      this.renderVersion++;
    },

    clearError(): void {
      this.errorMessage = '';
      this.errorLine = null;
    },

    scheduleSave(): void {
      this.saveLabel = 'salvando';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const value = serialize(this.sources);
        this.persistedOk = storage.set(CONFIG.STORAGE_KEY, value);
        if (this.persistedOk) this.lastSaved = value;
        this.saveLabel = this.persistedOk ? 'salvo' : 'off';
      }, CONFIG.SAVE_MS);
    },

    addConsole(message: SandboxMessage): void {
      this.console.push({
        id: ++entryId,
        time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
        type: message.type,
        text: message.args.join(' '),
      });
      // Limite: um loop de console.log não pode crescer sem fim
      if (this.console.length > CONFIG.MAX_CONSOLE_LINES) {
        this.console.splice(0, this.console.length - CONFIG.MAX_CONSOLE_LINES);
      }
      if (message.type === 'error' || message.type === 'warn') {
        this.consoleErrors++;
        this.consoleOpenRequest++;
      }
    },

    clearConsole(): void {
      this.console = [];
      this.consoleErrors = 0;
    },

    toast(text: string): void {
      this.toastText = text;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { this.toastText = ''; }, 2500);
    },

    downloadHtml(): void {
      if (!this.lastGoodHtml) return this.toast('Nada para baixar — compile primeiro');
      const url = URL.createObjectURL(new Blob([this.lastGoodHtml], { type: 'text/html' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'output.html';
      link.click();
      URL.revokeObjectURL(url);
      this.toast('HTML baixado');
    },

    openExternal(): void {
      if (!this.lastGoodHtml) return this.toast('Nada para abrir — compile primeiro');
      const url = URL.createObjectURL(new Blob([this.lastGoodHtml], { type: 'text/html' }));
      window.open(url, '_blank');
      // A aba nova já carregou o blob; sem revogar, cada clique deixa um blob de até 5MB na memória
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },

    async pasteAndRender(): Promise<void> {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return this.toast('Clipboard vazio');
        this.replaceSource(this.activeFile, text);
        this.toast(`Colado em ${FILE_META[this.activeFile].label}`);
      } catch {
        this.toast('Não foi possível ler o clipboard');
      }
    },

    async importFiles(files: File[]): Promise<void> {
      const pending: Array<{ file: File; target: FileKey }> = [];
      for (const file of files) {
        const target = fileForName(file.name);
        if (!target) continue;
        if (tooLarge(file.size)) {
          this.toast(`${file.name} passa de ${CONFIG.MAX_IMPORT_BYTES / 1024 / 1024}MB e não foi importado`);
          continue;
        }
        pending.push({ file, target });
      }
      if (!pending.length) return;

      const texts = await Promise.all(pending.map(({ file }) => readFile(file)));
      pending.forEach(({ target }, i) => {
        this.sources[target] = texts[i] ?? '';
      });
      const last = pending[pending.length - 1];
      if (last) this.activeFile = last.target;
      this.scheduleSave();
      await this.compileNow();
      this.toast(pending.length === 1 ? 'Arquivo importado' : `${pending.length} arquivos importados`);
    },

    clearAll(): void {
      FILE_KEYS.forEach(file => { this.sources[file] = ''; });
      clearTimeout(debounceTimer);
      this.scheduleSave();
      void this.compileNow();
    },

    hasContent(): boolean {
      return !isBlank(this.sources);
    },

    // Pug → HTML para o conversor. Usa o mesmo pug do preview.
    async renderPug(template: string): Promise<string> {
      const { default: pug } = await loadPug();
      return pug.render(template);
    },

    htmlToPug(html: string): string {
      return htmlConverter.convert(html);
    },

    openConverter(): void {
      this.converterOpen = true;
    },

    closeConverter(): void {
      this.converterOpen = false;
    },
  },
});

