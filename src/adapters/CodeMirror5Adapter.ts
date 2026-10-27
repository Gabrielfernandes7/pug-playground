import CodeMirror from '../editor/codemirror';
import type { EditorDocument, EditorKeymap, EditorLanguage, IEditorAdapter, ITextEditor } from '../ports/editor';

type Editor = CodeMirror.Editor;
type Doc = CodeMirror.Doc;

// Opções compartilhadas pelo editor principal e pelo diálogo do conversor
const BASE_OPTIONS = {
  theme: 'pug',
  lineNumbers: true,
  lineWrapping: true,
  indentUnit: 2,
  tabSize: 2,
  matchBrackets: true,
  autoCloseBrackets: true,
};

// Documento do CodeMirror embrulhado: a porta não expõe o tipo do CodeMirror
class CM5Document implements EditorDocument {
  constructor(readonly native: Doc) {}
  getValue(): string { return this.native.getValue(); }
  setValue(text: string): void { this.native.setValue(text); }
}

export class CodeMirror5Adapter implements IEditorAdapter {
  private readonly editor: Editor;

  constructor(host: HTMLElement, keymap: EditorKeymap) {
    const extraKeys: CodeMirror.KeyMap = { 'Ctrl-Space': 'autocomplete' };
    Object.entries(keymap).forEach(([key, action]) => { extraKeys[key] = action; });
    this.editor = CodeMirror(host, { ...BASE_OPTIONS, value: '', mode: 'pug', extraKeys });
  }

  createDocument(text: string, language: EditorLanguage): EditorDocument {
    return new CM5Document(CodeMirror.Doc(text, language));
  }

  show(doc: EditorDocument): void {
    this.editor.swapDoc((doc as CM5Document).native);
  }

  focus(): void { this.editor.focus(); }
  refresh(): void { this.editor.refresh(); }

  cursor(): { line: number; ch: number } { return this.editor.getCursor(); }
  lineCount(): number { return this.editor.lineCount(); }

  onChange(handler: () => void): void { this.editor.on('change', handler); }
  onCursorMove(handler: () => void): void { this.editor.on('cursorActivity', handler); }

  highlightLine(line: number, className: string): void {
    this.editor.addLineClass(line, 'background', className);
  }

  clearLine(line: number, className: string): void {
    this.editor.removeLineClass(line, 'background', className);
  }

  scrollToLine(line: number): void {
    this.editor.scrollIntoView({ line, ch: 0 }, 80);
  }
}

// Editor simples para o diálogo do conversor. textarea + fromTextArea: toTextArea() é o único
// jeito de desmontar sem vazar listeners globais.
export function createTextEditor(host: HTMLElement, mode: EditorLanguage): ITextEditor {
  const textarea = document.createElement('textarea');
  host.appendChild(textarea);
  const editor = CodeMirror.fromTextArea(textarea, { ...BASE_OPTIONS, mode });
  return {
    getValue: () => editor.getValue(),
    setValue: (text) => editor.setValue(text),
    focus: () => editor.focus(),
    destroy: () => editor.toTextArea(),
  };
}
