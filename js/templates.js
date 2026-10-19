// GERADO por scripts/build-templates.js — não edite à mão.
// Edite os arquivos em templates/ e rode: node scripts/build-templates.js
window.PUG = window.PUG || {};

PUG.TEMPLATES = {
    cheatsheet: {
        name: "Pug Cheatsheet",
        description: "Referência rápida de sintaxe",
        icon: "fa-book",
        pug: `doctype html
html(lang="pt-BR")
  head
    meta(charset="UTF-8")
    meta(name="viewport" content="width=device-width, initial-scale=1.0")
    title Pug Cheatsheet
  body
    header
      h1 Pug Cheatsheet
      p Referência rápida de sintaxe

    section
      h2 Comentários
      pre
        code.
          //- Comentário de uma linha

    section
      h2 Tags
      .row
        pre
          code.
            div
            h1
            minha-tag
            .classe
            #id
            div.classe#id
        pre
          code.
            &lt;div&gt;&lt;/div&gt;
            &lt;h1&gt;&lt;/h1&gt;
            &lt;minha-tag&gt;&lt;/minha-tag&gt;
            &lt;div class="classe"&gt;&lt;/div&gt;
            &lt;div id="id"&gt;&lt;/div&gt;
            &lt;div class="classe" id="id"&gt;&lt;/div&gt;

    section
      h2 Atributos
      .row
        pre
          code.
            div(class="foo" id="bar")
            a(href="#" target="_blank") Link
            img(src="foto.png" alt="Foto")
            input(disabled)
        pre
          code.
            &lt;div class="foo" id="bar"&gt;&lt;/div&gt;
            &lt;a href="#" target="_blank"&gt;Link&lt;/a&gt;
            &lt;img src="foto.png" alt="Foto"&gt;
            &lt;input disabled&gt;

    section
      h2 JavaScript
      .row
        pre
          code.
            - const nome = "Bob"
            h1 Olá, #{nome}
            h2= nome
        pre
          code.
            &lt;h1&gt;Olá, Bob&lt;/h1&gt;
            &lt;h2&gt;Bob&lt;/h2&gt;

    section
      h2 Loops
      .row
        pre
          code.
            each v in [1, 2, 3]
              p= v
        pre
          code.
            &lt;p&gt;1&lt;/p&gt;
            &lt;p&gt;2&lt;/p&gt;
            &lt;p&gt;3&lt;/p&gt;

    section
      h2 Condicionais
      .row
        pre
          code.
            if n > 5
              p grande
            else
              p pequeno
        pre
          code.
            &lt;p&gt;pequeno&lt;/p&gt;

    section
      h2 Mixins
      .row
        pre
          code.
            mixin card(t)
              .card= t
            +card("Olá")
        pre
          code.
            &lt;div class="card"&gt;Olá&lt;/div&gt;

    footer
      p Documentação:
        a(href="https://pugjs.org" target="_blank" rel="noopener")  pugjs.org`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #faf6ef;
  color: #2a221c;
  line-height: 1.6;
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}
header {
  padding-bottom: 20px;
  border-bottom: 2px solid #b35a1f;
  margin-bottom: 32px;
}
h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 36px;
  color: #1c1713;
  letter-spacing: -0.02em;
}
header p { color: #998878; margin-top: 6px; font-size: 14px; }
section { margin-bottom: 28px; }
h2 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #b35a1f;
  margin-bottom: 10px;
  font-weight: 700;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #e8dfd2;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
pre {
  margin: 0;
  padding: 14px 16px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
pre:first-child { color: #2a221c; }
pre:last-child {
  background: #faf6ef;
  color: #4a7c20;
  border-left: 1px solid #e8dfd2;
}
footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e8dfd2;
  text-align: center;
  font-size: 13px;
  color: #998878;
}
footer a {
  color: #b35a1f;
  text-decoration: none;
  font-weight: 600;
}
footer a:hover { text-decoration: underline; }
@media (max-width: 600px) {
  .row { grid-template-columns: 1fr; }
  pre:last-child { border-left: 0; border-top: 1px solid #e8dfd2; }
}`,
        js: `console.log('Pug Cheatsheet');`,
    },
    landing: {
        name: "Landing page",
        description: "Site de marketing com hero, features e footer",
        icon: "fa-rocket",
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
        name: "Brand book",
        description: "Paleta, tipografia e componentes",
        icon: "fa-palette",
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
        name: "Blog post",
        description: "Artigo com header, conteúdo e autor",
        icon: "fa-newspaper",
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
        name: "Em branco",
        description: "Comece do zero com as três abas vazias",
        icon: "fa-file",
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
