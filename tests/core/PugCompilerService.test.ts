import pug from 'pug';
import { describe, expect, it } from 'vitest';
import { PugCompilerService } from '../../src/core/compiler/PugCompilerService';

const FA = 'https://example.test/fa.css';
const service = (maxOutputLength = 5 * 1024 * 1024) =>
  new PugCompilerService({ render: t => pug.render(t), maxOutputLength, faCdn: FA });
const empty = { pug: '', css: '', js: '' };

describe('PugCompilerService.compile', () => {
  it('retorna empty quando as três abas estão vazias', () => {
    const result = service().compile(empty);
    expect(result).toMatchObject({ ok: false, reason: 'empty' });
  });

  it('envolve um fragmento num documento completo com CSS, JS e captura de console', () => {
    const result = service().compile({ pug: 'h1 Oi', css: 'h1{color:red}', js: 'console.log(1)' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html).toMatch(/^<!DOCTYPE html>/);
    expect(result.html).toContain(`<link rel="stylesheet" href="${FA}">`);
    expect(result.html).toContain('<h1>Oi</h1>');
    expect(result.html).toContain('<style>h1{color:red}</style>');
    expect(result.html).toContain('<script>console.log(1)</script>');
    expect(result.html).toContain('parent.postMessage');
  });

  it('injeta assets em página completa em vez de envolver de novo', () => {
    const result = service().compile({ pug: 'html\n  head\n  body\n    p x', css: 'p{}', js: 'a()' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html.match(/<html/gi)).toHaveLength(1);
    expect(result.html).toContain('<head><style>p{}</style>');
  });

  it('reporta erro de sintaxe Pug como reason pug, sem lançar', () => {
    const result = service().compile({ pug: 'div(', css: '', js: '' });
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== 'pug') throw new Error('esperava falha de pug');
    expect(result.error).toBeInstanceOf(Error);
  });

  it('recusa saída acima do limite configurado', () => {
    const result = service(100).compile({ pug: 'p x', css: 'a{}'.repeat(50), js: '' });
    expect(result).toMatchObject({ ok: false, reason: 'pug' });
    if (result.ok || result.reason !== 'pug') throw new Error('esperava falha de pug');
    expect(result.error.message).toMatch(/excede/);
  });

  it('aceita um renderizador injetado (sem pug real)', () => {
    const fake = new PugCompilerService({ render: () => '<p>fake</p>', maxOutputLength: 1e6, faCdn: FA });
    const result = fake.compile({ pug: 'qualquer', css: '', js: '' });
    expect(result.ok && result.html).toContain('<p>fake</p>');
  });
});
