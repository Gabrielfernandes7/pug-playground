import { describe, expect, it } from 'vitest';
import { LocalStorageService } from '../../src/adapters/LocalStorageService';

const memory = (): Storage => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, String(v)); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  } as Storage;
};

describe('LocalStorageService', () => {
  it('lê e grava valores', () => {
    const store = memory();
    const svc = new LocalStorageService(() => store);
    expect(svc.set('k', 'v')).toBe(true);
    expect(svc.get('k')).toBe('v');
  });

  it('devolve o fallback para chave ausente', () => {
    const store = memory();
    const svc = new LocalStorageService(() => store);
    expect(svc.get('ausente', 'padrão')).toBe('padrão');
    expect(svc.get('ausente')).toBeNull();
  });

  it('não lança quando o armazenamento está bloqueado', () => {
    const blocked = () => { throw new DOMException('negado', 'SecurityError'); };
    const svc = new LocalStorageService(blocked);
    expect(svc.get('k', 'fallback')).toBe('fallback');
    expect(svc.set('k', 'v')).toBe(false);
  });

  it('devolve false quando a gravação falha (cota cheia)', () => {
    const full = { ...memory(), setItem: () => { throw new DOMException('cheio', 'QuotaExceededError'); } } as Storage;
    expect(new LocalStorageService(() => full).set('k', 'v')).toBe(false);
  });
});
