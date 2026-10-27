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
    pug: { label: 'index.pug',  mode: 'pug',        icon: 'assets/pug-logo.svg' },
    css: { label: 'styles.css', mode: 'css',        icon: 'assets/icons/css.svg' },
    js:  { label: 'script.js',  mode: 'javascript', icon: 'assets/icons/js.svg' },
};

// Conteúdo inicial do playground: as três abas começam vazias
PUG.STARTER = Object.freeze({
    pug: '',
    css: '',
    js: '',
});

PUG.PUG_LOGO = `<img src="assets/pug-logo.svg" alt="" aria-hidden="true">`;


