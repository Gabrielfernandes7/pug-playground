#!/usr/bin/env bash
# gerar_contexto.sh — tree-first, compatível com Bash 3.2 (macOS)
set -eo pipefail

PROJECT_DIR="${1:-.}"
OUTPUT_FILE="CONTEXTO_PROJETO.md"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# ============================================================
# 0. Verificar tree (com mensagem de instalação)
# ============================================================
if ! command -v tree &>/dev/null; then
    echo "❌ 'tree' não encontrado. Instale:"
    echo "   macOS:   brew install tree"
    echo "   Debian:  sudo apt install tree"
    echo "   Fedora:  sudo dnf install tree"
    echo "   Arch:    sudo pacman -S tree"
    exit 1
fi

# ============================================================
# 1. Exclusões em regex única (sintaxe ERE do tree -I)
# ============================================================
EXCLUDE_DIRS='(^|/)(\.git|node_modules|vendor|\.venv|venv|__pycache__|\.mypy_cache|\.pytest_cache|dist|build|target|\.idea|\.vscode|coverage|\.next|out|\.expo|\.cache|\.tox|\.eggs)(/|$)'
EXCLUDE_EXTS='(\.lock|\.log|\.min\.js|\.map|\.pyc|\.class|\.o|\.so|\.dylib|\.dll|\.exe|\.png|\.jpe?g|\.gif|\.svg|\.ico|\.woff2?|\.ttf|\.eot|\.pdf|\.zip|\.tar|\.gz|\.7z|\.mp4|\.mp3)$'
EXCLUDE="$EXCLUDE_DIRS|$EXCLUDE_EXTS"

# ============================================================
# 2. Árvore bonita (para leitura humana no .md)
# ============================================================
echo "🌳 Gerando árvore..."
tree -a -I "$EXCLUDE" --charset=utf-8 --dirsfirst --prune --noreport "$PROJECT_DIR" \
    > "$TMP_DIR/tree.txt" 2>/dev/null || true
TREE_CONTENT=$(cat "$TMP_DIR/tree.txt")

# ============================================================
# 3. Lista plana (para parsing)
#    -i = sem linhas de indentação
#    -f = paths completos
# ============================================================
echo "📋 Listando arquivos..."
tree -if --noreport -I "$EXCLUDE" "$PROJECT_DIR" 2>/dev/null \
    | sed '/^$/d' | sed '/^\.$/d' > "$TMP_DIR/paths.txt"

ALL_FILES=()
ALL_DIRS=()
while IFS= read -r p; do
    [ -z "$p" ] && continue
    if   [ -d "$p" ]; then ALL_DIRS+=("$p")
    elif [ -f "$p" ]; then ALL_FILES+=("$p")
    fi
done < "$TMP_DIR/paths.txt"

echo "✅ ${#ALL_FILES[@]} arquivos, ${#ALL_DIRS[@]} diretórios"

# ============================================================
# 4. Mermaid a partir da lista plana
# ============================================================
echo "📊 Gerando Mermaid..."

normalize() {
    local p="$1"
    if [ "$PROJECT_DIR" = "." ] || [ "$PROJECT_DIR" = "./" ]; then
        echo "${p#./}"
    else
        echo "${p#$PROJECT_DIR/}"
    fi
}

# Pré-computa relação diretório normalizado -> id
> "$TMP_DIR/dir_ids.txt"
idx=0
for d in "${ALL_DIRS[@]}"; do
    idx=$((idx + 1))
    printf '%s\tD%d\n' "$(normalize "$d")" "$idx" >> "$TMP_DIR/dir_ids.txt"
done

lookup_dir_id() {
    # $1 = path normalizado
    awk -F '\t' -v t="$1" '$1 == t { print $2; exit }' "$TMP_DIR/dir_ids.txt"
}

MERMAID_FILE="$TMP_DIR/diagram.mmd"
{
    echo '```mermaid'
    echo 'graph TD'
    echo '    ROOT["📁 raiz"]'

    # nós
    while IFS=$'\t' read -r rel id; do
        safe=$(printf '%s' "$rel" | tr '"' "'")
        echo "    ${id}[\"📁 ${safe}\"]"
    done < "$TMP_DIR/dir_ids.txt"

    # arestas pai -> filho
    while IFS=$'\t' read -r rel id; do
        parent=$(dirname "$rel")
        if [ "$parent" = "." ] || [ -z "$parent" ]; then
            echo "    ROOT --> ${id}"
        else
            pid=$(lookup_dir_id "$parent" || true)
            [ -n "$pid" ] && echo "    ${pid} --> ${id}"
        fi
    done < "$TMP_DIR/dir_ids.txt"

    echo '```'
} > "$MERMAID_FILE"
MERMAID_CONTENT=$(cat "$MERMAID_FILE")

# ============================================================
# 5. Dependências aproximadas
# ============================================================
echo "🔗 Detectando dependências..."
DEPS_FILE="$TMP_DIR/deps.txt"
> "$DEPS_FILE"

scan_ext() {
    local ext="$1" pattern="$2"
    find "$PROJECT_DIR" -type f -name "*.$ext" \
        -not -path "*/.git/*" -not -path "*/node_modules/*" -not -path "*/vendor/*" \
        2>/dev/null | while IFS= read -r f; do
            grep -En "$pattern" "$f" 2>/dev/null | sed "s|^|$f:|" || true
        done | sed "s|^$PROJECT_DIR/||" >> "$DEPS_FILE"
}

scan_ext "py"  '^(import |from [a-zA-Z0-9_.]+ import )'
scan_ext "js"  "(require\(['\"]|import .* from ['\"])"
scan_ext "ts"  "(require\(['\"]|import .* from ['\"])"
scan_ext "tsx" "(require\(['\"]|import .* from ['\"])"
scan_ext "jsx" "(require\(['\"]|import .* from ['\"])"
scan_ext "rs"  '^use '
scan_ext "go"  '^import'

DEPS_CONTENT=$(head -100 "$DEPS_FILE" 2>/dev/null || echo "(nenhuma dependência detectada)")

# ============================================================
# 6. Metadados
# ============================================================
META_FILE="$TMP_DIR/meta.txt"
> "$META_FILE"
for f in "${ALL_FILES[@]}"; do
    rel="${f#$PROJECT_DIR/}"
    size=$(wc -c < "$f" 2>/dev/null | tr -d ' ')
    lines=$(wc -l < "$f" 2>/dev/null | tr -d ' ')
    printf '| `%s` | %s bytes | %s linhas |\n' "$rel" "$size" "$lines" >> "$META_FILE"
done
META_CONTENT=$(cat "$META_FILE")

LANGS=$(find "$PROJECT_DIR" -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.rb" -o -name "*.php" \) \
        -not -path "*/.git/*" -not -path "*/node_modules/*" \
        2>/dev/null | sed 's/.*\.//' | sort -u | tr '\n' ' ')

# ============================================================
# 7. Contexto final
# ============================================================
echo "📝 Montando $OUTPUT_FILE..."

cat > "$OUTPUT_FILE" <<EOF
# Contexto do Projeto para IA Generativa

> Gerado em $(date -u '+%Y-%m-%d %H:%M:%S UTC').
> Cole este arquivo em qualquer chatbot de IA (ChatGPT, Claude, DeepSeek, Gemini...).

---

## 1. Visão Geral

- **Diretório raiz:** \`$PROJECT_DIR\`
- **Arquivos:** ${#ALL_FILES[@]}
- **Diretórios:** ${#ALL_DIRS[@]}
- **Linguagens detectadas:** $LANGS

---

## 2. Estrutura de Diretórios

\`\`\`
$TREE_CONTENT
\`\`\`

---

## 3. Diagrama Mermaid

$MERMAID_CONTENT

---

## 4. Arquivos e Metadados

| Arquivo | Tamanho | Linhas |
|---|---|---|
$META_CONTENT

---

## 5. Dependências Detectadas (amostra)

\`\`\`
$DEPS_CONTENT
\`\`\`

---

## 6. Instruções para a IA

1. A estrutura segue a árvore e o diagrama Mermaid acima.
2. As dependências são aproximadas (grep), não substituem o gerenciador real.
3. Priorize arquivos com mais linhas ao analisar a lógica principal.
4. Foque em \`src/\`, \`lib/\` ou equivalente se o projeto for grande.

*Fim do contexto.*
EOF

echo ""
echo "✅ Contexto gerado: $OUTPUT_FILE"
echo "   Tamanho: $(wc -c < "$OUTPUT_FILE" | tr -d ' ') bytes"