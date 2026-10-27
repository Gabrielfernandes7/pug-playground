// CodeMirror 5 é carregado por CDN como global. Declaramos só a superfície que o projeto usa.
interface CodeMirrorDoc {
  getValue(): string;
  setValue(text: string): void;
}

interface CodeMirrorEditor {
  getValue(): string;
  setValue(text: string): void;
  swapDoc(doc: CodeMirrorDoc): CodeMirrorDoc;
  on(event: 'change' | 'cursorActivity', handler: () => void): void;
  getCursor(): { line: number; ch: number };
  lineCount(): number;
  addLineClass(line: number, where: 'background', className: string): void;
  removeLineClass(line: number, where: 'background', className: string): void;
  scrollIntoView(pos: { line: number; ch: number }, margin: number): void;
  refresh(): void;
  focus(): void;
  toTextArea(): void;
}

declare const CodeMirror: {
  (host: HTMLElement, options: Record<string, unknown>): CodeMirrorEditor;
  Doc(text: string, mode: string): CodeMirrorDoc;
  fromTextArea(textarea: HTMLTextAreaElement, options: Record<string, unknown>): CodeMirrorEditor;
};
