window.PUG = window.PUG || {};

PUG.CONFIG = Object.freeze({
    DEBOUNCE_MS: 400,
    SAVE_MS: 400,
    MIN_PANE_WIDTH: 280,
    MAX_OUTPUT_BYTES: 5 * 1024 * 1024,
    STORAGE_KEY: 'pug-playground:state:v2',
    THEME_KEY: 'pug-playground:theme',
    EDITOR_THEME_KEY: 'pug-playground:editor-theme',
    MAX_CONSOLE_LINES: 500,
    MAX_IMPORT_BYTES: 2 * 1024 * 1024,
    FA_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
});

// Variáveis --cm-* que um tema de editor controla (além do próprio console, que as reutiliza)
PUG.EDITOR_COLOR_KEYS = Object.freeze([
    'bg', 'fg', 'gutterBg', 'border', 'lineNum', 'cursor', 'selection', 'activeLine',
    'keyword', 'def', 'variable', 'string', 'number', 'comment', 'tag', 'attribute',
    'atom', 'bracket', 'operator', 'punctuation',
]);

// 'auto' remove os overrides e volta às cores de tokens.css (escuro = Monokai, claro = claro).
// 'mode' diz em qual tema da página o tema do editor aparece: temas claros só no claro, escuros só no escuro.
PUG.EDITOR_THEMES = Object.freeze([
    { id: 'auto', label: 'Padrão do tema', mode: null, colors: null },
    { id: 'monokai', label: 'Monokai', mode: 'dark', colors: {
        bg: '#272822', fg: '#f8f8f2', gutterBg: '#272822', border: 'rgba(255,255,255,.06)',
        lineNum: '#90908a', cursor: '#f8f8f0', selection: 'rgba(73,72,62,.9)', activeLine: 'rgba(62,61,50,.6)',
        keyword: '#f92672', def: '#a6e22e', variable: '#f8f8f2', string: '#e6db74', number: '#ae81ff',
        comment: '#75715e', tag: '#f92672', attribute: '#a6e22e', atom: '#ae81ff',
        bracket: '#f8f8f2', operator: '#f92672', punctuation: '#f8f8f2',
    } },
    { id: 'darcula', label: 'Darcula', mode: 'dark', colors: {
        bg: '#2b2b2b', fg: '#a9b7c6', gutterBg: '#313335', border: '#3c3f41',
        lineNum: '#606366', cursor: '#bbbbbb', selection: '#214283', activeLine: '#323232',
        keyword: '#cc7832', def: '#ffc66d', variable: '#a9b7c6', string: '#6a8759', number: '#6897bb',
        comment: '#808080', tag: '#e8bf6a', attribute: '#bababa', atom: '#9876aa',
        bracket: '#a9b7c6', operator: '#a9b7c6', punctuation: '#a9b7c6',
    } },
    { id: 'dracula', label: 'Dracula', mode: 'dark', colors: {
        bg: '#282a36', fg: '#f8f8f2', gutterBg: '#282a36', border: 'rgba(255,255,255,.06)',
        lineNum: '#6272a4', cursor: '#f8f8f2', selection: '#44475a', activeLine: 'rgba(68,71,90,.4)',
        keyword: '#ff79c6', def: '#50fa7b', variable: '#f8f8f2', string: '#f1fa8c', number: '#bd93f9',
        comment: '#6272a4', tag: '#ff79c6', attribute: '#50fa7b', atom: '#bd93f9',
        bracket: '#f8f8f2', operator: '#ff79c6', punctuation: '#f8f8f2',
    } },
    { id: 'one-dark', label: 'One Dark', mode: 'dark', colors: {
        bg: '#282c34', fg: '#abb2bf', gutterBg: '#282c34', border: 'rgba(255,255,255,.06)',
        lineNum: '#4b5263', cursor: '#528bff', selection: '#3e4451', activeLine: 'rgba(44,49,60,.6)',
        keyword: '#c678dd', def: '#61afef', variable: '#e06c75', string: '#98c379', number: '#d19a66',
        comment: '#5c6370', tag: '#e06c75', attribute: '#d19a66', atom: '#d19a66',
        bracket: '#abb2bf', operator: '#56b6c2', punctuation: '#abb2bf',
    } },
    { id: 'solarized-dark', label: 'Solarized Dark', mode: 'dark', colors: {
        bg: '#002b36', fg: '#839496', gutterBg: '#002b36', border: 'rgba(255,255,255,.05)',
        lineNum: '#586e75', cursor: '#839496', selection: '#073642', activeLine: 'rgba(7,54,66,.6)',
        keyword: '#859900', def: '#268bd2', variable: '#839496', string: '#2aa198', number: '#d33682',
        comment: '#586e75', tag: '#268bd2', attribute: '#93a1a1', atom: '#6c71c4',
        bracket: '#839496', operator: '#93a1a1', punctuation: '#839496',
    } },
    { id: 'github-light', label: 'GitHub Light', mode: 'light', colors: {
        bg: '#ffffff', fg: '#24292e', gutterBg: '#f6f8fa', border: '#e1e4e8',
        lineNum: '#959da5', cursor: '#24292e', selection: '#c8e1ff', activeLine: 'rgba(246,248,250,.9)',
        keyword: '#d73a49', def: '#6f42c1', variable: '#24292e', string: '#032f62', number: '#005cc5',
        comment: '#6a737d', tag: '#22863a', attribute: '#005cc5', atom: '#005cc5',
        bracket: '#24292e', operator: '#d73a49', punctuation: '#24292e',
    } },
]);

PUG.FILES = ['pug', 'css', 'js'];
PUG.FILE_META = {
    pug: { label: 'index.pug', mode: 'pug',        badge: 'fa-dog' },
    css: { label: 'styles.css', mode: 'css',        badge: 'fa-css3-alt' },
    js:  { label: 'script.js',  mode: 'javascript', badge: 'fa-js' },
};

// Conteúdo inicial do playground: as três abas começam vazias
PUG.STARTER = Object.freeze({
    pug: '',
    css: '',
    js: '',
});

PUG.PUG_SVG = `<img src="assets/pug.png" alt="Pug" aria-hidden="true">`;
PUG.PUG_LOGO = `<img src="assets/pug-logo.svg" alt="" aria-hidden="true">`;

PUG.CSS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" aria-hidden="true"><path fill="#639" d="M0 0H840A160 160 0 0 1 1000 160V840A160 160 0 0 1 840 1000H160A160 160 0 0 1 0 840V0Z"/><path fill="#fff" d="M816.54 919.9c-32.39 0-57.16-9.42-74.5-28.35-17.15-19.03-26.08-46.18-26.88-81.64h69.8c.4 31.36 11.42 47.08 33.08 47.08 11.04 0 18.86-3.5 23.37-10.42 4.41-6.9 6.72-17.93 6.72-33.05 0-12.02-3.01-22.04-8.83-29.95a73.2 73.2 0 0 0-29.48-21.14L783.95 750c-23.06-11.02-39.81-24.04-50.14-39.27-10.03-15.13-15.04-36.36-15.04-63.5 0-30.36 8.83-55 26.37-73.94 18.05-18.93 42.62-28.34 74-28.34 30.3 0 53.76 9.31 70.3 27.84 16.85 18.64 25.67 45.28 26.38 80.14h-67.19c.4-11.4-1.9-22.72-6.72-33.06-3.8-7.6-11.23-11.41-22.26-11.41-19.65 0-29.48 11.71-29.48 35.05 0 11.83 2.4 21.04 7.22 28.05A65.18 65.18 0 0 0 822.76 689l24.77 10.92c25.57 11.72 44.02 26.05 55.35 43.38 11.43 17.23 17.05 40.27 17.05 69.12 0 34.56-9.03 61.1-27.38 79.63-18.25 18.53-43.62 27.85-76 27.85Zm-225.42 0c-32.4 0-57.16-9.42-74.51-28.35-17.15-19.03-26.07-46.18-26.87-81.64h69.79c.4 31.36 11.43 47.08 33.1 47.08 11.02 0 18.84-3.5 23.25-10.42 4.52-6.9 6.72-17.93 6.72-33.05 0-12.02-2.9-22.04-8.72-29.95a73.2 73.2 0 0 0-29.48-21.14L558.53 750c-23.07-11.02-39.81-24.04-50.14-39.27-10.03-15.13-15.04-36.36-15.04-63.5 0-30.36 8.82-55 26.37-73.94 18.05-18.93 42.62-28.34 74-28.34 30.29 0 53.75 9.31 70.2 27.84 17.05 18.64 25.77 45.28 26.47 80.14h-67.18c.4-11.4-1.9-22.72-6.72-33.06-3.81-7.6-11.23-11.41-22.26-11.41-19.66 0-29.49 11.71-29.49 35.05 0 11.83 2.41 21.04 7.22 28.05A65.18 65.18 0 0 0 597.33 689l24.77 10.92c25.57 11.72 44.02 26.05 55.36 43.38 11.33 17.23 17.04 40.27 17.04 69.12 0 34.56-9.12 61.1-27.37 79.63-18.25 18.53-43.62 27.85-76.01 27.85Zm-234.75 0c-31.7 0-56.86-8.62-75.51-25.85-18.65-17.12-27.88-42.87-27.88-76.93V648.83c0-33.85 9.83-59.5 29.48-77.13 19.96-17.43 46.13-26.24 78.52-26.24 31.39 0 56.15 9.01 74.5 26.84 18.56 17.93 27.88 44.58 27.88 80.14v13.32h-73.9v-12.92c0-13.72-3.01-23.84-8.83-30.45a26.46 26.46 0 0 0-21.66-10.32c-12.03 0-20.55 4.1-25.37 12.42a79.04 79.04 0 0 0-6.72 36.66v146.26c0 30.55 10.74 46.08 32.1 46.38 10.02 0 17.54-3.61 22.76-10.82a51.74 51.74 0 0 0 7.72-30.46V801.6h73.9v11.42c0 23.74-4.61 43.57-13.94 59.4a88.8 88.8 0 0 1-38.2 35.66 121.46 121.46 0 0 1-54.85 11.82Z"/></svg>`;

PUG.JS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 482.2 367.2" aria-hidden="true"><path d="m130.9 39.7h64.9v181.9c0 82-39.2 110.6-102 110.6-15.3 0-35-2.6-47.8-6.9l7.3-52.5c10.8 3.4 22 5.2 33.3 5.1 27.3 0 44.4-12.4 44.4-56.8 0 .1-.1-181.4-.1-181.4zm121.3 221.2c17.1 9 44.4 17.9 72.1 17.9 29.9 0 45.7-12.4 45.7-31.5 0-17.5-13.6-28.2-48.2-40.1-47.8-17.1-79.4-43.5-79.4-85.8 0-49.2 41.4-86.3 108.9-86.3 32.9 0 56.4 6.4 73.4 14.5l-14.5 52.1c-18.6-9.1-39.1-13.8-59.8-13.6-28.2 0-41.8 13.2-41.8 27.8 0 18.3 15.8 26.5 53.4 41 50.8 18.8 74.3 45.2 74.3 86.3 0 48.2-36.8 89.3-115.8 89.3-32.9 0-65.4-9-81.6-17.9z" style="fill: var(--file-icon-js)"/></svg>`;

