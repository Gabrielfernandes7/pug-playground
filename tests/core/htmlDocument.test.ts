import { describe, expect, it } from 'vitest';
import { buildFullDoc, injectAssets } from '../../src/core/document/htmlDocument';
import { CONSOLE_CAPTURE_SCRIPT } from '../../src/core/document/consoleCapture';

describe('buildFullDoc', () => {
  it('põe o corpo, os estilos e o script de captura na ordem esperada', () => {
    const doc = buildFullDoc('<p>x</p>', 'p{}', 'run()', 'fa.css');
    expect(doc.indexOf(CONSOLE_CAPTURE_SCRIPT)).toBeLessThan(doc.indexOf('<p>x</p>'));
    expect(doc.indexOf('<p>x</p>')).toBeLessThan(doc.indexOf('<script>run()</script>'));
  });
});

describe('injectAssets', () => {
  it('insere o captura antes de </head> quando existe head', () => {
    const out = injectAssets('<html><head></head><body></body></html>', '', '');
    expect(out).toContain(CONSOLE_CAPTURE_SCRIPT + '</head>');
  });

  it('sem head, prefixa o captura no HTML', () => {
    const out = injectAssets('<p>a</p>', '', '');
    expect(out.startsWith(CONSOLE_CAPTURE_SCRIPT)).toBe(true);
  });

  it('não insere estilo nem script quando css e js estão vazios', () => {
    const out = injectAssets('<html><head></head><body></body></html>', '', '');
    expect(out).not.toContain('<style>');
    expect(out.match(/<script>/g)).toHaveLength(1);
  });
});
