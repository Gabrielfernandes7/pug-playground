# Pug Render

Playground de Pug: edite `index.pug`, `styles.css` e `script.js` e veja o resultado ao vivo. Sem backend e sem build no runtime.

Abra `index.html` no navegador, ou sirva a pasta com qualquer servidor estático.

## Estrutura

```
index.html          layout (header, editor, preview, console)
css/                tokens (tema claro/escuro), layout, editor, componentes, responsivo
js/                 config (conteúdo e temas), utils, compile, editor, html-to-pug, converter, app (orquestrador)
assets/             logo e ícones
```

## Fluxo

`editor` → `PUG.compileAll(source)` → `updatePreview(html)` → `iframe.srcdoc`

Essa é a única escrita no iframe. Erros de compilação mantêm o último preview válido e mostram o banner.

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

O seletor no cabeçalho troca as cores do editor e do console (Monokai, Darcula, Dracula, One Dark, Solarized Dark, GitHub Light). A lista fica em `PUG.EDITOR_THEMES`, em `js/config.js`. "Padrão do tema" usa as cores de `css/tokens.css`. A escolha é salva no navegador.

## Conversor Pug ⇄ HTML

O botão **Converter** abre um diálogo com `index.pug` à esquerda e `index.html` à direita.

- **Pug → HTML** usa o mesmo `pug.render` do preview. Como a saída é um HTML completo, ela pode ser colada direto num `index.html`.
- **HTML → Pug** usa `PUG.htmlToPug` (`js/html-to-pug.js`), que roda com `DOMParser` e não executa scripts nem carrega recursos.
- **Usar no editor** substitui o `index.pug` do playground, depois de pedir confirmação.

Os dois editores são criados ao abrir e destruídos ao fechar.

## Responsivo

- **Celular (< 768px):** um painel por vez, com a barra Código | Preview. O Run leva ao preview.
- **Tablet (768–1023px):** layout dividido, com o divisor arrastável por toque.
- **Desktop (≥ 1024px):** layout dividido completo.

As regras ficam em `css/responsive.css`.

## Solução de problemas

- **"Carregando…" não termina:** os CDNs do Pug estão bloqueados. Libere `esm.sh`, `cdn.jsdelivr.net`, `unpkg.com`, `cdn.skypack.dev` e `bundle.run`.
- **"salvar: off":** `localStorage` está bloqueado (por exemplo, modo privado). O aviso de fechar a página continua ativo.
- **Preview em branco:** abra o Console do DevTools no contexto do iframe (seletor de contexto).
- **Algum recurso não carrega ao abrir por `file://`:** sirva a pasta por HTTP (por exemplo, `python3 -m http.server`).

## Roadmap

- **P2:** CSP mínima no documento pai.
- **P2:** testes (Vitest) para `compileAll` e `buildFullDoc`.

## Referência

- Conversor online de Pug para HTML: https://pug.vercel.app
