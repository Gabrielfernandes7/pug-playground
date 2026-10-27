// Literal JS entre aspas: o Pug lê atributos e `=` como expressões.
// U+2028/U+2029 são válidos em JSON, mas quebram literais JS antigos.
export const pugString = (s: string): string =>
  JSON.stringify(s).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
