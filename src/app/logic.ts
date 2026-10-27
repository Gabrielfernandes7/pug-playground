import { CONFIG, FILE_KEYS, type FileKey } from '../config';
import type { EditorTheme } from './editorThemes';

export type Sources = Record<FileKey, string>;

export const isBlank = (sources: Sources): boolean =>
  FILE_KEYS.every(file => !sources[file].trim());

// Erros do Pug trazem "(linha:coluna)" ou "N:M" na mensagem. Devolve a linha 0-based ou null.
export function parseErrorLine(message: string): number | null {
  const match = message.match(/(\d+):\d+/);
  if (!match?.[1]) return null;
  const line = parseInt(match[1], 10) - 1;
  return line >= 0 ? line : null;
}

// Estado salvo no navegador. Aceita o formato antigo em que só o Pug era salvo como string.
export function parseSaved(raw: string | null): Partial<Sources> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'string') return { pug: parsed };
    if (parsed && typeof parsed === 'object') {
      const { pug, css, js } = parsed as Record<string, unknown>;
      return {
        pug: typeof pug === 'string' ? pug : undefined,
        css: typeof css === 'string' ? css : undefined,
        js: typeof js === 'string' ? js : undefined,
      };
    }
  } catch {
    // Dado corrompido: começa vazio, como antes
  }
  return {};
}

export const serialize = (sources: Sources): string => JSON.stringify(sources);

// Temas escuros só no escuro, claros só no claro. Uma escolha salva que não cabe no modo volta a 'auto'.
export function editorThemesFor(themes: readonly EditorTheme[], mode: 'dark' | 'light'): EditorTheme[] {
  return themes.filter(t => !t.mode || t.mode === mode);
}

export function resolveEditorTheme(saved: string, allowed: readonly EditorTheme[]): string {
  return allowed.some(t => t.id === saved) ? saved : 'auto';
}

// --cm-bg, --cm-line-num… a partir da chave camelCase do tema
export const cmVar = (key: string): string =>
  '--cm-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

export function fileForName(name: string): FileKey | null {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  if (ext === 'pug' || ext === 'jade') return 'pug';
  if (ext === 'css') return 'css';
  if (ext === 'js') return 'js';
  return null;
}

export const tooLarge = (bytes: number): boolean => bytes > CONFIG.MAX_IMPORT_BYTES;

const placeholder = (icon: string, text: string): string =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#faf6ef;color:#998878}</style></head><body><div style="text-align:center"><div style="font-size:32px;margin-bottom:12px">${icon}</div><p style="font-size:14px">${text}</p></div></body></html>`;

export const emptyStateDoc = (): string => placeholder('✏️', 'Comece a digitar Pug para ver o resultado.');
export const errorStateDoc = (): string => placeholder('⚠️', 'Corrija o erro acima para ver o resultado.');
