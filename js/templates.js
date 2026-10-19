window.PUG = window.PUG || {};

PUG.TEMPLATES = {
    cheatsheet: {
    name: 'Pug Cheatsheet',
    description: 'Referência completa — tags, atributos, JS, loops, condicionais, includes e mixins',
    icon: 'fa-book',
    pug: `-
  const sections = [
    {
      id: 'comentarios',
      icon: 'fa-comment-slash',
      title: 'Comentários',
      note: null,
      items: [
        { title: 'Uma linha', code: '//- Comentário', output: '(não renderiza)' },
        { title: 'Várias linhas', code: '//-\\n  Comentário\\n  em várias linhas', output: '(não renderiza)' }
      ]
    },
    {
      id: 'tags',
      icon: 'fa-code',
      title: 'Tags',
      note: null,
      items: [
        { title: 'Básico', code: 'div\\nh1\\nminha-tag', output: '<div></div>\\n<h1></h1>\\n<minha-tag></minha-tag>' },
        { title: 'Irmãs', code: 'div\\ndiv', output: '<div></div>\\n<div></div>' },
        { title: 'Aninhadas', code: 'div\\n  div', output: '<div>\\n  <div></div>\\n</div>' },
        { title: 'Texto', code: 'h1 Olá, pessoas', output: '<h1>Olá, pessoas</h1>' },
        { title: 'Texto multi-linha', code: 'div.\\n  Oi,\\n  tudo bem?', output: '<div>Oi, tudo bem?</div>' }
      ]
    },
    {
      id: 'atributos',
      icon: 'fa-tag',
      title: 'Atributos',
      note: null,
      items: [
        { title: 'Múltiplos', code: 'div(class="minha" id="meu" enabled)', output: '<div class="minha" id="meu" enabled></div>' },
        { title: 'Classe abreviada', code: 'span.minha-class', output: '<span class="minha-class"></span>' },
        { title: 'ID abreviado', code: 'div#meu-id', output: '<div id="meu-id"></div>' },
        { title: 'Classe + ID', code: 'div#meu-id.minha-class', output: '<div class="minha-class" id="meu-id"></div>' }
      ]
    },
    {
      id: 'javascript',
      icon: 'fa-js',
      title: 'JavaScript',
      note: null,
      items: [
        { title: 'Variável', code: '- const lang = "pug"', output: '(variável definida)' },
        { title: 'Multi-linha', code: '-\\n  const lang = "pug"\\n  const ok = true', output: '(variáveis definidas)' },
        { title: 'Classes dinâmicas', code: '- const c = ["a","b","c"]\\ndiv(class=c)', output: '<div class="a b c"></div>' },
        { title: 'Atributos dinâmicos', code: '- const a = {src:"p.png", alt:"Foto"}\\nimg&attributes(a)', output: '<img src="p.png" alt="Foto">' },
        { title: 'Atributo booleano', code: '- let off = false\\ninput(disabled=off)\\n- off = true\\ninput(disabled=off)', output: '<input>\\n<input disabled>' },
        { title: 'Interpolação', code: '- const n = "Bob"\\nh1 Olá, #{n}', output: '<h1>Olá, Bob</h1>' },
        { title: 'Buffered', code: '- const n = "Bob"\\nh1= n', output: '<h1>Bob</h1>' }
      ]
    },
    {
      id: 'loops',
      icon: 'fa-repeat',
      title: 'Loops',
      note: "'each' e 'for' são equivalentes — use 'each'.",
      items: [
        { title: 'each', code: 'each v in [1,2,3]\\n  p= v', output: '<p>1</p>\\n<p>2</p>\\n<p>3</p>' },
        { title: 'each com índice', code: 'each v, i in [1,2,3]\\n  p= v + "-" + i', output: '<p>1-0</p>\\n<p>2-1</p>\\n<p>3-2</p>' },
        { title: 'each com else', code: 'each v in []\\n  p= v\\nelse\\n  p Sem valores', output: '<p>Sem valores</p>' }
      ]
    },
    {
      id: 'condicionais',
      icon: 'fa-code-branch',
      title: 'Condicionais',
      note: null,
      items: [
        { title: 'if / else if / else', code: '- const n = 5\\nif n < 5\\n  p menor\\nelse if n > 5\\n  p maior\\nelse\\n  p igual', output: '<p>igual</p>' },
        { title: 'case / when', code: '- const s = "Aguardando"\\ncase s\\n  when "Aguardando"\\n    p.warn Em espera\\n  when "Completado"\\n    p.success Completado\\n  default\\n    p Erro', output: '<p class="warn">Em espera</p>' }
      ]
    },
    {
      id: 'includes',
      icon: 'fa-file-import',
      title: 'Includes',
      note: 'No playground não há sistema de arquivos — use as abas styles.css e script.js.',
      items: [
        { title: 'Partial Pug', code: 'html\\n  body\\n    include includes/nav.pug', output: '(conteúdo do arquivo é injetado)' },
        { title: 'JS e CSS', code: 'script\\n  include scripts/index.js\\nstyle\\n  include styles/theme.css', output: '(conteúdo injetado inline)' }
      ]
    },
    {
      id: 'mixins',
      icon: 'fa-cubes',
      title: 'Mixins',
      note: null,
      items: [
        { title: 'Básico', code: 'mixin basic\\n  div Olá\\n+basic', output: '<div>Olá</div>' },
        { title: 'Com argumentos', code: 'mixin comment(nome, txt)\\n  div\\n    span= nome\\n    div= txt\\n+comment("Gil", "Top")', output: '<div><span>Gil</span><div>Top</div></div>' }
      ]
    }
  ]

doctype html
html(lang="pt-BR")
  head
    meta(charset="UTF-8")
    meta(name="viewport" content="width=device-width, initial-scale=1.0")
    title Pug Cheatsheet
  body
    .container
      header.doc-header
        h1 Pug Cheatsheet
        p.subtitle Referência rápida de sintaxe — v3
      nav.nav
        each s in sections
          a(href="#" + s.id)= s.title
      each section in sections
        section.section(id=section.id)
          h2.section-title
            i(class="fas " + section.icon)
            = section.title
          if section.note
            .section-note= section.note
          each ex in section.items
            .example
              .example-title= ex.title
              .example-body
                .pane.code
                  pre
                    code= ex.code
                .pane.output
                  pre
                    code= ex.output
      footer.doc-footer
        p Documentação oficial em
          a(href="https://pugjs.org/api/getting-started.html" target="_blank" rel="noopener")  pugjs.org`,
    css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #faf6ef;
  color: #2a221c;
  line-height: 1.6;
  padding: 40px 24px 60px;
}
.container { max-width: 1000px; margin: 0 auto; }

.doc-header {
  text-align: center;
  padding-bottom: 28px;
  border-bottom: 2px solid #b35a1f;
  margin-bottom: 20px;
}
.doc-header h1 {
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: 44px;
  line-height: 1.1;
  color: #1c1713;
  letter-spacing: -0.02em;
}
.doc-header .subtitle {
  color: #998878;
  margin-top: 10px;
  font-size: 15px;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 20px 0 32px;
  border-bottom: 1px solid #e8dfd2;
  margin-bottom: 48px;
}
.nav a {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #e8dfd2;
  border-radius: 999px;
  color: #6b5a4c;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all .15s;
}
.nav a:hover {
  background: #b35a1f;
  color: #fff;
  border-color: #b35a1f;
}

.section { margin-bottom: 56px; scroll-margin-top: 24px; }
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: 26px;
  color: #4e342e;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8dfd2;
}
.section-title i { color: #b35a1f; font-size: 20px; }
.section-note {
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #f3ecdf;
  border-left: 3px solid #f0a050;
  border-radius: 6px;
  font-size: 13px;
  color: #6b5a4c;
}

.example {
  background: #fff;
  border: 1px solid #e8dfd2;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: box-shadow .15s;
}
.example:hover { box-shadow: 0 4px 16px rgba(139,90,60,.08); }
.example-title {
  padding: 10px 16px;
  background: #faf6ef;
  border-bottom: 1px solid #e8dfd2;
  font-size: 12px;
  font-weight: 700;
  color: #8b5a3c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.example-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 720px) {
  .example-body { grid-template-columns: 1fr; }
}
.pane { padding: 14px 16px; overflow-x: auto; }
.pane pre {
  margin: 0;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre;
  tab-size: 2;
}
.pane.code { background: #fff; }
.pane.code pre { color: #2a221c; }
.pane.output {
  background: #faf6ef;
  border-left: 1px solid #e8dfd2;
}
@media (max-width: 720px) {
  .pane.output { border-left: 0; border-top: 1px solid #e8dfd2; }
}
.pane.output pre {
  color: #4a7c20;
  font-style: italic;
}

.doc-footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid #e8dfd2;
  text-align: center;
  font-size: 13px;
  color: #998878;
}
.doc-footer a {
  color: #b35a1f;
  text-decoration: none;
  font-weight: 600;
}
.doc-footer a:hover { text-decoration: underline; }`,
    js: `// Cheatsheet é puramente documentação — sem interatividade.
// Os exemplos são strings, não código executável.
console.log('Pug Cheatsheet carregado');`,
},
    landing: {
        name: 'Landing page',
        description: 'Site de marketing com hero, features e footer',
        icon: 'fa-rocket',
        pug: `-
  const features = [
    { title: 'Indentação', desc: 'Sem tags de fechamento. A hierarquia é o próprio código.' },
    { title: 'Reutilizável', desc: 'Mixins, variáveis e includes para evitar repetição.' },
    { title: 'Rápido', desc: 'Compila para HTML limpo e leve. Ideal para qualquer stack.' }
  ]

doctype html
html(lang="pt-BR")
  head
    meta(charset="UTF-8")
    meta(name="viewport" content="width=device-width, initial-scale=1.0")
    title Meu Site
  body
    header.site-header
      .container
        a.brand(href="#")
          span.brand-icon P
          | PugSite
        nav.site-nav
          a(href="#") Início
          a(href="#") Recursos
          a(href="#") Contato
    main
      section.hero
        .container
          span.badge Novo · v1.0
          h1 Um site simples
            br
            span.highlight escrito em Pug.
          p.lead Pug é uma linguagem de template para HTML que usa indentação e abreviações.
          .actions
            a.btn.btn-primary(href="#") Começar agora
            a.btn.btn-ghost(href="#") Saber mais
      section.features
        .container
          .grid
            each feat in features
              .card
                .card-icon ✓
                h3= feat.title
                p= feat.desc
    footer.site-footer
      .container
        p Feito com ❤ em Pug · #{new Date().getFullYear()}`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; color: #2a221c; background: #faf6ef; line-height: 1.6; }
.container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
.site-header { padding: 20px 0; border-bottom: 1px solid #e8dfd2; }
.site-header .container { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 20px; color: inherit; text-decoration: none; }
.brand-icon { width: 32px; height: 32px; border-radius: 8px; background: #8b5a3c; color: #fff; display: flex; align-items: center; justify-content: center; }
.site-nav { display: flex; gap: 24px; font-size: 14px; }
.site-nav a { color: #6b5a4c; text-decoration: none; }
.site-nav a:hover { color: #b35a1f; }
.hero { text-align: center; padding: 80px 0; }
.badge { display: inline-block; padding: 4px 12px; background: #f3ecdf; color: #8b5a3c; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
h1 { font-size: 48px; line-height: 1.1; color: #1c1713; }
.highlight { color: #b35a1f; }
.lead { font-size: 18px; color: #6b5a4c; max-width: 560px; margin: 20px auto 0; }
.actions { display: flex; gap: 12px; justify-content: center; margin-top: 32px; flex-wrap: wrap; }
.btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; }
.btn-primary { background: #b35a1f; color: #fff; }
.btn-primary:hover { background: #8b4515; }
.btn-ghost { background: #fff; color: #6b5a4c; border: 1px solid #e8dfd2; }
.btn-ghost:hover { background: #f3ecdf; }
.features { padding: 40px 0 80px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.card { background: #fff; border: 1px solid #e8dfd2; border-radius: 16px; padding: 24px; }
.card-icon { width: 40px; height: 40px; border-radius: 10px; background: #f3ecdf; color: #b35a1f; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; margin-bottom: 12px; }
.card h3 { font-size: 16px; margin-bottom: 6px; }
.card p { font-size: 14px; color: #6b5a4c; }
.site-footer { padding: 24px 0; border-top: 1px solid #e8dfd2; text-align: center; font-size: 13px; color: #998878; }`,
        js: `document.querySelectorAll('a[href="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Link clicado:', a.textContent.trim());
  });
});`,
    },
    brandbook: {
        name: 'Brand book',
        description: 'Paleta, tipografia e componentes',
        icon: 'fa-palette',
        pug: `-
  const palette = [
    { name: 'Terracotta', hex: '#b35a1f' },
    { name: 'Bege', hex: '#ffe0b2' },
    { name: 'Marrom', hex: '#4e342e' },
    { name: 'Creme', hex: '#faf6ef' },
    { name: 'Âmbar', hex: '#f0a050' }
  ]

doctype html
html(lang="pt-BR")
  head
    meta(charset="UTF-8")
    title Brand Book
  body
    .container
      header.brand-header
        h1 Brand Book
        p Manual de identidade visual
      section
        h2 Cores
        .palette
          each color in palette
            .swatch
              .swatch-color(style="background:" + color.hex)
              .swatch-info
                strong= color.name
                code= color.hex
      section
        h2 Tipografia
        .type-scale
          .type-row
            span.type-label H1
            span.type-sample(style="font-size:48px;font-weight:700") Heading 1
          .type-row
            span.type-label H2
            span.type-sample(style="font-size:32px;font-weight:600") Heading 2
          .type-row
            span.type-label Body
            span.type-sample(style="font-size:16px") Corpo de texto para leitura.
          .type-row
            span.type-label Small
            span.type-sample(style="font-size:12px") Legendas e notas de rodapé.
      section
        h2 Componentes
        .components
          button.btn.btn-primary Botão primário
          button.btn.btn-ghost Botão secundário
          span.badge Badge exemplo
          input.input(type="text" placeholder="Campo de input")`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #faf6ef; color: #2a221c; }
.container { max-width: 800px; margin: 0 auto; padding: 48px 24px; }
.brand-header { border-bottom: 2px solid #b35a1f; padding-bottom: 24px; margin-bottom: 40px; }
h1 { font-size: 40px; color: #4e342e; }
.brand-header p { color: #998878; margin-top: 8px; }
section { margin-bottom: 48px; }
h2 { color: #4e342e; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px; font-weight: 700; }
.palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.swatch { background: #fff; border: 1px solid #e8dfd2; border-radius: 12px; overflow: hidden; }
.swatch-color { height: 80px; }
.swatch-info { padding: 10px 12px; }
.swatch-info strong { display: block; font-size: 13px; }
.swatch-info code { font-size: 11px; color: #998878; }
.type-row { display: flex; align-items: baseline; gap: 24px; padding: 12px 0; border-bottom: 1px solid #e8dfd2; }
.type-label { font-size: 11px; color: #998878; font-family: monospace; min-width: 40px; }
.components { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: 0; cursor: pointer; font-family: inherit; }
.btn-primary { background: #b35a1f; color: #fff; }
.btn-ghost { background: #fff; color: #6b5a4c; border: 1px solid #e8dfd2; }
.badge { padding: 4px 10px; background: #f3ecdf; color: #8b5a3c; border-radius: 999px; font-size: 12px; font-weight: 600; }
.input { padding: 10px 14px; border: 1px solid #e8dfd2; border-radius: 8px; font-family: inherit; font-size: 14px; }`,
        js: ``,
    },
    blog: {
        name: 'Blog post',
        description: 'Artigo com header, conteúdo e autor',
        icon: 'fa-newspaper',
        pug: `doctype html
html(lang="pt-BR")
  head
    meta(charset="UTF-8")
    meta(name="viewport" content="width=device-width, initial-scale=1.0")
    title Artigo — Blog
  body
    article.post
      header.post-header
        span.post-category Tecnologia
        h1 Como começar com Pug
        p.post-subtitle Um guia rápido para a linguagem de templates que simplifica seu HTML.
        .post-meta
          .author
            .avatar AC
            div
              strong Ana Costa
              time 18 de outubro de 2026 · 5 min de leitura
      .post-body
        p Pug é uma linguagem de template para HTML que usa indentação para definir hierarquia. Em vez de escrever tags de fechamento, você aninha elementos.
        h2 Por que usar Pug?
        ul
          li Menos digitação — sem tags de fechamento
          li Código mais limpo e legível
          li Suporte a mixins, variáveis e includes
          li Compila para HTML puro
        h2 Exemplo básico
        pre
          code.
            div.container
              h1 Olá, mundo
              p Este é um parágrafo.
        p O código acima gera um &lt;div&gt; com a classe "container", contendo um título e um parágrafo.
        blockquote
          | "Pug torna o HTML legível de novo."
        p Se você trabalha com mockups gerados por IA, o Pug é especialmente útil: o código vem estruturado e é fácil de ajustar.
    footer.post-footer
      p Publicado em 2026 · Blog Exemplo`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Georgia, 'Times New Roman', serif; background: #faf6ef; color: #2a221c; line-height: 1.7; }
.post { max-width: 680px; margin: 0 auto; padding: 60px 24px; }
.post-header { margin-bottom: 40px; }
.post-category { display: inline-block; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #b35a1f; margin-bottom: 12px; }
h1 { font-size: 42px; line-height: 1.15; color: #1c1713; margin-bottom: 12px; }
.post-subtitle { font-size: 20px; color: #6b5a4c; margin-bottom: 24px; font-style: italic; }
.post-meta { display: flex; align-items: center; gap: 12px; font-family: system-ui, sans-serif; font-size: 13px; color: #998878; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #b35a1f; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.post-meta strong { display: block; color: #2a221c; font-size: 14px; }
.post-body { font-size: 18px; }
.post-body p { margin-bottom: 20px; }
h2 { font-family: system-ui, sans-serif; font-size: 26px; margin: 40px 0 16px; color: #1c1713; }
ul, ol { margin: 0 0 20px 28px; }
li { margin-bottom: 8px; }
pre { background: #1c1713; color: #f5e8d5; padding: 20px; border-radius: 10px; overflow-x: auto; margin: 20px 0; font-size: 14px; }
code { font-family: 'JetBrains Mono', Consolas, monospace; }
p code { background: #f3ecdf; padding: 2px 6px; border-radius: 4px; font-size: 16px; }
blockquote { border-left: 3px solid #b35a1f; padding-left: 20px; font-style: italic; font-size: 22px; color: #6b5a4c; margin: 30px 0; }
.post-footer { max-width: 680px; margin: 40px auto; padding: 24px; border-top: 1px solid #e8dfd2; font-size: 13px; color: #998878; text-align: center; font-family: system-ui, sans-serif; }`,
        js: ``,
    },
    blank: {
        name: 'Em branco',
        description: 'Comece do zero com as três abas vazias',
        icon: 'fa-file',
        pug: `doctype html
html(lang="pt-BR")
  head
    meta(charset="UTF-8")
    title Nova página
  body
    h1 Olá, Pug!`,
        css: `body {
  font-family: system-ui, sans-serif;
  padding: 40px;
}`,
        js: `console.log('Pronto!');`,
    },
};
