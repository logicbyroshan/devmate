import React, { useState } from 'react';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Tokenizes a line into styled HTML spans without overlapping replacements
function highlightPythonLine(line) {
  // Check full comment line
  if (line.trim().startsWith('#')) {
    return `<span class="shiki-comment">${escapeHtml(line)}</span>`;
  }

  // Token pattern matching strings, comments, keywords, decorators, types, numbers, functions
  const pattern = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[\w.]+)|(\b(?:def|class|return|import|from|as|async|await|if|elif|else|for|while|try|except|with|pass|raise|lambda|True|False|None|self|yield)\b)|(\b(?:int|str|dict|list|set|bool|tuple|print|len|range|enumerate|super|Exception|isinstance)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*(?=\())/g;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    // Append preceding plain text
    if (match.index > lastIndex) {
      result += escapeHtml(line.slice(lastIndex, match.index));
    }

    const [raw, comment, str, decorator, keyword, typeName, num, func] = match;

    if (comment) {
      result += `<span class="shiki-comment">${escapeHtml(comment)}</span>`;
    } else if (str) {
      result += `<span class="shiki-string">${escapeHtml(str)}</span>`;
    } else if (decorator) {
      result += `<span class="shiki-decorator">${escapeHtml(decorator)}</span>`;
    } else if (keyword) {
      result += `<span class="shiki-keyword">${escapeHtml(keyword)}</span>`;
    } else if (typeName) {
      result += `<span class="shiki-type">${escapeHtml(typeName)}</span>`;
    } else if (num) {
      result += `<span class="shiki-num">${escapeHtml(num)}</span>`;
    } else if (func) {
      result += `<span class="shiki-func">${escapeHtml(func)}</span>`;
    } else {
      result += escapeHtml(raw);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    result += escapeHtml(line.slice(lastIndex));
  }

  return result;
}

function highlightSqlLine(line) {
  if (line.trim().startsWith('--')) {
    return `<span class="shiki-comment">${escapeHtml(line)}</span>`;
  }

  const pattern = /(--.*$)|('(?:\\.|[^'\\])*')|(\b(?:SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|DEFAULT|CASCADE|CONSTRAINT|PARTITION|HASH|FOR|VALUES|WITH|MODULUS|REMAINDER|USING)\b)|(\b(?:UUID|VARCHAR|INTEGER|BIGINT|BOOLEAN|TIMESTAMP|JSONB|TEXT|SERIAL|DECIMAL|DATE|ZONE)\b)|(\b\d+\b)/gi;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(line.slice(lastIndex, match.index));
    }

    const [raw, comment, str, keyword, typeName, num] = match;

    if (comment) {
      result += `<span class="shiki-comment">${escapeHtml(comment)}</span>`;
    } else if (str) {
      result += `<span class="shiki-string">${escapeHtml(str)}</span>`;
    } else if (keyword) {
      result += `<span class="shiki-keyword">${escapeHtml(keyword)}</span>`;
    } else if (typeName) {
      result += `<span class="shiki-type">${escapeHtml(typeName)}</span>`;
    } else if (num) {
      result += `<span class="shiki-num">${escapeHtml(num)}</span>`;
    } else {
      result += escapeHtml(raw);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    result += escapeHtml(line.slice(lastIndex));
  }

  return result;
}

function highlightGenericLine(line) {
  return escapeHtml(line);
}

function highlightSyntax(code, lang = 'python') {
  const lines = code.split('\n');
  return lines.map((line) => {
    if (lang === 'python') return highlightPythonLine(line);
    if (lang === 'sql') return highlightSqlLine(line);
    return highlightGenericLine(line);
  });
}

export default function CodeBlockShiki({ code, language = 'python', filename, description }) {
  const [copied, setCopied] = useState(false);
  const formattedLines = highlightSyntax(code.trim(), language.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLangIcon = (lang) => {
    switch (lang.toLowerCase()) {
      case 'python': return 'fab fa-python';
      case 'javascript':
      case 'js': return 'fab fa-js-square';
      case 'typescript':
      case 'ts': return 'fas fa-code';
      case 'sql': return 'fas fa-database';
      case 'bash':
      case 'sh': return 'fas fa-terminal';
      case 'json': return 'fas fa-brackets-curly';
      default: return 'fas fa-code';
    }
  };

  return (
    <div className="doc-shiki-container">
      <div className="doc-shiki-header">
        <div className="doc-shiki-window-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <div className="doc-shiki-title-wrap">
          <i className={getLangIcon(language)}></i>
          <span className="doc-shiki-filename">{filename || `${language.toUpperCase()} Implementation`}</span>
          <span className="doc-shiki-lang-badge">{language.toUpperCase()}</span>
        </div>
        <button 
          className="doc-shiki-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          title="Copy code"
        >
          <i className={copied ? 'fas fa-check' : 'far fa-copy'}></i>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {description && <div className="doc-shiki-description">{description}</div>}

      <div className="doc-shiki-editor">
        <div className="doc-shiki-line-numbers" aria-hidden="true">
          {formattedLines.map((_, i) => (
            <span key={i} className="line-num">{i + 1}</span>
          ))}
        </div>
        <pre className="doc-shiki-code">
          <code>
            {formattedLines.map((lineHtml, i) => (
              <span key={i} className="code-line" dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }} />
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
