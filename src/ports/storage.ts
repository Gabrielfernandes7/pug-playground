// Porta de persistência local. Nunca lança: em modo privado ou com o armazenamento bloqueado,
// get devolve o fallback e set devolve false.
export interface IStorageService {
  get(key: string, fallback?: string | null): string | null;
  set(key: string, value: string): boolean;
}
