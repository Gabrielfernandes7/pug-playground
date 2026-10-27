# Pug Render

Playground de Pug: edite `index.pug`, `styles.css` e `script.js` e veja o resultado ao vivo. Sem backend.

## Como rodar

```sh
bun install
bun run dev            # servidor de desenvolvimento (Vite), em http://localhost:5173
bun run build          # gera dist/ (é o que o Netlify publica)
bun run preview        # serve o dist/ gerado
bun run test           # testes (Vitest)
bun run test:coverage  # testes com cobertura do núcleo (meta: 80%)
bun run typecheck      # vue-tsc em modo estrito
```

Testado com Bun 1.4.4. Tudo vem do registro npm: não há mais CDN para o Pug, o CodeMirror, o Tailwind, o DaisyUI ou a Font Awesome.

## Estrutura

```
index.html          casca que monta o app (#app)
public/assets/      logo e ícones das abas (copiados como estão)
src/
  main.ts           cria o app Vue e o Pinia
  App.vue           layout: cabeçalho, editor, divisor, preview, rodapé e diálogo do conversor
  components/       AppHeader, EditorPane, CodeEditor, PreviewPane, ConsolePanel, ConverterModal
  app/              estado e casos de uso: workspace (código, compilação, console),
                    preferences (tema), services (composição), logic (funções puras), editorThemes
  core/             lógica pura, sem navegador: compiler, converter, document
  ports/            interfaces: IStorageService, ISandboxRunner, IEditorAdapter
  adapters/         implementações: LocalStorageService, IframeSandboxRunner, CodeMirror5Adapter
  editor/           CodeMirror local e o modo de syntax do Pug
  shims/            process mínimo para o pug rodar no navegador
  styles/           entrada do CSS (Tailwind, DaisyUI, Font Awesome e os estilos próprios)
css/                tokens (tema claro/escuro), layout, editor, componentes, responsivo
tests/              testes do núcleo, dos adaptadores e da lógica do app
```

## Fluxo

`CodeEditor` → `workspace.setSource` → (debounce) `workspace.compileNow` → `compiler.compile` (núcleo) → `previewHtml` → `IframeSandboxRunner.render` → `iframe.srcdoc`

O Pug é carregado sob demanda: só quando há código para compilar. Erros de compilação mantêm o último preview válido e mostram o banner.

## Segurança

O iframe usa `sandbox="allow-scripts allow-popups allow-forms"`. **Não** adicione `allow-same-origin`: com `allow-scripts` ele permitiria que o código do preview escape do sandbox.

## Conteúdo inicial

As três abas começam vazias. O ponto de partida fica em `STARTER`, em `src/config.ts`.

## Atalhos

| Atalho | Ação |
|---|---|
| `Ctrl/Cmd+Enter` | Compilar agora |
| `Ctrl/Cmd+S` | Baixar `output.html` |
| `Ctrl/Cmd+Shift+V` | Colar código e renderizar |
| Duplo clique no divisor | Volta para 50/50 |

## Temas do editor

O seletor no cabeçalho troca as cores do editor e do console. Temas escuros (Monokai, Darcula, Dracula, One Dark, Solarized Dark) aparecem só no tema escuro da página, e o claro (GitHub Light) só no claro. "Padrão do tema" usa as cores de `css/tokens.css` nos dois modos. A lista fica em `src/app/editorThemes.ts`, com o campo `mode`. A escolha é salva no navegador e volta a valer quando o modo correspondente retorna.

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

- **Editor ou estilos não aparecem:** verifique se o build foi feito (`bun run build`) e se o servidor está servindo `dist/`.
- **"Falha ao inicializar":** o Pug não carregou (normalmente um chunk que não baixou). Recarregue a página.
- **"salvar: off":** `localStorage` está bloqueado (por exemplo, modo privado). O aviso de fechar a página continua ativo.
- **Preview em branco:** abra o Console do DevTools no contexto do iframe (seletor de contexto).

## Mudanças da Fase 3

- Links antigos com `#code=` (compartilhamento por URL comprimida) não são mais lidos. Esse recurso dependia do lz-string, que foi removido.
- Os CDNs de CodeMirror, Tailwind, DaisyUI e Font Awesome viraram dependências locais.

## Referência

- Conversor online de Pug para HTML: https://pug.vercel.app
