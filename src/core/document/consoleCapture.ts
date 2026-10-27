// Script injetado no iframe: captura console e erros e os envia ao pai via postMessage.
// O iframe é sandbox sem allow-same-origin, então qualquer acesso a localStorage lança.
export const CONSOLE_CAPTURE_SCRIPT = `<script>
(function(){
  // O iframe é sandbox sem allow-same-origin: acessar localStorage/sessionStorage lança
  // "The operation is insecure" (ex.: MathJax). Troca por um armazenamento em memória.
  ['localStorage', 'sessionStorage'].forEach(function(name){
    try { void window[name]; return; } catch(e){}
    var mem = {};
    var fake = {
      getItem: function(k){ return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function(k, v){ mem[k] = String(v); },
      removeItem: function(k){ delete mem[k]; },
      clear: function(){ mem = {}; },
      key: function(i){ return Object.keys(mem)[i] || null; },
      get length(){ return Object.keys(mem).length; }
    };
    try { Object.defineProperty(window, name, { value: fake, configurable: true }); } catch(e){}
  });
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
