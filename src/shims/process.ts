// O pug espera o `process` do Node (process.env.NODE_ENV, process.cwd() em filtros), e a
// dependência `resolve` lê process.versions.node na importação. No navegador nada disso é usado
// no render, então fornecemos só o mínimo. Importar antes do pug.
if (!('process' in globalThis)) {
  Object.assign(globalThis, {
    process: { env: { NODE_ENV: 'production' }, versions: { node: '22.0.0' }, cwd: () => '/' },
  });
}
