window.PUG = window.PUG || {};

PUG.CONSOLE_CAPTURE_SCRIPT = `<script>
(function(){
  var parentOrigin = '*';
  window.addEventListener('message', function(e){
    if (e.data && e.data.__pgInit === true) {
      parentOrigin = e.origin;
    }
  }, { once: true });
  function send(type, args){
    try {
      var payload = Array.prototype.map.call(args, function(a){
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e){ return String(a); }
      });
      parent.postMessage({ __pg: true, type: type, args: payload }, parentOrigin);
    } catch(e){}
  }
  var oe = window.onerror;
  window.onerror = function(msg, src, line, col, err){
    send('error', [msg + (line ? ' (linha ' + line + ':' + col + ')' : '')]);
    if (oe) return oe.apply(this, arguments);
  };
  var our = window.onunhandledrejection;
  window.onunhandledrejection = function(e){
    send('error', ['Unhandled promise: ' + (e.reason && e.reason.message || e.reason)]);
    if (our) return our.apply(this, arguments);
  };
  var olog = console.log, owarn = console.warn, oerr = console.error, oinfo = console.info;
  console.log = function(){ send('log', arguments); return olog.apply(console, arguments); };
  console.warn = function(){ send('warn', arguments); return owarn.apply(console, arguments); };
  console.error = function(){ send('error', arguments); return oerr.apply(console, arguments); };
  console.info = function(){ send('info', arguments); return oinfo.apply(console, arguments); };
})();
<\/script>`;

PUG.buildFullDoc = function(bodyHtml, css, js) {
    const { CONFIG } = PUG;
    return `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="${CONFIG.FA_CDN}">
<style>body{margin:0;padding:0;}</style>
<style>${css || ''}</style>
</head><body>
${PUG.CONSOLE_CAPTURE_SCRIPT}
${bodyHtml}
<script>${js || ''}<\/script>
</body></html>`;
};

PUG.injectAssets = function(html, css, js) {
    let out = html;
    if (css) {
        const styleTag = `<style>${css}</style>`;
        if (/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, styleTag + '</head>');
        else out = styleTag + out;
    }
    if (js) {
        const scriptTag = `<script>${js}<\/script>`;
        if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, scriptTag + '</body>');
        else out = out + scriptTag;
    }
    if (/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, PUG.CONSOLE_CAPTURE_SCRIPT + '</head>');
    else out = PUG.CONSOLE_CAPTURE_SCRIPT + out;
    return out;
};

PUG.compileAll = function(source) {
    const started = performance.now();
    const isEmpty = !source.pug.trim() && !source.css.trim() && !source.js.trim();
    if (isEmpty) return { ok: false, reason: 'empty', elapsed: performance.now() - started };

    let html;
    try {
        html = window.pug.render(source.pug);
    } catch (error) {
        return { ok: false, reason: 'pug', error, elapsed: performance.now() - started };
    }

    const isFullDoc = /^\s*<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html);
    const finalHtml = isFullDoc
        ? PUG.injectAssets(html, source.css, source.js)
        : PUG.buildFullDoc(html, source.css, source.js);

    if (finalHtml.length > PUG.CONFIG.MAX_OUTPUT_BYTES) {
        return {
            ok: false, reason: 'pug',
            error: new Error(`Saída excede ${PUG.CONFIG.MAX_OUTPUT_BYTES / 1024 / 1024}MB — simplifique o template.`),
            elapsed: performance.now() - started,
        };
    }

    return { ok: true, html: finalHtml, elapsed: performance.now() - started };
};
