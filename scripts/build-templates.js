// Gera js/templates.js a partir de templates/<id>/{index.pug,styles.css,script.js}
// e templates/index.json. Uso: node scripts/build-templates.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const templatesDir = path.join(root, 'templates');
const outFile = path.join(root, 'js', 'templates.js');

// Escapa o texto para caber num template literal JS, sem alterar o conteúdo.
const literal = (text) =>
    '`' + text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';

const index = JSON.parse(fs.readFileSync(path.join(templatesDir, 'index.json'), 'utf8'));

const entries = index.map(meta => {
    const dir = path.join(templatesDir, meta.id);
    const read = (file) => fs.readFileSync(path.join(dir, file), 'utf8');
    return [
        `    ${meta.id}: {`,
        `        name: ${JSON.stringify(meta.name)},`,
        `        description: ${JSON.stringify(meta.description)},`,
        `        icon: ${JSON.stringify(meta.icon)},`,
        `        pug: ${literal(read('index.pug'))},`,
        `        css: ${literal(read('styles.css'))},`,
        `        js: ${literal(read('script.js'))},`,
        `    },`,
    ].join('\n');
});

const output = [
    '// GERADO por scripts/build-templates.js — não edite à mão.',
    '// Edite os arquivos em templates/ e rode: node scripts/build-templates.js',
    'window.PUG = window.PUG || {};',
    '',
    'PUG.TEMPLATES = {',
    entries.join('\n'),
    '};',
    '',
].join('\n');

fs.writeFileSync(outFile, output);
console.log(`✅ ${index.length} templates → js/templates.js`);
