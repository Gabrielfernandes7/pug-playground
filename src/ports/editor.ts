// Linguagem do documento: nome de modo que o editor entende (pug, css, javascript, text/html)
export type EditorLanguage = 'pug' | 'css' | 'javascript' | 'text/html';

export interface EditorDocument {
  getValue(): string;
  setValue(text: string): void;
}

export interface EditorCursor {
  line: number;
  ch: number;
}

// Atalhos: o editor considera a tecla tratada, então a ação não precisa devolver nada
export type EditorKeymap = Record<string, () => void>;

// Editor principal: um por tela, troca de documento entre abas
export interface IEditorAdapter {
  createDocument(text: string, language: EditorLanguage): EditorDocument;
  show(doc: EditorDocument): void;
  focus(): void;
  refresh(): void;
  cursor(): EditorCursor;
  lineCount(): number;
  onChange(handler: () => void): void;
  onCursorMove(handler: () => void): void;
  highlightLine(line: number, className: string): void;
  clearLine(line: number, className: string): void;
  scrollToLine(line: number): void;
}

// Editor simples, usado no diálogo do conversor. Existe só enquanto o diálogo está aberto.
export interface ITextEditor {
  getValue(): string;
  setValue(text: string): void;
  focus(): void;
  destroy(): void;
}
