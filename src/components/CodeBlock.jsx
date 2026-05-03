// Tokens para una línea de YAML — retorna [{ text, cls }]
function tokenizeYAMLLine(line) {
  if (line.trim() === '') return [{ text: line || ' ', cls: '' }]

  // Línea de comentario completa
  if (/^\s*#/.test(line)) return [{ text: line, cls: 'yc' }]

  const tokens = []
  let pos = 0

  // Indentación inicial
  const wsEnd = line.search(/\S/)
  if (wsEnd > 0) {
    tokens.push({ text: line.slice(0, wsEnd), cls: '' })
    pos = wsEnd
  }

  // Bullet de lista: "- "
  const bulletMatch = line.slice(pos).match(/^(-\s+)/)
  if (bulletMatch) {
    tokens.push({ text: bulletMatch[1], cls: '' })
    pos += bulletMatch[1].length
  }

  // Key: identificador seguido de ':'
  const keyMatch = line.slice(pos).match(/^([\w-]+)(\s*:)/)
  if (keyMatch) {
    tokens.push({ text: keyMatch[1], cls: 'yk' })
    tokens.push({ text: keyMatch[2], cls: '' })
    pos += keyMatch[0].length
  }

  // Resto es el valor
  const rest = line.slice(pos)
  if (rest) tokens.push(...tokenizeValueStr(rest))

  return tokens
}

// Tokeniza una cadena de valor (puede contener ${{...}}, acciones, strings, etc.)
function tokenizeValueStr(str) {
  if (!str) return []

  const tokens = []
  let remaining = str

  const patterns = [
    // Secrets: ${{ secrets.NAME }}
    { re: /^\$\{\{\s*secrets\.\w+\s*\}\}/, cls: 'yw' },
    // Otras expresiones GitHub: ${{ ... }}
    { re: /^\$\{\{[^}]+\}\}/, cls: 'yv' },
    // Action del marketplace: org/repo@version
    { re: /^[\w-]+\/[\w.-]+@[\w.]+/, cls: 'yp' },
    // Boolean
    { re: /^(true|false)(?=[\s,\]|]|$)/, cls: 'yg' },
    // Número entre comillas simples: '20'
    { re: /^'\d+'/, cls: 'yn' },
    // Número suelto
    { re: /^\d+(?=\s|$|,)/, cls: 'yn' },
    // Array literal: ['main']
    { re: /^\[.*?\]/, cls: 'ys' },
    // Strings con comillas simples
    { re: /^'[^']*'/, cls: 'ys' },
    // Strings con comillas dobles
    { re: /^"[^"]*"/, cls: 'ys' },
    // Comentario inline
    { re: /^\s{2,}#.*$/, cls: 'yc' },
  ]

  while (remaining.length > 0) {
    let matched = false

    for (const { re, cls } of patterns) {
      const m = remaining.match(re)
      if (m) {
        tokens.push({ text: m[0], cls })
        remaining = remaining.slice(m[0].length)
        matched = true
        break
      }
    }

    if (!matched) {
      const last = tokens[tokens.length - 1]
      if (last && last.cls === '') {
        last.text += remaining[0]
      } else {
        tokens.push({ text: remaining[0], cls: '' })
      }
      remaining = remaining.slice(1)
    }
  }

  return tokens
}

function tokenizeLine(line, language) {
  if (language === 'yaml') return tokenizeYAMLLine(line)
  // bash y jsx: tokenizar solo expresiones ${{...}} y strings; resto plain
  if (language === 'bash') return tokenizeValueStr(line)
  return [{ text: line, cls: '' }]
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function CodeBlock({
  filename,
  language = 'yaml',
  children,
  showLineNumbers = false,
  highlightLines = [],
}) {
  const isString = typeof children === 'string'

  const lines = isString
    ? children.replace(/^\n/, '').replace(/\n$/, '').split('\n')
    : null

  return (
    <div className="cb">
      {/* Barra superior — dots + nombre de archivo */}
      <div className="cb-bar">
        <span className="cb-dots" aria-hidden="true">
          <span className="cb-dot cb-dot--red" />
          <span className="cb-dot cb-dot--yellow" />
          <span className="cb-dot cb-dot--green" />
        </span>
        {filename && <span className="cb-filename">{filename}</span>}
      </div>

      {/* Cuerpo del código */}
      <div className="cb-body">
        <pre className="cb-pre">
          {isString ? (
            <code className="cb-code">
              {lines.map((line, i) => {
                const lineNum = i + 1
                const isHighlighted = highlightLines.includes(lineNum)
                const tokens = tokenizeLine(line, language)

                return (
                  <span
                    key={i}
                    className={`cb-line${isHighlighted ? ' cb-line--hl' : ''}`}
                  >
                    {showLineNumbers && (
                      <span className="cb-ln" aria-hidden="true">
                        {lineNum}
                      </span>
                    )}
                    <span className="cb-lc">
                      {tokens.map((tok, j) =>
                        tok.cls
                          ? <span key={j} className={`yt-${tok.cls}`}>{tok.text}</span>
                          : tok.text
                      )}
                    </span>
                  </span>
                )
              })}
            </code>
          ) : (
            <code className="cb-code cb-code--jsx">{children}</code>
          )}
        </pre>
      </div>
    </div>
  )
}
