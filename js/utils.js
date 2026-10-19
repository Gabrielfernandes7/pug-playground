window.PUG = window.PUG || {};

PUG.$ = (id) => document.getElementById(id);

PUG.esc = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));

PUG.storage = {
    get(key, fallback = null) {
        try { const v = localStorage.getItem(key); return v === null ? fallback : v; }
        catch { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, value); return true; }
        catch { return false; }
    },
};

PUG.toast = function(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(PUG.toast._t);
    PUG.toast._t = setTimeout(() => el.classList.remove('show'), 2500);
};
