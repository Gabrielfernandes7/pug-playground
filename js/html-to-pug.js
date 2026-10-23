window.PUG = window.PUG || {};

// Literal JS entre aspas: o Pug lê atributos e `=` como expressões.
// U+2028/U+2029 são válidos em JSON, mas quebram literais JS antigos.
PUG.pugString = (s) => JSON.stringify(s).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const PUG_NAME = /^[A-Za-z_][\w:.-]*$/;
const PUG_IDENT = /^[A-Za-z_][\w-]*$/;

// Espaços colapsados, exceto em <pre> e <textarea>, onde o texto é literal
function textOf(node) {
    return node.parentNode.closest('pre, textarea') ? node.data : node.data.replace(/\s+/g, ' ');
}

// #{ e #[ em texto puro viram interpolação no Pug
const escapeInterpolation = (s) => s.replace(/#(?=[{[])/g, '\\#');

function elementHeader(el) {
    const skip = [];
    let shorthand = '';
    const id = el.getAttribute('id');
    if (id && PUG_IDENT.test(id)) { shorthand += '#' + id; skip.push('id'); }
    const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    if (classes.length && classes.every(c => PUG_IDENT.test(c))) {
        shorthand += classes.map(c => '.' + c).join('');
        skip.push('class');
    }

    const attrs = [];
    for (const attr of el.attributes) {
        if (skip.includes(attr.name)) continue;
        const key = PUG_NAME.test(attr.name) ? attr.name : PUG.pugString(attr.name);
        // Atributo sem valor vira booleano no Pug (input(disabled))
        attrs.push(attr.value === '' ? key : `${key}=${PUG.pugString(attr.value)}`);
    }
    return el.localName + shorthand + (attrs.length ? `(${attrs.join(' ')})` : '');
}

function emitComment(data, pad, out) {
    const lines = data.trim().split('\n');
    if (lines.length === 1) return out.push(`${pad}// ${lines[0]}`);
    out.push(`${pad}//`);
    lines.forEach(line => out.push(line.trim() ? `${pad}  ${line}` : ''));
}

function emitElement(el, depth, out) {
    const pad = '  '.repeat(depth);
    const head = pad + elementHeader(el);

    // script e style: conteúdo bruto num bloco com ponto (`script.`)
    if (el.localName === 'script' || el.localName === 'style') {
        const raw = el.textContent.replace(/\s+$/, '');
        if (!raw.trim()) return out.push(head);
        out.push(`${head}.`);
        raw.split('\n').forEach(line => out.push(line.trim() ? pad + '  ' + escapeInterpolation(line) : ''));
        return;
    }

    const keepWhitespace = el.localName === 'pre' || el.localName === 'textarea';
    const kids = Array.from(el.childNodes).filter(n =>
        n.nodeType !== Node.TEXT_NODE || keepWhitespace || n.data.trim() !== '');

    if (!kids.length) return out.push(head);
    if (kids.length === 1 && kids[0].nodeType === Node.TEXT_NODE) {
        return out.push(`${head}= ${PUG.pugString(textOf(kids[0]))}`);
    }
    out.push(head);
    kids.forEach(kid => emitNode(kid, depth + 1, out));
}

function emitNode(node, depth, out) {
    const pad = '  '.repeat(depth);
    if (node.nodeType === Node.ELEMENT_NODE) return emitElement(node, depth, out);
    if (node.nodeType === Node.COMMENT_NODE) return emitComment(node.data, pad, out);
    if (node.nodeType === Node.TEXT_NODE && node.data.trim()) {
        out.push(`${pad}= ${PUG.pugString(textOf(node))}`);
    }
}

// Converte HTML em Pug. O DOMParser não executa scripts nem carrega recursos.
PUG.htmlToPug = function(html) {
    const source = String(html);
    if (!source.trim()) return '';

    const isDocument = /<html[\s>]/i.test(source) || /<!doctype/i.test(source);
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const out = [];

    if (isDocument) {
        if (doc.doctype) out.push('doctype ' + doc.doctype.name);
        emitElement(doc.documentElement, 0, out);
    } else {
        // Fragmento: estilos e metas caem no <head> do parser, então eles vêm primeiro
        [...doc.head.childNodes, ...doc.body.childNodes]
            .filter(n => n.nodeType !== Node.TEXT_NODE || n.data.trim())
            .forEach(node => emitNode(node, 0, out));
    }
    return out.join('\n') + '\n';
};
