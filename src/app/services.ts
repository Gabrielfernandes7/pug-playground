// Composição da aplicação: cria os adaptadores e carrega o Pug sob demanda.
import '../shims/process';
import { CONFIG } from '../config';
import { PugCompilerService } from '../core/compiler/PugCompilerService';
import type { ICompilerService } from '../core/compiler/types';
import { HtmlToPugConverter } from '../core/converter/HtmlToPugConverter';
import { LocalStorageService } from '../adapters/LocalStorageService';
import type { IHtmlConverter } from '../core/converter/types';

export const storage = new LocalStorageService();
export const htmlConverter: IHtmlConverter = new HtmlToPugConverter();

// O pug só é baixado quando precisa compilar ou converter. Fica em memória depois da primeira vez.
let pugModule: Promise<typeof import('pug')> | null = null;
export function loadPug(): Promise<typeof import('pug')> {
  pugModule ??= import('pug');
  return pugModule;
}

let compiler: Promise<ICompilerService> | null = null;
export function loadCompiler(): Promise<ICompilerService> {
  compiler ??= loadPug().then(({ default: pug }) => new PugCompilerService({
    render: template => pug.render(template),
    maxOutputLength: CONFIG.MAX_OUTPUT_BYTES,
    faCdn: CONFIG.EXPORT_FA_CDN,
  }));
  return compiler;
}
