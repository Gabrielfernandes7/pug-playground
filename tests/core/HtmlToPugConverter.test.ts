// @vitest-environment jsdom
import pug from 'pug';
import { describe, expect, it } from 'vitest';
import { HtmlToPugConverter } from '../../src/core/converter/HtmlToPugConverter';

const converter = new HtmlToPugConverter();
const convert = (html: string) => converter.convert(html);

describe('HtmlToPugConverter.convert', () => {
  it('retorna string vazia para entrada em branco', () => {
    expect(convert('   ')).toBe('');
  });

  it('usa id e classes como atalhos e demais atributos entre parênteses', () => {
    expect(convert('<div id="app" class="a b" data-x="1"></div>')).toBe('div#app.a.b(data-x="1")\n');
  });

  it('transforma texto simples em linha com =', () => {
    expect(convert('<p>Olá</p>')).toBe('p= "Olá"\n');
  });

  it('colapsa espaços, exceto em pre', () => {
    expect(convert('<p>a    b</p>')).toBe('p= "a b"\n');
    expect(convert('<pre>a    b</pre>')).toBe('pre= "a    b"\n');
  });

  it('usa bloco de ponto para script e style', () => {
    const out = convert('<style>p { color: red; }</style>');
    expect(out).toBe('style.\n  p { color: red; }\n');
  });

  it('escapa #{ e #[ em conteúdo de script', () => {
    const out = convert('<script>var s = "#{x}";</script>');
    expect(out).toContain('\\#{x}');
  });

  it('preserva comentários de linha única', () => {
    expect(convert('<div><!-- nota --><p>x</p></div>')).toContain('  // nota');
  });

  it('emite doctype quando a entrada é documento completo', () => {
    const out = convert('<!doctype html><html><head></head><body><p>x</p></body></html>');
    expect(out.startsWith('doctype html\n')).toBe(true);
  });

  it('round-trip: o Pug gerado renderiza o mesmo HTML de um fragmento simples', () => {
    const html = '<ul class="lista"><li>um</li><li>dois</li></ul>';
    const rendered = pug.render(convert(html));
    expect(rendered.replace(/\s+/g, '')).toBe(html.replace(/\s+/g, ''));
  });
});
