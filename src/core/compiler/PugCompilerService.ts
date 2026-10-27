import { buildFullDoc, injectAssets } from '../document/htmlDocument';
import type { CompileResult, CompileSource, ICompilerService } from './types';

export interface PugCompilerOptions {
  // Recebe o renderizador por injeção: o core não sabe de onde o pug veio
  render: (template: string) => string;
  maxOutputLength: number;
  faCdn: string;
}

export class PugCompilerService implements ICompilerService {
  constructor(private readonly options: PugCompilerOptions) {}

  compile(source: CompileSource): CompileResult {
    const started = performance.now();
    const elapsed = () => performance.now() - started;

    const isEmpty = !source.pug.trim() && !source.css.trim() && !source.js.trim();
    if (isEmpty) return { ok: false, reason: 'empty', elapsed: elapsed() };

    let html: string;
    try {
      html = this.options.render(source.pug);
    } catch (error) {
      return { ok: false, reason: 'pug', error: toError(error), elapsed: elapsed() };
    }

    const isFullDoc = /^\s*<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html);
    const finalHtml = isFullDoc
      ? injectAssets(html, source.css, source.js)
      : buildFullDoc(html, source.css, source.js, this.options.faCdn);

    // Mede em caracteres, como antes da migração (o limite é aproximado, não de bytes)
    if (finalHtml.length > this.options.maxOutputLength) {
      const mb = this.options.maxOutputLength / 1024 / 1024;
      return {
        ok: false,
        reason: 'pug',
        error: new Error(`Saída excede ${mb}MB — simplifique o template.`),
        elapsed: elapsed(),
      };
    }

    return { ok: true, html: finalHtml, elapsed: elapsed() };
  }
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
