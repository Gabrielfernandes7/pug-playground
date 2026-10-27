import { defineStore } from 'pinia';
import { CONFIG } from '../config';
import { storage } from './services';
import { EDITOR_COLOR_KEYS, EDITOR_THEMES, type EditorTheme } from './editorThemes';
import { cmVar, editorThemesFor, resolveEditorTheme } from './logic';

export type ThemeMode = 'dark' | 'light';

const initialTheme = (): ThemeMode => {
  const saved = storage.get(CONFIG.THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const usePreferences = defineStore('preferences', {
  state: () => ({
    theme: initialTheme(),
    // Escolha salva pelo usuário; pode não caber no modo atual (ver editorThemeId)
    editorChoice: storage.get(CONFIG.EDITOR_THEME_KEY, 'auto') ?? 'auto',
  }),
  getters: {
    editorThemes: (state): EditorTheme[] => editorThemesFor(EDITOR_THEMES, state.theme),
    editorThemeId(): string {
      return resolveEditorTheme(this.editorChoice, this.editorThemes);
    },
  },
  actions: {
    toggleTheme(): void {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      storage.set(CONFIG.THEME_KEY, this.theme);
    },
    setEditorTheme(id: string): void {
      this.editorChoice = id;
      storage.set(CONFIG.EDITOR_THEME_KEY, id);
    },
  },
});

// Aplica o tema no <html>: data-theme para o DaisyUI e --cm-* para o editor e o console.
// Inline vence a regra [data-theme] de tokens.css; 'auto' remove os overrides.
export function applyPageTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme;
}

export function applyEditorColors(id: string): void {
  const style = document.documentElement.style;
  EDITOR_COLOR_KEYS.forEach(key => style.removeProperty(cmVar(key)));
  const theme = EDITOR_THEMES.find(t => t.id === id);
  if (theme?.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => style.setProperty(cmVar(key), value));
  }
}
