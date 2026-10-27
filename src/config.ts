// Constantes do playground. Temas do editor ficam em app/editorThemes.ts.
export const CONFIG = {
  DEBOUNCE_MS: 400,
  SAVE_MS: 400,
  MIN_PANE_WIDTH: 280,
  MAX_OUTPUT_BYTES: 5 * 1024 * 1024,
  STORAGE_KEY: 'pug-playground:state:v2',
  THEME_KEY: 'pug-playground:theme',
  EDITOR_THEME_KEY: 'pug-playground:editor-theme',
  MAX_CONSOLE_LINES: 500,
  MAX_IMPORT_BYTES: 2 * 1024 * 1024,
  // Font Awesome usado dentro do HTML exportado (o playground usa a cópia local)
  EXPORT_FA_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
} as const;

export const FILE_KEYS = ['pug', 'css', 'js'] as const;
export type FileKey = (typeof FILE_KEYS)[number];

export interface FileMeta {
  label: string;
  mode: 'pug' | 'css' | 'javascript';
  icon: string;
}

export const FILE_META: Record<FileKey, FileMeta> = {
  pug: { label: 'index.pug', mode: 'pug', icon: '/assets/pug-logo.svg' },
  css: { label: 'styles.css', mode: 'css', icon: '/assets/icons/css.svg' },
  js: { label: 'script.js', mode: 'javascript', icon: '/assets/icons/js.svg' },
};

// Conteúdo inicial: as três abas começam vazias
export const STARTER: Record<FileKey, string> = { pug: '', css: '', js: '' };
