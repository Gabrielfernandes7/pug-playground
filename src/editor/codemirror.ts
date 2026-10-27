// CodeMirror 5 local (antes vinha de CDN como global). Os addons se acoplam ao mesmo objeto.
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import { registerPugMode } from './pugMode';

registerPugMode(CodeMirror);

export default CodeMirror;
