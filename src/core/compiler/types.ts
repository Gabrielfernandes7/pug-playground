export interface CompileSource {
  pug: string;
  css: string;
  js: string;
}

export interface CompileSuccess {
  ok: true;
  html: string;
  elapsed: number;
}

export type CompileFailure =
  | { ok: false; reason: 'empty'; elapsed: number }
  | { ok: false; reason: 'pug'; error: Error; elapsed: number };

export type CompileResult = CompileSuccess | CompileFailure;

// Porta de compilação: a UI depende disto, não do pug diretamente
export interface ICompilerService {
  compile(source: CompileSource): CompileResult;
}
