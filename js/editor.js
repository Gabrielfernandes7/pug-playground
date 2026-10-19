window.PUG = window.PUG || {};

if (typeof CodeMirror !== 'undefined') {
    CodeMirror.defineMode('pug', () => {
        const JS_KEYWORDS = /^(const|let|var|function|return|if|else|for|while|new|this|true|false|null|undefined|typeof|instanceof|class|import|export|from|of|in|await|async|yield)\b/;

        function js(stream) {
            if (stream.match(/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'|^`(?:[^`\\]|\\.)*`/)) return 'string';
            if (stream.match(/^\/\/.*/)) { stream.skipToEnd(); return 'comment'; }
            if (stream.match(/^\d+(?:\.\d+)?/)) return 'number';
            if (stream.match(JS_KEYWORDS)) return 'keyword';
            if (stream.match(/^[a-zA-Z_$][\w$]*/)) return 'variable';
            if (stream.match(/^[()\[\]{}]/)) return 'bracket';
            if (stream.match(/^[+\-*/%=<>!&|?:.,;]/)) return 'operator';
            stream.next(); return null;
        }

        return {
            startState: () => ({ jsLine: false, jsIndent: -1 }),
            token(stream, state) {
                if (stream.sol()) {
                    state.jsLine = false;
                    const realIndent = stream.string.search(/\S/);
                    const indent = realIndent === -1 ? stream.string.length : realIndent;
                    if (state.jsIndent >= 0 && indent <= state.jsIndent) state.jsIndent = -1;
                    stream.eatSpace();
                    if (stream.eol()) return null;
                    if (state.jsIndent >= 0) { state.jsLine = true; return js(stream); }
                    if (stream.match('//-') || stream.match('//')) { stream.skipToEnd(); return 'comment'; }
                    if (stream.match(/^doctype\b/i)) { stream.skipToEnd(); return 'keyword'; }
                    if (stream.match(/^else\s+if\b/)) { state.jsLine = true; return 'keyword'; }
                    if (stream.match(/^else\b|^default\b/)) return 'keyword';
                    if (stream.match(/^(each|for|if|unless|while|case|when)\b/)) { state.jsLine = true; return 'keyword'; }
                    if (stream.match(/^(mixin|include|extends|block|append|prepend|yield)\b/)) return 'keyword';
                    if (stream.match(/^\+[\w-]+/)) return 'def';
                    if (stream.match(/^-(?!-)/)) { state.jsIndent = indent; state.jsLine = true; return 'variable-3'; }
                    if (stream.match(/^\|/)) return 'operator';
                    if (stream.match(/^[a-zA-Z][\w-]*/)) return 'tag';
                    if (stream.match(/^[.#][\w-]+/)) return 'atom';
                    if (stream.match(/^&attributes\b/)) return 'def';
                    stream.next(); return null;
                }
                if (state.jsLine) return js(stream);
                if (stream.match(/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/)) return 'string';
                if (stream.match('#{')) {
                    let depth = 1;
                    while (!stream.eol()) {
                        const c = stream.peek();
                        if (c === '}') { stream.next(); if (--depth === 0) break; }
                        else if (c === '{') { stream.next(); depth++; }
                        else stream.next();
                    }
                    return 'bracket';
                }
                if (stream.match(/^!=/)) { state.jsLine = true; return 'operator'; }
                if (stream.match(/^=(?!=)/)) { state.jsLine = true; return 'operator'; }
                if (stream.match(/^[()\[\]{}]/)) return 'bracket';
                if (stream.match(/^[.,:]/)) return 'punctuation';
                if (stream.match(/^[+\-*/<>!&|]/)) return 'operator';
                stream.next(); return null;
            }
        };
    });

    CodeMirror.registerHelper('hint', 'pug', (cm) => {
        const cur = cm.getCursor();
        const line = cm.getLine(cur.line);
        let start = cur.ch, end = cur.ch;
        while (end && /[\w-]/.test(line.charAt(end - 1))) end--;
        const word = line.slice(end, start).toLowerCase();
        const snippets = [
            { text: 'doctype html', displayText: 'doctype html' },
            { text: 'html(lang="pt-BR")', displayText: 'html(lang=...)' },
            { text: 'meta(charset="UTF-8")', displayText: 'meta charset' },
            { text: 'meta(name="viewport" content="width=device-width, initial-scale=1")', displayText: 'meta viewport' },
            { text: 'each item in items', displayText: 'each...' },
            { text: 'if condition', displayText: 'if...' },
            { text: 'else if condition', displayText: 'else if...' },
            { text: 'unless condition', displayText: 'unless...' },
            { text: 'mixin name(arg)\n  //- conteúdo', displayText: 'mixin...' },
            { text: 'include ./partial.pug', displayText: 'include...' },
            { text: 'extends layout', displayText: 'extends...' },
            { text: 'block content', displayText: 'block...' },
            { text: 'a(href="#" class="link") Texto', displayText: 'a link' },
            { text: 'img(src="" alt="")', displayText: 'img...' },
            { text: 'div.container', displayText: 'div.classe' },
            { text: 'section.hero', displayText: 'section.hero' },
            { text: 'button.btn(type="button")', displayText: 'button...' },
            { text: 'script(src="")', displayText: 'script...' },
            { text: 'link(rel="stylesheet" href="")', displayText: 'link css' },
        ];
        return {
            list: snippets.filter(s => !word || s.text.toLowerCase().startsWith(word)),
            from: CodeMirror.Pos(cur.line, end),
            to: CodeMirror.Pos(cur.line, start),
        };
    });
}
