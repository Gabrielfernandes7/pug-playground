// O pacote pug não publica tipos. Declaramos só a superfície que o projeto usa.
declare module 'pug' {
  export function render(template: string, options?: Record<string, unknown>): string;
  const pug: { render: typeof render };
  export default pug;
}
