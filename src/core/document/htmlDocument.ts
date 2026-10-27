import { CONSOLE_CAPTURE_SCRIPT } from './consoleCapture';

// Documento completo para um corpo que não é HTML de página inteira
export function buildFullDoc(bodyHtml: string, css: string, js: string, faCdn: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="${faCdn}">
<style>body{margin:0;padding:0;}</style>
<style>${css}</style>
</head><body>
${CONSOLE_CAPTURE_SCRIPT}
${bodyHtml}
<script>${js}<\/script>
</body></html>`;
}

// Injeta CSS, JS e o script de captura numa página HTML já completa
export function injectAssets(html: string, css: string, js: string): string {
  let out = html;
  if (css) {
    const styleTag = `<style>${css}</style>`;
    out = /<\/head>/i.test(out) ? out.replace(/<\/head>/i, styleTag + '</head>') : styleTag + out;
  }
  if (js) {
    const scriptTag = `<script>${js}<\/script>`;
    out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, scriptTag + '</body>') : out + scriptTag;
  }
  return /<\/head>/i.test(out)
    ? out.replace(/<\/head>/i, CONSOLE_CAPTURE_SCRIPT + '</head>')
    : CONSOLE_CAPTURE_SCRIPT + out;
}
