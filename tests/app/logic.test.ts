import { describe, expect, it } from 'vitest';
import {
  cmVar, editorThemesFor, emptyStateDoc, errorStateDoc, fileForName, isBlank,
  parseErrorLine, parseSaved, resolveEditorTheme, serialize, tooLarge,
} from '../../src/app/logic';
import { EDITOR_THEMES } from '../../src/app/editorThemes';

describe('isBlank', () => {
  it('é verdadeiro só quando as três abas estão vazias ou com espaços', () => {
    expect(isBlank({ pug: '  ', css: '', js: '\n' })).toBe(true);
    expect(isBlank({ pug: '', css: 'a{}', js: '' })).toBe(false);
  });
});

describe('parseErrorLine', () => {
  it('lê a linha 1-based da mensagem e devolve 0-based', () => {
    expect(parseErrorLine('Unexpected token (3:5)')).toBe(2);
    expect(parseErrorLine('linha 1:1 falhou')).toBe(0);
  });

  it('devolve null quando não há linha ou a linha é inválida', () => {
    expect(parseErrorLine('sem posição')).toBeNull();
    expect(parseErrorLine('erro 0:0')).toBeNull();
  });
});

describe('parseSaved', () => {
  it('lê o formato atual com as três abas', () => {
    expect(parseSaved(JSON.stringify({ pug: 'p', css: 'c', js: 'j' }))).toEqual({ pug: 'p', css: 'c', js: 'j' });
  });

  it('aceita o formato antigo em que só o Pug era salvo como string', () => {
    expect(parseSaved(JSON.stringify('h1 antigo'))).toEqual({ pug: 'h1 antigo' });
  });

  it('ignora campos com tipo errado e dados corrompidos', () => {
    expect(parseSaved(JSON.stringify({ pug: 1, css: 'ok' }))).toEqual({ pug: undefined, css: 'ok', js: undefined });
    expect(parseSaved('{não é json')).toEqual({});
    expect(parseSaved(null)).toEqual({});
  });

  it('serialize e parseSaved são inversos', () => {
    const sources = { pug: 'a', css: 'b', js: 'c' };
    expect(parseSaved(serialize(sources))).toEqual(sources);
  });
});

describe('temas do editor', () => {
  it('no modo escuro não oferece tema claro, e no claro não oferece escuro', () => {
    const dark = editorThemesFor(EDITOR_THEMES, 'dark').map(t => t.id);
    const light = editorThemesFor(EDITOR_THEMES, 'light').map(t => t.id);
    expect(dark).toContain('monokai');
    expect(dark).not.toContain('github-light');
    expect(light).toContain('github-light');
    expect(light).not.toContain('monokai');
  });

  it('uma escolha que não cabe no modo atual volta a auto, sem apagar a escolha salva', () => {
    const light = editorThemesFor(EDITOR_THEMES, 'light');
    expect(resolveEditorTheme('monokai', light)).toBe('auto');
    expect(resolveEditorTheme('github-light', light)).toBe('github-light');
  });
});

describe('cmVar', () => {
  it('converte a chave camelCase na variável CSS do editor', () => {
    expect(cmVar('lineNum')).toBe('--cm-line-num');
    expect(cmVar('bg')).toBe('--cm-bg');
  });
});

describe('fileForName', () => {
  it('mapeia extensões para a aba certa', () => {
    expect(fileForName('index.pug')).toBe('pug');
    expect(fileForName('template.JADE')).toBe('pug');
    expect(fileForName('style.css')).toBe('css');
    expect(fileForName('script.js')).toBe('js');
    expect(fileForName('foto.png')).toBeNull();
    expect(fileForName('semextensao')).toBeNull();
  });
});

describe('tooLarge', () => {
  it('usa o limite de importação', () => {
    expect(tooLarge(2 * 1024 * 1024 + 1)).toBe(true);
    expect(tooLarge(2 * 1024 * 1024)).toBe(false);
  });
});

describe('telas de estado do preview', () => {
  it('são documentos HTML completos com a mensagem certa', () => {
    expect(emptyStateDoc()).toContain('Comece a digitar Pug');
    expect(errorStateDoc()).toContain('Corrija o erro acima');
    expect(emptyStateDoc().startsWith('<!DOCTYPE html>')).toBe(true);
  });
});
