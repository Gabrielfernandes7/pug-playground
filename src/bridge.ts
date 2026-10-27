// Ponte temporária entre o core tipado e o legado em js/ (que lê window.PUG e window.pug).
// Roda como módulo, depois que os scripts clássicos de config.js e utils.js já criaram window.PUG.
// Descomissionar junto com js/ na Fase 3.
import './shims/process';
import pug from 'pug';
import { PugCompilerService } from './core/compiler/PugCompilerService';
import { HtmlToPugConverter } from './core/converter/HtmlToPugConverter';
import { CONSOLE_CAPTURE_SCRIPT } from './core/document/consoleCapture';
import { buildFullDoc, injectAssets } from './core/document/htmlDocument';
import { IframeSandboxRunner } from './adapters/IframeSandboxRunner';
import { LocalStorageService } from './adapters/LocalStorageService';
import { CodeMirror5Adapter, createTextEditor } from './adapters/CodeMirror5Adapter';
import type { EditorKeymap } from './ports/editor';

interface LegacyConfig {
  FA_CDN: string;
  MAX_OUTPUT_BYTES: number;
}

declare global {
  interface Window {
    PUG: Record<string, unknown>;
    pug: typeof pug;
    __pugReady: Promise<{ ok: boolean; errors: unknown[] }>;
  }
}

const legacy = window.PUG;
const config = legacy.CONFIG as LegacyConfig;

const compiler = new PugCompilerService({
  render: template => pug.render(template),
  maxOutputLength: config.MAX_OUTPUT_BYTES,
  faCdn: config.FA_CDN,
});
const converter = new HtmlToPugConverter();

// O legado chama compileAll(source) e htmlToPug(html); mantemos essas assinaturas
Object.assign(legacy, {
  compileAll: (source: { pug: string; css: string; js: string }) => compiler.compile(source),
  htmlToPug: (html: string) => converter.convert(html),
  buildFullDoc,
  injectAssets,
  CONSOLE_CAPTURE_SCRIPT,
  // Portas de infraestrutura: o legado só usa estes objetos, nunca localStorage ou o iframe direto
  storage: new LocalStorageService(),
  createEditor: (host: HTMLElement, keymap: EditorKeymap) => new CodeMirror5Adapter(host, keymap),
  createTextEditor,
  sandbox: new IframeSandboxRunner(document.getElementById('preview-frame') as HTMLIFrameElement),
});

// converter.js lê window.pug.render diretamente
window.pug = pug;

// Pug já vem empacotado: o loader de CDNs deixa de existir
window.__pugReady = Promise.resolve({ ok: true, errors: [] });
