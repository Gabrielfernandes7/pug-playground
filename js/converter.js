window.PUG = window.PUG || {};

// Diálogo Pug ⇄ HTML. Os editores existem só enquanto o diálogo está aberto:
// toTextArea() no fechamento remove os listeners globais do CodeMirror.
PUG.openConverter = function({ getPug, applyPug }) {
    const { $, toast } = PUG;
    const dialog = $('converter');
    const pugHost = $('converter-pug');
    const htmlHost = $('converter-html');
    let pugCm = null;
    let htmlCm = null;

    function pugToHtml() {
        if (!window.pug) return toast('Pug não carregou: conversão indisponível');
        try {
            htmlCm.setValue(window.pug.render(pugCm.getValue()));
        } catch (err) {
            toast('Erro no Pug: ' + String(err.message || err).split('\n')[0]);
        }
    }

    function htmlToPug() {
        pugCm.setValue(PUG.htmlToPug(htmlCm.getValue()));
    }

    async function copy(cm, label) {
        const text = cm.getValue();
        if (!text.trim()) return toast(`Nada para copiar em ${label}`);
        try {
            await navigator.clipboard.writeText(text);
            toast(`${label} copiado`);
        } catch {
            toast('Não foi possível acessar o clipboard');
        }
    }

    function onKey(e) {
        if (e.key === 'Escape') close();
    }

    function close() {
        if (dialog.hidden) return;
        document.removeEventListener('keydown', onKey);
        pugCm.toTextArea();
        htmlCm.toTextArea();
        pugCm = htmlCm = null;
        pugHost.innerHTML = '';
        htmlHost.innerHTML = '';
        dialog.hidden = true;
    }

    function open() {
        if (!dialog.hidden) return;
        // Mostra antes de criar os editores: o CodeMirror mede o tamanho ao ser criado
        dialog.hidden = false;
        const makeEditor = (host, mode) => {
            const textarea = document.createElement('textarea');
            host.appendChild(textarea);
            return CodeMirror.fromTextArea(textarea, {
                mode, theme: 'pug', lineNumbers: true, lineWrapping: true,
                indentUnit: 2, tabSize: 2,
            });
        };
        pugCm = makeEditor(pugHost, 'pug');
        htmlCm = makeEditor(htmlHost, 'text/html');
        pugCm.setValue(getPug());
        if (pugCm.getValue().trim()) pugToHtml();

        document.addEventListener('keydown', onKey);
        pugCm.focus();
    }

    $('converter-close').onclick = close;
    dialog.onclick = (e) => { if (e.target === dialog) close(); };
    $('converter-to-html').onclick = pugToHtml;
    $('converter-to-pug').onclick = htmlToPug;
    $('converter-copy-pug').onclick = () => copy(pugCm, 'Pug');
    $('converter-copy-html').onclick = () => copy(htmlCm, 'HTML');
    $('converter-apply').onclick = () => {
        if (!pugCm.getValue().trim()) return toast('Nada para aplicar: o Pug está vazio');
        // Só fecha se o editor principal aceitou o código
        if (applyPug(pugCm.getValue()) !== false) close();
    };

    open();
};
