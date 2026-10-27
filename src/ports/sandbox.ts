// Mensagem enviada pelo script de captura do iframe (console e erros)
export interface SandboxMessage {
  type: 'log' | 'info' | 'warn' | 'error';
  args: string[];
}

// Porta do preview isolado: a única forma de escrever no iframe e de receber o console dele
export interface ISandboxRunner {
  render(html: string): void;
  onMessage(handler: (message: SandboxMessage) => void): () => void;
}
