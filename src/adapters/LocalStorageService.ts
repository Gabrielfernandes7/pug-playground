import type { IStorageService } from '../ports/storage';

// Acessar window.localStorage pode lançar (cookies bloqueados, modo privado), então o acesso fica dentro do try.
export class LocalStorageService implements IStorageService {
  constructor(private readonly getStorage: () => Storage = () => window.localStorage) {}

  get(key: string, fallback: string | null = null): string | null {
    try {
      const value = this.getStorage().getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  set(key: string, value: string): boolean {
    try {
      this.getStorage().setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}
