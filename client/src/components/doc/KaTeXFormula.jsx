import React, { useMemo } from 'react';
import katex from 'katex';

export default function KaTeXFormula({ 
  formula, 
  title, 
  description, 
  isBlock = true, 
  variables = [] 
}) {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: isBlock
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      return `<code class="katex-fallback">${formula}</code>`;
    }
  }, [formula, isBlock]);

  return (
    <div className="doc-katex-card">
      <div className="doc-katex-header">
        <span className="doc-badge-pill">
          <i className="fas fa-square-root-alt"></i> KaTeX Mathematical Model
        </span>
        {title && <h4 className="doc-katex-title">{title}</h4>}
      </div>

      {description && <p className="doc-katex-desc">{description}</p>}

      <div className="doc-katex-equation-wrapper">
        <div 
          className="doc-katex-rendered"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {variables && variables.length > 0 && (
        <div className="doc-katex-variables">
          <div className="doc-katex-var-title">Variable Definitions:</div>
          <div className="doc-katex-var-grid">
            {variables.map((v, idx) => (
              <div key={idx} className="doc-katex-var-item">
                <span className="doc-katex-var-symbol">{v.symbol}</span>
                <span className="doc-katex-var-def">{v.meaning}</span>
                {v.value && <span className="doc-katex-var-val">{v.value}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
