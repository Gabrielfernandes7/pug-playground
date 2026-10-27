import { pugString } from './pugString';
import type { IHtmlConverter } from './types';

const PUG_NAME = /^[A-Za-z_][\w:.-]*$/;
const PUG_IDENT = /^[A-Za-z_][\w-]*$/;

// #{ e #[ em texto puro viram interpolação no Pug
const escapeInterpolation = (s: string): string => s.replace(/#(?=[{[])/g, '\\#');

// Espaços colapsados, exceto em <pre> e <textarea>, onde o texto é literal
function textOf(node: Text): string {
  const inPreformatted = node.parentElement?.closest('pre, textarea') != null;
  return inPreformatted ? node.data : node.data.replace(/\s+/g, ' ');
}

function elementHeader(el: Element): string {
  const skip: string[] = [];
  let shorthand = '';
  const id = el.getAttribute('id');
  if (id && PUG_IDENT.test(id)) {
    shorthand += '#' + id;
    skip.push('id');
  }
  const classes = (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
  if (classes.length && classes.every(c => PUG_IDENT.test(c))) {
    shorthand += classes.map(c => '.' + c).join('');
    skip.push('class');
  }

  const attrs: string[] = [];
  for (const attr of Array.from(el.attributes)) {
    if (skip.includes(attr.name)) continue;
    const key = PUG_NAME.test(attr.name) ? attr.name : pugString(attr.name);
    // Atributo sem valor vira booleano no Pug (input(disabled))
    attrs.push(attr.value === '' ? key : `${key}=${pugString(attr.value)}`);
  }
  return el.localName + shorthand + (attrs.length ? `(${attrs.join(' ')})` : '');
}

function emitComment(data: string, pad: string, out: string[]): void {
  const lines = data.trim().split('\n');
  if (lines.length === 1) {
    out.push(`${pad}// ${lines[0]}`);
    return;
  }
  out.push(`${pad}//`);
  lines.forEach(line => out.push(line.trim() ? `${pad}  ${line}` : ''));
}

function emitElement(el: Element, depth: number, out: string[]): void {
  const pad = '  '.repeat(depth);
  const head = pad + elementHeader(el);

  // script e style: conteúdo bruto num bloco com ponto (`script.`)
  if (el.localName === 'script' || el.localName === 'style') {
    const raw = (el.textContent ?? '').replace(/\s+$/, '');
    if (!raw.trim()) {
      out.push(head);
      return;
    }
    out.push(`${head}.`);
    raw.split('\n').forEach(line => out.push(line.trim() ? pad + '  ' + escapeInterpolation(line) : ''));
    return;
  }

  const keepWhitespace = el.localName === 'pre' || el.localName === 'textarea';
  const kids = Array.from(el.childNodes).filter(n =>
    n.nodeType !== Node.TEXT_NODE || keepWhitespace || (n as Text).data.trim() !== '');

  if (!kids.length) {
    out.push(head);
    return;
  }
  const only = kids[0];
  if (kids.length === 1 && only?.nodeType === Node.TEXT_NODE) {
    out.push(`${head}= ${pugString(textOf(only as Text))}`);
    return;
  }
  out.push(head);
  kids.forEach(kid => emitNode(kid, depth + 1, out));
}

function emitNode(node: ChildNode, depth: number, out: string[]): void {
  const pad = '  '.repeat(depth);
  if (node.nodeType === Node.ELEMENT_NODE) {
    emitElement(node as Element, depth, out);
  } else if (node.nodeType === Node.COMMENT_NODE) {
    emitComment((node as Comment).data, pad, out);
  } else if (node.nodeType === Node.TEXT_NODE && (node as Text).data.trim()) {
    out.push(`${pad}= ${pugString(textOf(node as Text))}`);
  }
}

// Converte HTML em Pug. O DOMParser não executa scripts nem carrega recursos.
export class HtmlToPugConverter implements IHtmlConverter {
  convert(html: string): string {
    const source = String(html);
    if (!source.trim()) return '';

    const isDocument = /<html[\s>]/i.test(source) || /<!doctype/i.test(source);
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const out: string[] = [];

    if (isDocument) {
      if (doc.doctype) out.push('doctype ' + doc.doctype.name);
      emitElement(doc.documentElement, 0, out);
    } else {
      // Fragmento: estilos e metas caem no <head> do parser, então eles vêm primeiro
      [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)]
        .filter(n => n.nodeType !== Node.TEXT_NODE || (n as Text).data.trim())
        .forEach(node => emitNode(node, 0, out));
    }
    return out.join('\n') + '\n';
  }
}
