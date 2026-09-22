import React, { useState } from 'react';
import MermaidDiagram from './MermaidDiagram';
import KaTeXFormula from './KaTeXFormula';
import CodeBlockShiki from './CodeBlockShiki';
import VideoShowcase from './VideoShowcase';

/**
 * Helper to parse inline markdown: **bold**, *italic*, `code`, [link](url), ![img](url)
 */
function parseInlineMarkdown(text) {
  if (!text) return text;

  // Split by inline markdown tokens
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  // Pattern matching images, links, bold, italic, inline code
  const tokenRegex = /(!\[(.*?)\]\((.*?)\))|(\[(.*?)\]\((.*?)\))|(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`([^`]+)`)/;

  while (remaining) {
    const match = remaining.match(tokenRegex);
    if (!match) {
      parts.push(remaining);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      parts.push(remaining.substring(0, matchIndex));
    }

    const fullMatch = match[0];

    // 1. Image: ![alt](url)
    if (match[1]) {
      const alt = match[2];
      const src = match[3];
      parts.push(
        <span key={`img-${keyIdx++}`} className="doc-inline-img-wrap" style={{ display: 'block', margin: '16px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" />
          {alt && <span style={{ display: 'block', padding: '6px 12px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', textAlign: 'center' }}>{alt}</span>}
        </span>
      );
    }
    // 2. Link: [text](url)
    else if (match[4]) {
      const label = match[5];
      const href = match[6];
      parts.push(
        <a
          key={`link-${keyIdx++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 600 }}
        >
          {label}
        </a>
      );
    }
    // 3. Bold: **text**
    else if (match[7]) {
      const boldText = match[8];
      parts.push(
        <strong key={`bold-${keyIdx++}`} style={{ color: '#ffffff', fontWeight: 700 }}>
          {boldText}
        </strong>
      );
    }
    // 4. Italic: *text*
    else if (match[9]) {
      const italicText = match[10];
      parts.push(
        <em key={`italic-${keyIdx++}`} style={{ color: '#e2e8f0', fontStyle: 'italic' }}>
          {italicText}
        </em>
      );
    }
    // 5. Code: `text`
    else if (match[11]) {
      const codeText = match[12];
      parts.push(
        <code
          key={`code-${keyIdx++}`}
          style={{
            background: 'rgba(124, 58, 237, 0.2)',
            border: '1px solid rgba(167, 139, 250, 0.35)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontFamily: 'monospace',
            fontSize: '12.5px',
            color: '#c4b5fd'
          }}
        >
          {codeText}
        </code>
      );
    }

    remaining = remaining.substring(matchIndex + fullMatch.length);
  }

  return parts;
}

/**
 * RichDocRenderer:
 * Standalone parser & cosmic glassmorphic renderer for dynamic documentation from DevAdmin.
 * Handles Microservice Topology, Benchmark Barcharts, Latency Line Graphs,
 * Mermaid Flowcharts, KaTeX Formulas, Tables, Code Blocks with Copy, and Video Walkthroughs.
 */
export default function RichDocRenderer({ content }) {
  const [copiedBlock, setCopiedBlock] = useState(null);

  if (!content || !content.trim()) {
    return null;
  }

  // If content is pure HTML (legacy or pre-rendered case study), safely render inside container
  const isHtml = content.trim().startsWith('<div') || content.trim().startsWith('<section') || content.trim().startsWith('<article');
  if (isHtml) {
    return <div className="case-study-injected" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ─────────────────────────────────────────────────────────────
    // 1. FENCED CODE / SPECIAL DIAGRAM / CHART / VIDEO BLOCKS
    // ─────────────────────────────────────────────────────────────
    if (line.startsWith('```')) {
      const header = line.substring(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```

      const rawCode = codeLines.join('\n');
      const blockId = `block-${elements.length}`;

      // A. Architecture Diagram Block (architecture:microservices or architecture)
      if (header.startsWith('architecture')) {
        const titleLine = codeLines.find((l) => l.startsWith('title:'));
        const title = titleLine ? titleLine.replace('title:', '').trim() : 'System Architecture Pipeline';
        const nodeLines = codeLines.filter((l) => l.trim().startsWith('-'));

        elements.push(
          <div
            key={blockId}
            className="doc-interactive-arch-card"
            style={{
              margin: '28px 0',
              padding: '24px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, rgba(20, 26, 68, 0.9) 0%, rgba(8, 12, 40, 0.98) 100%)',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              boxShadow: '0 16px 44px rgba(4, 8, 32, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-network-wired" style={{ color: '#38bdf8', fontSize: '18px' }}></i>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {title}
                </h3>
              </div>
              <span className="doc-badge-pill" style={{ margin: 0 }}>
                <i className="fas fa-project-diagram"></i> Architecture Topology
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(8, 12, 38, 0.7)', padding: '24px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {nodeLines.map((n, nIdx) => {
                const cleaned = n.replace(/^-\s*/, '').trim();
                const parts = cleaned.split('->').map((p) => p.trim().replace(/^\[|\]$/g, ''));
                return (
                  <div key={nIdx} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {parts.map((node, pIdx) => (
                      <React.Fragment key={pIdx}>
                        <div
                          style={{
                            padding: '10px 16px',
                            background: 'rgba(20, 28, 75, 0.85)',
                            border: '1px solid rgba(124, 58, 237, 0.4)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <i className="fas fa-cube" style={{ color: '#38bdf8', fontSize: '12px' }}></i>
                          <span>{node}</span>
                        </div>
                        {pIdx < parts.length - 1 && (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#a78bfa', fontSize: '14px' }}>
                            <i className="fas fa-chevron-right"></i>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
        continue;
      }

      // B. Bar Chart Block (chart:barchart or chart:bar)
      if (header.startsWith('chart:barchart') || header.startsWith('chart:bar')) {
        const titleLine = codeLines.find((l) => l.startsWith('title:'));
        const unitLine = codeLines.find((l) => l.startsWith('unit:'));
        const title = titleLine ? titleLine.replace('title:', '').trim() : 'Performance Benchmark Comparison';
        const unit = unitLine ? unitLine.replace('unit:', '').trim() : 'req/s';
        const dataLines = codeLines
          .filter((l) => l.trim().startsWith('-'))
          .map((l) => {
            const raw = l.replace(/^-\s*/, '');
            const [k, v] = raw.split(':').map((s) => s.trim());
            return { label: k, value: parseFloat(v) || 0 };
          });
        const maxValue = Math.max(...dataLines.map((d) => d.value), 1);

        elements.push(
          <div
            key={blockId}
            style={{
              margin: '28px 0',
              padding: '24px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, rgba(20, 26, 68, 0.85) 0%, rgba(10, 14, 44, 0.95) 100%)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              boxShadow: '0 12px 36px rgba(4, 8, 32, 0.45)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-chart-bar" style={{ color: '#38bdf8', fontSize: '18px' }}></i>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {title}
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                Unit: <span style={{ color: '#38bdf8' }}>{unit}</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dataLines.map((d, dIdx) => {
                const percent = Math.min(100, Math.round((d.value / maxValue) * 100));
                return (
                  <div key={dIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: '#e2e8f0' }}>{d.label}</span>
                      <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                        {d.value.toLocaleString()} {unit}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(90deg, #7c3aed 0%, #38bdf8 100%)',
                          borderRadius: '6px',
                          boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
        continue;
      }

      // C. Line Graph / Latency Metrics (chart:linegraph or chart:line)
      if (header.startsWith('chart:linegraph') || header.startsWith('chart:line')) {
        const titleLine = codeLines.find((l) => l.startsWith('title:'));
        const title = titleLine ? titleLine.replace('title:', '').trim() : 'Latency Performance Metric';
        const points = codeLines
          .filter((l) => l.trim().startsWith('-'))
          .map((l) => {
            const raw = l.replace(/^-\s*/, '');
            const [k, v] = raw.split(':').map((s) => s.trim());
            return { label: k, value: v };
          });

        elements.push(
          <div
            key={blockId}
            style={{
              margin: '28px 0',
              padding: '24px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, rgba(20, 26, 68, 0.85) 0%, rgba(10, 14, 44, 0.95) 100%)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              boxShadow: '0 12px 36px rgba(4, 8, 32, 0.45)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-tachometer-alt" style={{ color: '#4ade80', fontSize: '18px' }}></i>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {title}
                </h3>
              </div>
              <span className="doc-badge-pill" style={{ margin: 0, borderColor: 'rgba(74, 222, 128, 0.4)', color: '#4ade80', background: 'rgba(74, 222, 128, 0.15)' }}>
                <i className="fas fa-bolt"></i> Latency Metric
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {points.map((pt, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(8, 12, 38, 0.7)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{pt.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>{pt.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
        continue;
      }

      // D. Mermaid Diagram
      if (header.startsWith('mermaid')) {
        elements.push(
          <MermaidDiagram
            key={blockId}
            chart={rawCode}
            title="System Workflow & Entity Flowchart"
            subtitle="Interactive graph rendered directly from documentation markdown."
            diagramType="Flowchart"
          />
        );
        continue;
      }

      // E. KaTeX Math Formulation
      if (header.startsWith('katex') || header.startsWith('math')) {
        elements.push(
          <KaTeXFormula
            key={blockId}
            formula={rawCode}
            title="Mathematical Formulation & Metric Model"
            description="Algorithmic computation formula specified in project documentation."
            variables={[]}
          />
        );
        continue;
      }

      // F. Video Walkthrough Embed
      if (header.startsWith('video')) {
        const urlLine = codeLines.find((l) => l.startsWith('url:'));
        const titleLine = codeLines.find((l) => l.startsWith('title:'));
        const captionLine = codeLines.find((l) => l.startsWith('caption:'));
        const url = urlLine ? urlLine.replace('url:', '').trim() : '';
        const title = titleLine ? titleLine.replace('title:', '').trim() : 'Video Walkthrough Demo';
        const caption = captionLine ? captionLine.replace('caption:', '').trim() : '';

        if (url.includes('youtube') || url.includes('vimeo')) {
          elements.push(
            <div
              key={blockId}
              style={{
                margin: '28px 0',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#080c26',
                border: '1px solid rgba(124, 58, 237, 0.35)',
                boxShadow: '0 12px 36px rgba(4, 8, 32, 0.45)'
              }}
            >
              <div style={{ padding: '14px 18px', background: 'rgba(20, 26, 68, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600, fontSize: '14px' }}>
                  <i className="fas fa-play-circle" style={{ color: '#38bdf8' }}></i>
                  <span>{title}</span>
                </div>
                <span className="doc-badge-pill" style={{ margin: 0 }}>Video Showcase</span>
              </div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  src={url}
                  title={title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {caption && (
                <div style={{ padding: '12px 18px', background: 'rgba(15, 23, 42, 0.6)', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  {caption}
                </div>
              )}
            </div>
          );
        } else {
          elements.push(
            <VideoShowcase
              key={blockId}
              title={title}
              duration="03:30"
              resolution="1080p 60fps"
            />
          );
        }
        continue;
      }

      // G. Standard Syntax Highlighted Code Block
      const [lang, filename] = header.split(':');
      elements.push(
        <CodeBlockShiki
          key={blockId}
          code={rawCode}
          language={lang || 'javascript'}
          filename={filename || (lang ? `code.${lang}` : 'snippet.js')}
          description=""
        />
      );
      continue;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ALERT CALLOUT BLOCKS (> [!NOTE], > [!TIP], > [!WARNING])
    // ─────────────────────────────────────────────────────────────
    if (line.startsWith('> [!')) {
      const match = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      const type = match ? match[1].toUpperCase() : 'NOTE';
      const alertLines = [];
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        alertLines.push(lines[i].replace(/^>\s*/, ''));
        i++;
      }

      const alertMap = {
        NOTE: { color: '#38bdf8', icon: 'fa-info-circle', bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.35)' },
        TIP: { color: '#4ade80', icon: 'fa-lightbulb', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.35)' },
        IMPORTANT: { color: '#c084fc', icon: 'fa-star', bg: 'rgba(192, 132, 252, 0.1)', border: 'rgba(192, 132, 252, 0.35)' },
        WARNING: { color: '#fbbf24', icon: 'fa-exclamation-triangle', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.35)' },
        CAUTION: { color: '#f43f5e', icon: 'fa-shield-alt', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.35)' }
      };

      const cfg = alertMap[type] || alertMap.NOTE;

      elements.push(
        <div
          key={`alert-${elements.length}`}
          style={{
            margin: '20px 0',
            padding: '16px 20px',
            borderRadius: '12px',
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}
        >
          <i className={`fas ${cfg.icon}`} style={{ color: cfg.color, fontSize: '18px', marginTop: '2px', flexShrink: 0 }}></i>
          <div style={{ flex: 1, color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 700, color: cfg.color, textTransform: 'uppercase', fontSize: '12px', marginBottom: '4px', letterSpacing: '0.5px' }}>
              {type}
            </div>
            {parseInlineMarkdown(alertLines.join(' '))}
          </div>
        </div>
      );
      continue;
    }

    // ─────────────────────────────────────────────────────────────
    // 3. MARKDOWN TABLES
    // ─────────────────────────────────────────────────────────────
    if (line.trim().startsWith('|') && line.includes('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0].split('|').map((s) => s.trim()).filter(Boolean);
        const bodyRows = tableLines.slice(2).map((r) => r.split('|').map((s) => s.trim()).filter(Boolean));

        elements.push(
          <div
            key={`table-${elements.length}`}
            style={{
              margin: '24px 0',
              borderRadius: '14px',
              overflowX: 'auto',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              background: '#080c26',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: 'rgba(20, 26, 68, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)', fontFamily: cell.startsWith('/') || cell.startsWith('GET') || cell.startsWith('POST') || cell.startsWith('PUT') ? 'monospace' : 'inherit' }}>
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. HEADINGS
    // ─────────────────────────────────────────────────────────────
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${elements.length}`} style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '32px 0 16px', fontFamily: 'var(--font-heading)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
          {parseInlineMarkdown(line.replace('# ', ''))}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${elements.length}`} style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: '28px 0 14px', fontFamily: 'var(--font-heading)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
          {parseInlineMarkdown(line.replace('## ', ''))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} style={{ fontSize: '16px', fontWeight: 600, color: '#c4b5fd', margin: '22px 0 10px', fontFamily: 'var(--font-heading)' }}>
          {parseInlineMarkdown(line.replace('### ', ''))}
        </h3>
      );
      i++;
      continue;
    }

    // ─────────────────────────────────────────────────────────────
    // 5. BLOCKQUOTES
    // ─────────────────────────────────────────────────────────────
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          style={{
            margin: '18px 0',
            paddingLeft: '16px',
            borderLeft: '3px solid #7c3aed',
            color: 'rgba(255,255,255,0.75)',
            fontStyle: 'italic',
            fontSize: '14.5px',
            lineHeight: '1.6'
          }}
        >
          {parseInlineMarkdown(line.replace('> ', ''))}
        </blockquote>
      );
      i++;
      continue;
    }

    // ─────────────────────────────────────────────────────────────
    // 6. BULLET LIST ITEMS
    // ─────────────────────────────────────────────────────────────
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={`li-${elements.length}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '8px 0', fontSize: '14.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
          <span style={{ color: '#38bdf8', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}>▹</span>
          <span>{parseInlineMarkdown(line.replace(/^[-*]\s*/, ''))}</span>
        </div>
      );
      i++;
      continue;
    }

    // ─────────────────────────────────────────────────────────────
    // 7. REGULAR PARAGRAPHS
    // ─────────────────────────────────────────────────────────────
    if (line.trim() !== '') {
      elements.push(
        <p key={`p-${elements.length}`} style={{ margin: '14px 0', fontSize: '15px', color: 'rgba(255,255,255,0.82)', lineHeight: '1.7' }}>
          {parseInlineMarkdown(line)}
        </p>
      );
    }

    i++;
  }

  return <div className="rich-doc-rendered-container">{elements}</div>;
}
