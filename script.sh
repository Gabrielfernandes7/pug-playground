{
  echo "# Pug Render — Project Context"
  echo ""
  echo "Gerado em: \`$(date -u +%Y-%m-%dT%H:%M:%SZ)\`"
  echo ""

  echo "## Estrutura"
  echo '```'
  tree -I 'PROJECT_CONTEXT.md|node_modules|.git' --noreport --dirsfirst 2>/dev/null || ls -R
  echo '```'
  echo ""

  echo "## Estatísticas"
  echo ""
  echo "| Arquivo | Linhas | Bytes |"
  echo "|---|---:|---:|"

  FILES="README.md index.html assets/pug-logo.svg css/tokens.css css/layout.css css/codemirror.css css/components.css js/config.js js/utils.js js/compile.js js/templates.js js/editor.js js/app.js script.sh"

  for f in $FILES; do
    [ -f "$f" ] || continue
    printf "| \`%s\` | %s | %s |\n" "$f" "$(wc -l < "$f" | tr -d ' ')" "$(wc -c < "$f" | tr -d ' ')"
  done
  echo ""

  for f in $FILES; do
    [ -f "$f" ] || continue
    ext="${f##*.}"
    case "$ext" in
      html) lang=html ;;
      css)  lang=css ;;
      js)   lang=javascript ;;
      md)   lang=markdown ;;
      svg)  lang=xml ;;
      sh)   lang=bash ;;
      *)    lang=text ;;
    esac
    echo "---"
    echo ""
    echo "## \`$f\`"
    echo ""
    echo '```'"$lang"
    cat "$f"
    [ -n "$(tail -c1 "$f")" ] && echo ""
    echo '```'
    echo ""
  done
} > PROJECT_CONTEXT.md

echo "✅ $(wc -l < PROJECT_CONTEXT.md) linhas · $(du -h PROJECT_CONTEXT.md | cut -f1)"