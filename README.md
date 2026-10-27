# Pug Render

Playground de Pug: edite `index.pug`, `styles.css` e `script.js` e veja o resultado ao vivo. Sem backend.

## Como rodar

```sh
bun install
bun run dev        # servidor de desenvolvimento (Vite)
bun run build      # gera dist/ (é o que o Netlify publica)
bun run test       # testes do core (Vitest)
bun run typecheck  # TypeScript em modo estrito
```

Testado com Bun 1.4.4. O Pug vem empacotado a partir do registro npm; não há mais CDN para ele.

## Estrutura

```
index.html          layout (header, editor, preview, console)
src/
  bridge.ts         ponte temporária: liga o core e as portas ao legado em js/ (window.PUG)
  core/             lógica pura: compiler (PugCompilerService), converter (HtmlToPugConverter), document
  ports/            interfaces: IStorageService, ISandboxRunner, IEditorAdapter
  adapters/         implementações: LocalStorageService, IframeSandboxRunner, CodeMirror5Adapter
  shims/            process mínimo para o pug rodar no navegador
tests/              testes do core e dos adaptadores
css/                tokens (tema claro/escuro), layout, editor, componentes, responsivo
js/                 config, utils, editor, converter, app (legado, em migração)
assets/             logo e ícones
```

## Fluxo

`editor` → `PUG.compileAll(source)` (core) → `sandbox.render(html)` → `iframe.srcdoc`

Essa é a única escrita no iframe, feita pelo `IframeSandboxRunner`. Erros de compilação mantêm o último preview válido e mostram o banner.

## Segurança

O iframe usa `sandbox="allow-scripts allow-popups allow-forms"`. **Não** adicione `allow-same-origin`: com `allow-scripts` ele permitiria que o código do preview escape do sandbox.

## Conteúdo inicial

O playground abre com o conteúdo de `PUG.STARTER`, em `js/config.js`. Para mudar o ponto de partida, edite esse objeto.

## Atalhos

| Atalho | Ação |
|---|---|
| `Ctrl/Cmd+Enter` | Compilar agora |
| `Ctrl/Cmd+S` | Baixar `output.html` |
| `Ctrl/Cmd+Shift+V` | Colar código e renderizar |
| Duplo clique no divisor | Volta para 50/50 |

## Temas do editor

O seletor no cabeçalho troca as cores do editor e do console. Temas escuros (Monokai, Darcula, Dracula, One Dark, Solarized Dark) aparecem só no tema escuro da página, e o claro (GitHub Light) só no claro. "Padrão do tema" usa as cores de `css/tokens.css` nos dois modos. A lista fica em `PUG.EDITOR_THEMES`, em `js/config.js`, com o campo `mode`. A escolha é salva no navegador e volta a valer quando o modo correspondente retorna.

## Conversor Pug ⇄ HTML

O botão **Converter** abre um diálogo com `index.pug` à esquerda e `index.html` à direita.

- **Pug → HTML** usa o mesmo `pug.render` do preview. Como a saída é um HTML completo, ela pode ser colada direto num `index.html`.
- **HTML → Pug** usa `HtmlToPugConverter` (`src/core/converter/`), que roda com `DOMParser` e não executa scripts nem carrega recursos.
- **Usar no editor** substitui o `index.pug` do playground, depois de pedir confirmação.

Os dois editores são criados ao abrir e destruídos ao fechar.

## Responsivo

- **Celular (< 768px):** um painel por vez, com a barra Código | Preview. O Run leva ao preview.
- **Tablet (768–1023px):** layout dividido, com o divisor arrastável por toque.
- **Desktop (≥ 1024px):** layout dividido completo.

As regras ficam em `css/responsive.css`.

## Solução de problemas

- **"Não carregou do CDN" / editor ausente:** o CodeMirror, o Tailwind, o DaisyUI e a Font Awesome ainda vêm de CDN. Libere `cdnjs.cloudflare.com` e `cdn.jsdelivr.net`.
- **"salvar: off":** `localStorage` está bloqueado (por exemplo, modo privado). O aviso de fechar a página continua ativo.
- **Preview em branco:** abra o Console do DevTools no contexto do iframe (seletor de contexto).
- **Algum recurso não carrega ao abrir por `file://`:** sirva a pasta por HTTP (por exemplo, `python3 -m http.server`).

## Roadmap

- **P2:** CSP mínima no documento pai.
- **Fase 3 pendente:** Vue 3 ou modularização do `app.js`, remoção de `js/` e de `window.PUG`, e CDNs substituídos por dependências locais.

## Referência

- Conversor online de Pug para HTML: https://pug.vercel.app
