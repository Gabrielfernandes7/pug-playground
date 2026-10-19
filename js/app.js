window.PUG = window.PUG || {};

PUG.showCritical = function(errors) {
    const diag = document.getElementById('critical-diag');
    if (!diag) return;
    diag.textContent = (errors || [])
        .map((e, i) => `${i + 1}. ${e.url}\n   ↳ ${e.reason}`)
        .join('\n\n') || 'Erro desconhecido.';
    document.getElementById('critical-error').classList.add('visible');
};

PUG.boot = async function() {
    const { CONFIG, FILE_META, PUG_SVG, PUG_LOGO, CSS_SVG, JS_SVG, STARTER,
            $, esc, storage, toast, compileAll } = PUG;

    // Brand & File icons (antes do await: não dependem do Pug e não devem esperar o CDN)
    $('brand-logo').innerHTML = PUG_LOGO;
    document.querySelectorAll('[data-file-icon]').forEach(el => {
        const file = el.parentElement.dataset.file;
        if (file === 'pug') el.innerHTML = PUG_SVG;
        else if (file === 'css') el.innerHTML = CSS_SVG;
        else if (file === 'js') el.innerHTML = JS_SVG;
    });

    const pugResult = await (window.__pugReady || Promise.resolve({ ok: false, errors: [] }));
    if (!pugResult.ok) return PUG.showCritical(pugResult.errors);
    if (typeof CodeMirror === 'undefined') return PUG.showCritical([{ url: 'CodeMirror', reason: 'não carregou do CDN' }]);

    const iframe          = $('preview-frame');
    const editorHost      = $('editor-host');
    const runBtn          = $('run-btn');
    const clearBtn        = $('clear-btn');
    const refreshBtn      = $('refresh-btn');
    const openExtBtn      = $('open-external-btn');
    const fullscreenBtn   = $('fullscreen-btn');
    const importBtn       = $('import-btn');
    const importInput     = $('import-input');
    const shareBtn        = $('share-btn');
    const themeBtn        = $('theme-btn');
    const themeIcon       = $('theme-icon');
    const statusText      = $('status-text');
    const statusDot       = $('status-dot');
    const compileTime     = $('compile-time');
    const cursorLine      = $('cursor-line');
    const cursorCol       = $('cursor-col');
    const activeFileLabel = $('active-file-label');
    const errorBanner     = $('error-banner');
    const errorMessage    = $('error-message');
    const outdatedOverlay = $('outdated-overlay');
    const saveIndicator   = $('save-indicator');
    const consoleOutput   = $('console-output');
    const consolePanel    = $('console-panel');
    const consoleHeader   = $('console-header');
    const consoleBadge    = $('console-badge');
    const consoleClearBtn = $('console-clear-btn');
    const consoleChevron  = $('console-chevron');

    let state = {
        pug: STARTER.pug,
        css: STARTER.css,
        js:  STARTER.js,
    };
    let activeFile = 'pug';
    let lastGoodHTML = '';
    let lastErrorLine = null;
    let lastSavedValue = '';
    let persistedOk = true;
    let refreshRaf = 0;
    let debounce, saveDebounce;
    let consoleCount = 0;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = storage.get(CONFIG.THEME_KEY) || (prefersDark ? 'dark' : 'light');

    function encodeState(s) {
        const json = JSON.stringify({ p: s.pug, c: s.css, j: s.js });
        if (typeof LZString !== 'undefined') return LZString.compressToEncodedURIComponent(json);
        return btoa(unescape(encodeURIComponent(json)));
    }
    function decodeState(str) {
        try {
            let json;
            if (typeof LZString !== 'undefined') json = LZString.decompressFromEncodedURIComponent(str);
            if (!json) json = decodeURIComponent(escape(atob(str)));
            if (!json) return null;
            const obj = JSON.parse(json);
            return { pug: obj.p || '', css: obj.c || '', js: obj.j || '' };
        } catch { return null; }
    }

    const hash = location.hash.slice(1);
    if (hash.startsWith('code=')) {
        const decoded = decodeState(hash.slice(5));
        if (decoded) {
            state = { ...state, ...decoded };
            history.replaceState(null, '', location.pathname + location.search);
            setTimeout(() => toast('Código carregado do link compartilhado'), 600);
        }
    } else {
        const saved = storage.get(CONFIG.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    state = {
                        pug: parsed.pug ?? state.pug,
                        css: parsed.css ?? state.css,
                        js:  parsed.js  ?? state.js,
                    };
                } else if (typeof parsed === 'string') {
                    state.pug = parsed;
                }
            } catch { /* ignora */ }
        }
    }

    function applyTheme(theme) {
        currentTheme = theme;
        document.documentElement.dataset.theme = theme;
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        storage.set(CONFIG.THEME_KEY, theme);
    }
    applyTheme(currentTheme);

    const docs = {
        pug: CodeMirror.Doc(state.pug, FILE_META.pug.mode),
        css: CodeMirror.Doc(state.css, FILE_META.css.mode),
        js:  CodeMirror.Doc(state.js,  FILE_META.js.mode),
    };

    const iframeToken = Math.random().toString(36).slice(2, 11);
    iframe.addEventListener('load', () => {
        iframe.contentWindow.postMessage({ __pgInit: true, token: iframeToken }, window.location.origin);
    }, { once: true });

    const editor = CodeMirror(editorHost, {
        value: '',
        mode: 'pug',
        theme: 'pug',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
            'Ctrl-Enter': () => { renderAll(); return false; },
            'Cmd-Enter':  () => { renderAll(); return false; },
            'Ctrl-S':     () => { downloadHTML(); return false; },
            'Cmd-S':      () => { downloadHTML(); return false; },
            'Ctrl-Shift-V': () => { pasteAndRender(); return false; },
            'Cmd-Shift-V':  () => { pasteAndRender(); return false; },
            'Ctrl-Space': 'autocomplete',
        },
    });
    editor.swapDoc(docs[activeFile]);
    lastSavedValue = serializeState();

    document.querySelectorAll('.file-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.file));
    });
    function switchTab(file) {
        if (file === activeFile) return;
        activeFile = file;
        editor.swapDoc(docs[file]);
        document.querySelectorAll('.file-tab').forEach(t => t.classList.toggle('active', t.dataset.file === file));
        activeFileLabel.textContent = FILE_META[file].label;
        updateCursor();
        editor.focus();
    }
    function currentSource() {
        return { pug: docs.pug.getValue(), css: docs.css.getValue(), js: docs.js.getValue() };
    }
    function updateCursor() {
        const p = editor.getCursor();
        cursorLine.textContent = p.line + 1;
        cursorCol.textContent  = p.ch + 1;
    }
    editor.on('cursorActivity', updateCursor);

    const STATUS = {
        idle:    { color: 'var(--color-success)', text: 'Vazio' },
        pending: { color: 'var(--color-warning)', text: 'Digitando…' },
        success: { color: 'var(--color-success)', text: 'Compilado' },
        error:   { color: 'var(--color-error)',   text: 'Erro' },
        loading: { color: 'var(--color-warning)', text: 'Inicializando…' },
    };
    function setStatus(kind, custom) {
        const cfg = STATUS[kind] || STATUS.idle;
        statusText.textContent = custom || cfg.text;
        statusDot.style.background = cfg.color;
        statusDot.style.animation = (kind === 'pending' || kind === 'loading') ? 'status-pulse 1.2s ease-in-out infinite' : '';
    }
    function clearErrorHighlight() {
        if (lastErrorLine !== null) {
            editor.removeLineClass(lastErrorLine, 'background', 'cm-error-line');
            lastErrorLine = null;
        }
    }
    function showErrorBanner(err) {
        errorBanner.classList.add('visible');
        errorMessage.textContent = err.message || String(err);
        const m = String(err.message || '').match(/(\d+):\d+/);
        if (m) {
            const line = parseInt(m[1], 10) - 1;
            if (line >= 0 && line < editor.lineCount()) {
                editor.addLineClass(line, 'background', 'cm-error-line');
                editor.scrollIntoView({ line, ch: 0 }, 80);
                lastErrorLine = line;
            }
        }
    }
    function hideErrorBanner() {
        errorBanner.classList.remove('visible');
        errorMessage.textContent = '';
        clearErrorHighlight();
    }

    const emptyStateDoc = () => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#faf6ef;color:#998878}</style></head><body><div style="text-align:center"><div style="font-size:32px;margin-bottom:12px">✏️</div><p style="font-size:14px">Comece a digitar Pug para ver o resultado.</p></div></body></html>`;
    const errorStateDoc = () => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#faf6ef;color:#998878}</style></head><body><div style="text-align:center"><div style="font-size:32px;margin-bottom:12px">⚠️</div><p style="font-size:14px">Corrija o erro acima para ver o resultado.</p></div></body></html>`;

    // Único ponto que escreve no iframe. srcdoc evita src="index.html", que quebra em file://.
    function updatePreview(html) {
        iframe.srcdoc = html;
    }

    function renderAll() {
        clearConsole();
        const source = currentSource();
        const result = compileAll(source);
        compileTime.textContent = result.elapsed.toFixed(1) + ' ms';

        if (result.reason === 'empty') {
            updatePreview(emptyStateDoc());
            hideErrorBanner();
            outdatedOverlay.classList.remove('visible');
            setStatus('idle');
            return;
        }
        if (result.ok) {
            lastGoodHTML = result.html;
            updatePreview(result.html);
            hideErrorBanner();
            outdatedOverlay.classList.remove('visible');
            setStatus('success');
        } else {
            if (lastGoodHTML) outdatedOverlay.classList.add('visible');
            else updatePreview(errorStateDoc());
            showErrorBanner(result.error);
            setStatus('error');
        }
    }

    function serializeState() {
        return JSON.stringify(currentSource());
    }
    function scheduleSave() {
        saveIndicator.innerHTML = 'salvando…';
        saveIndicator.style.opacity = '.5';
        clearTimeout(saveDebounce);
        saveDebounce = setTimeout(() => {
            const value = serializeState();
            persistedOk = storage.set(CONFIG.STORAGE_KEY, value);
            if (persistedOk) lastSavedValue = value;
            saveIndicator.innerHTML = persistedOk ? 'salvo <i class="fas fa-check"></i>' : 'salvar: off';
            saveIndicator.style.opacity = '';
        }, CONFIG.SAVE_MS);
    }
    editor.on('change', () => {
        setStatus('pending');
        clearTimeout(debounce);
        debounce = setTimeout(() => renderAll(), CONFIG.DEBOUNCE_MS);
        scheduleSave();
    });

    function clearConsole() {
        consoleOutput.innerHTML = '';
        consoleCount = 0;
        consoleBadge.classList.remove('visible');
        consoleBadge.textContent = '0';
    }
    function appendConsole(type, args) {
        const line = document.createElement('div');
        line.className = 'console-line console-' + type;
        const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
        line.innerHTML = `<span class="console-time">${time}</span><span class="console-msg">${esc(args.join(' '))}</span>`;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        if (type === 'error' || type === 'warn') {
            consoleCount++;
            consoleBadge.textContent = String(consoleCount);
            consoleBadge.classList.add('visible');
            if (consolePanel.classList.contains('collapsed')) {
                consolePanel.classList.remove('collapsed');
                consoleChevron.style.transform = '';
            }
        }
    }
    window.addEventListener('message', (e) => {
        if (!e.data || e.data.__pg !== true) return;
        if (e.origin !== window.location.origin) return;
        appendConsole(e.data.type, e.data.args || []);
    });
    consoleHeader.addEventListener('click', (e) => {
        if (e.target.closest('#console-clear-btn')) return;
        consolePanel.classList.toggle('collapsed');
        consoleChevron.style.transform = consolePanel.classList.contains('collapsed') ? 'rotate(180deg)' : '';
    });
    consoleClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearConsole();
    });

    function downloadHTML() {
        if (!lastGoodHTML) { toast('Nada para baixar — compile primeiro'); return; }
        const blob = new Blob([lastGoodHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'output.html';
        a.click(); URL.revokeObjectURL(url);
        toast('HTML baixado');
    }
    function openExternal() {
        if (!lastGoodHTML) { toast('Nada para abrir — compile primeiro'); return; }
        const blob = new Blob([lastGoodHTML], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
    }

    function importFiles(files) {
        if (!files || !files.length) return;
        let imported = 0;
        const pending = Array.from(files);
        pending.forEach(file => {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const target = (ext === 'pug' || ext === 'jade') ? 'pug' : (ext === 'css') ? 'css' : (ext === 'js') ? 'js' : null;
            if (!target) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                docs[target].setValue(e.target.result);
                imported++;
                if (imported === pending.length) {
                    switchTab(target);
                    renderAll();
                    toast(imported === 1 ? 'Arquivo importado' : `${imported} arquivos importados`);
                }
            };
            reader.readAsText(file);
        });
    }
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => { importFiles(e.target.files); importInput.value = ''; });
    editorHost.addEventListener('dragover', (e) => { e.preventDefault(); editorHost.classList.add('dragging'); });
    editorHost.addEventListener('dragleave', () => editorHost.classList.remove('dragging'));
    editorHost.addEventListener('drop', (e) => {
        e.preventDefault();
        editorHost.classList.remove('dragging');
        if (e.dataTransfer.files.length) importFiles(e.dataTransfer.files);
    });

    async function pasteAndRender() {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) { toast('Clipboard vazio'); return; }
            docs[activeFile].setValue(text);
            renderAll();
            toast(`Colado em ${FILE_META[activeFile].label}`);
        } catch { toast('Não foi possível ler o clipboard'); }
    }

    shareBtn.addEventListener('click', async () => {
        const encoded = encodeState(currentSource());
        const url = location.origin + location.pathname + '#code=' + encoded;
        try {
            await navigator.clipboard.writeText(url);
            toast('Link copiado! Cole no navegador para abrir.');
        } catch {
            prompt('Copie o link:', url);
        }
    });

    themeBtn.addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));

    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const w = parseInt(btn.dataset.width, 10);
            if (w > 0) { iframe.style.width = w + 'px'; iframe.style.maxWidth = '100%'; }
            else { iframe.style.width = '100%'; iframe.style.maxWidth = '100%'; }
        });
    });

    runBtn.addEventListener('click', () => {
        renderAll();
        if (phoneQuery.matches) setView('preview');
    });
    refreshBtn.addEventListener('click', () => renderAll());
    openExtBtn.addEventListener('click', openExternal);
    clearBtn.addEventListener('click', () => {
        const hasContent = Object.values(docs).some(doc => doc.getValue().trim().length > 0);
        if (hasContent && !confirm('Limpar todos os arquivos (Pug, CSS e JS)?')) return;
        docs.pug.setValue('');
        docs.css.setValue('');
        docs.js.setValue('');
        renderAll();
    });
    fullscreenBtn.addEventListener('click', () => {
        const pane = $('preview-pane');
        if (!document.fullscreenElement) pane.requestFullscreen?.();
        else document.exitFullscreen?.();
    });
    document.addEventListener('fullscreenchange', () => {
        const active = !!document.fullscreenElement;
        fullscreenBtn.innerHTML = `<i class="fas ${active ? 'fa-compress' : 'fa-expand'}"></i>`;
        fullscreenBtn.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Tela cheia');
    });

    const resizer    = $('resizer');
    const editorPane = $('editor-pane');
    const mainArea   = $('main-area');
    let dragging = false;

    function scheduleRefresh() {
        if (refreshRaf) return;
        refreshRaf = requestAnimationFrame(() => {
            refreshRaf = 0;
            editor.refresh();
        });
    }
    function onDragMove(e) {
        if (!dragging) return;
        const rect = mainArea.getBoundingClientRect();
        const maxW = rect.width - CONFIG.MIN_PANE_WIDTH - resizer.offsetWidth;
        const w = Math.max(CONFIG.MIN_PANE_WIDTH, Math.min(maxW, e.clientX - rect.left));
        editorPane.style.width = w + 'px';
        scheduleRefresh();
    }
    function onDragEnd() {
        if (!dragging) return;
        dragging = false;
        resizer.classList.remove('active');
        document.body.style.cursor = '';
        iframe.style.pointerEvents = '';
        document.removeEventListener('pointermove', onDragMove);
        document.removeEventListener('pointerup', onDragEnd);
        document.removeEventListener('pointercancel', onDragEnd);
    }
    // Eventos de ponteiro cobrem mouse, caneta e toque
    resizer.addEventListener('pointerdown', (e) => {
        dragging = true;
        resizer.classList.add('active');
        resizer.setPointerCapture(e.pointerId);
        document.body.style.cursor = 'col-resize';
        iframe.style.pointerEvents = 'none';
        document.addEventListener('pointermove', onDragMove);
        document.addEventListener('pointerup', onDragEnd);
        document.addEventListener('pointercancel', onDragEnd);
        e.preventDefault();
    });
    resizer.addEventListener('dblclick', () => {
        editorPane.style.width = '50%';
        scheduleRefresh();
    });

    // Celular: alterna entre Código e Preview (um painel por vez)
    const viewSwitch = $('view-switch');
    const phoneQuery = window.matchMedia('(max-width: 767px)');
    function setView(view) {
        mainArea.dataset.view = view;
        viewSwitch.querySelectorAll('[data-view-btn]').forEach(btn => {
            const active = btn.dataset.viewBtn === view;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', String(active));
        });
        if (view === 'editor') scheduleRefresh(); // CodeMirror precisa remedir ao reaparecer
    }
    viewSwitch.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-view-btn]');
        if (btn) setView(btn.dataset.viewBtn);
    });
    // Ao girar o aparelho ou redimensionar, o editor volta a ser medido
    phoneQuery.addEventListener('change', () => scheduleRefresh());

    window.addEventListener('beforeunload', (e) => {
        const dirty = serializeState() !== lastSavedValue;
        if (!persistedOk || dirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    updateCursor();
    renderAll();
};

document.addEventListener('DOMContentLoaded', () => {
    PUG.boot().catch(err => PUG.showCritical([{ url: 'boot', reason: err.message || String(err) }]));
});
