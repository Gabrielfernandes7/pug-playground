import type { ISandboxRunner, SandboxMessage } from '../ports/sandbox';

type Handler = (message: SandboxMessage) => void;

// O iframe é sandbox sem allow-same-origin: a origem dele é "null", então a origem não serve
// de filtro. Identifica-se a mensagem pela janela de origem, que é o próprio iframe.
export class IframeSandboxRunner implements ISandboxRunner {
  private readonly handlers = new Set<Handler>();
  private readonly token = Math.random().toString(36).slice(2, 11);

  constructor(private readonly iframe: HTMLIFrameElement) {
    // Primeiro load do iframe: envia ao script de captura a origem do pai (usada em postMessage)
    iframe.addEventListener('load', () => {
      iframe.contentWindow?.postMessage({ __pgInit: true, token: this.token }, window.location.origin);
    }, { once: true });

    window.addEventListener('message', (e: MessageEvent) => {
      if (!e.data || e.data.__pg !== true) return;
      if (e.source !== iframe.contentWindow) return;
      const message: SandboxMessage = { type: e.data.type, args: e.data.args ?? [] };
      this.handlers.forEach(handler => handler(message));
    });
  }

  // Único ponto que escreve no iframe. srcdoc evita src="index.html", que quebra em file://.
  render(html: string): void {
    this.iframe.srcdoc = html;
  }

  onMessage(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}
