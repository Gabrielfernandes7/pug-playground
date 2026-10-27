// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IframeSandboxRunner } from '../../src/adapters/IframeSandboxRunner';
import type { SandboxMessage } from '../../src/ports/sandbox';

let iframe: HTMLIFrameElement;
afterEach(() => iframe?.remove());

function setup() {
  iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return new IframeSandboxRunner(iframe);
}

// Simula o iframe enviando uma mensagem; jsdom aceita qualquer objeto como source
const fromIframe = (data: unknown, source: unknown = iframe.contentWindow) =>
  window.dispatchEvent(new MessageEvent('message', { data, source: source as Window }));

describe('IframeSandboxRunner', () => {
  it('render grava o HTML em srcdoc', () => {
    const runner = setup();
    runner.render('<p>oi</p>');
    expect(iframe.srcdoc).toBe('<p>oi</p>');
  });

  it('entrega mensagens do próprio iframe aos handlers', () => {
    const runner = setup();
    const handler = vi.fn<(m: SandboxMessage) => void>();
    runner.onMessage(handler);
    fromIframe({ __pg: true, type: 'log', args: ['a', 'b'] });
    expect(handler).toHaveBeenCalledWith({ type: 'log', args: ['a', 'b'] });
  });

  it('ignora mensagens sem a marca __pg', () => {
    const runner = setup();
    const handler = vi.fn();
    runner.onMessage(handler);
    fromIframe({ type: 'log', args: ['x'] });
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignora mensagens de outra janela', () => {
    const runner = setup();
    const handler = vi.fn();
    runner.onMessage(handler);
    fromIframe({ __pg: true, type: 'log', args: ['x'] }, window);
    expect(handler).not.toHaveBeenCalled();
  });

  it('o unsubscribe remove o handler', () => {
    const runner = setup();
    const handler = vi.fn();
    const off = runner.onMessage(handler);
    off();
    fromIframe({ __pg: true, type: 'log', args: [] });
    expect(handler).not.toHaveBeenCalled();
  });
});
