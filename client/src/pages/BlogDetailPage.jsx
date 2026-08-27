import React, { useEffect, useState } from 'react';
import { BLOG_ARTICLES } from '../api/blogData';
import CodeBlockShiki from '../components/doc/CodeBlockShiki';

export default function BlogDetailPage({ slug, onNavigate }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const article = BLOG_ARTICLES[slug] || BLOG_ARTICLES['understanding-microservices-architecture'];
  const relatedArticles = Object.values(BLOG_ARTICLES).filter(a => a.slug !== article.slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${article.title} | Roshan Damor Blog`;
  }, [article]);

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Sidebar: sticky TOC + author + related + site nav
  const Sidebar = () => (
    <aside className="blog-sidebar">
      {/* Author card */}
      <div className="blog-sb-author">
        <img src={article.author.avatar} alt={article.author.name} className="blog-sb-avatar" />
        <div className="blog-sb-author-name">{article.author.name}</div>
        <div className="blog-sb-author-role">{article.author.role}</div>
        <p className="blog-sb-author-bio">{article.author.bio}</p>
        <div className="blog-sb-author-links">
          <a href="#about" onClick={e => { e.preventDefault(); onNavigate('about'); }} className="blog-sb-link">
            <i className="fas fa-user"></i> Profile
          </a>
          <a href="https://github.com/logicbyroshan" target="_blank" rel="noopener noreferrer" className="blog-sb-link">
            <i className="fab fa-github"></i> GitHub
          </a>
          <a href="https://linkedin.com/in/logicbyroshan" target="_blank" rel="noopener noreferrer" className="blog-sb-link">
            <i className="fab fa-linkedin-in"></i> LinkedIn
          </a>
        </div>
      </div>

      {/* TOC */}
      {article.toc && article.toc.length > 0 && (
        <nav className="blog-sb-toc" aria-label="Table of Contents">
          <div className="blog-sb-section-title"><i className="fas fa-list-ul"></i> Contents</div>
          <ul className="blog-sb-toc-list">
            {article.toc.map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="blog-sb-related">
          <div className="blog-sb-section-title"><i className="fas fa-newspaper"></i> More Articles</div>
          {relatedArticles.slice(0, 2).map(rel => (
            <div
              key={rel.slug}
              className="blog-sb-related-card"
              onClick={() => onNavigate('blog-detail', rel.slug)}
              role="button"
              tabIndex="0"
              onKeyDown={e => e.key === 'Enter' && onNavigate('blog-detail', rel.slug)}
            >
              <div className="blog-sb-related-img">
                <img src={rel.image} alt={rel.title} />
              </div>
              <div className="blog-sb-related-info">
                <div className="blog-sb-related-cat">{rel.category}</div>
                <div className="blog-sb-related-title">{rel.title}</div>
                <div className="blog-sb-related-meta"><i className="far fa-clock"></i> {rel.readTime}</div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="blog-sb-view-all"
            onClick={() => onNavigate('home', 'blog')}
          >
            View All Articles <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}

      {/* Site navigation */}
      <div className="blog-sb-sitemap">
        <div className="blog-sb-section-title"><i className="fas fa-sitemap"></i> Site Navigation</div>
        <ul className="blog-sb-sitemap-list">
          <li><a href="/" onClick={e => { e.preventDefault(); onNavigate('home'); }}><i className="fas fa-home"></i> Home</a></li>
          <li><a href="/" onClick={e => { e.preventDefault(); onNavigate('home', 'projects'); }}><i className="fas fa-folder-open"></i> Projects</a></li>
          <li><a href="/" onClick={e => { e.preventDefault(); onNavigate('home', 'blog'); }}><i className="fas fa-pen-nib"></i> Blog</a></li>
          <li><a href="/about" onClick={e => { e.preventDefault(); onNavigate('about'); }}><i className="fas fa-user"></i> About</a></li>
          <li><a href="/experience" onClick={e => { e.preventDefault(); onNavigate('experience'); }}><i className="fas fa-briefcase"></i> Experience</a></li>
          <li><a href="/" onClick={e => { e.preventDefault(); onNavigate('home', 'contact'); }}><i className="fas fa-envelope"></i> Contact</a></li>
        </ul>
      </div>

      {/* Share */}
      <div className="blog-sb-share">
        <div className="blog-sb-section-title"><i className="fas fa-share-alt"></i> Share Article</div>
        <div className="blog-sb-share-btns">
          <button type="button" className="blog-sb-share-btn" onClick={handleShareCopy}>
            <i className={copiedLink ? "fas fa-check" : "fas fa-link"}></i>
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank" rel="noopener noreferrer"
            className="blog-sb-share-btn"
          >
            <i className="fab fa-twitter"></i> Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank" rel="noopener noreferrer"
            className="blog-sb-share-btn"
          >
            <i className="fab fa-linkedin-in"></i> LinkedIn
          </a>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Full-width editorial header */}
        <header className="blog-article-header">
          <div className="blog-header-meta">
            <span className="page-badge" style={{ margin: 0 }}>
              <i className="fas fa-newspaper"></i> {article.category}
            </span>
            <span className="blog-meta-item"><i className="far fa-clock"></i> {article.readTime}</span>
            <span className="blog-meta-item"><i className="far fa-calendar-alt"></i> {article.date}</span>
          </div>

          <h1 className="blog-article-title">{article.title}</h1>
          <p className="blog-article-subtitle">{article.subtitle}</p>

          <div className="blog-article-author-row">
            <div className="blog-author-info">
              <img src={article.author.avatar} alt={article.author.name} className="blog-author-avatar" />
              <div>
                <span className="blog-author-name">{article.author.name}</span>
                <span className="blog-author-role">{article.author.role}</span>
              </div>
            </div>
            <div className="blog-share-actions">
              <button type="button" className="doc-ctrl-btn" onClick={handleShareCopy} title="Copy link">
                <i className={copiedLink ? "fas fa-check" : "fas fa-link"}></i>
                {copiedLink ? "Copied!" : "Share"}
              </button>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="doc-ctrl-btn"><i className="fab fa-twitter"></i></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="doc-ctrl-btn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          {/* Featured banner — full header width */}
          <div className="blog-featured-banner-wrap" style={{ maxWidth: '100%', marginTop: '24px' }}>
            <img src={article.image} alt={article.title} className="blog-featured-img" />
          </div>
        </header>

        {/* Two-column body */}
        <div className="blog-two-col-layout">
          {/* Left: main article */}
          <article className="blog-main-col">
            {/* TL;DR */}
            {article.tldr && (
              <div className="blog-tldr-box">
                <div className="blog-tldr-header">
                  <i className="fas fa-bolt"></i>
                  <span>Executive Summary (TL;DR)</span>
                </div>
                <p className="blog-tldr-text">{article.tldr}</p>
              </div>
            )}

            {/* Article sections */}
            <div className="blog-body-prose">
              {article.sections.map(sec => (
                <section key={sec.id} id={sec.id} className="blog-article-section">
                  <h2 className="blog-section-title">{sec.heading}</h2>
                  <div className="blog-section-content">
                    {sec.content.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('>')) {
                        return (
                          <blockquote key={pIdx} className="blog-blockquote">
                            {paragraph.replace(/^>\s*/, '')}
                          </blockquote>
                        );
                      }
                      if (paragraph.startsWith('-')) {
                        return (
                          <ul key={pIdx} className="blog-prose-list">
                            {paragraph.split('\n').map((item, iIdx) => (
                              <li key={iIdx} dangerouslySetInnerHTML={{ __html: item.replace(/^-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={pIdx} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                      );
                    })}
                  </div>
                  {sec.codeSnippet && (
                    <div style={{ margin: '24px 0' }}>
                      <CodeBlockShiki
                        code={sec.codeSnippet.code}
                        language={sec.codeSnippet.language}
                        filename={sec.codeSnippet.filename}
                        description={sec.codeSnippet.description}
                      />
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Key Takeaways */}
            {article.takeaways && article.takeaways.length > 0 && (
              <div className="blog-takeaways-card" id="key-takeaways">
                <div className="blog-takeaways-header">
                  <i className="fas fa-check-double"></i>
                  <span>Key Takeaways &amp; Engineering Checklist</span>
                </div>
                <ul className="blog-takeaways-list">
                  {article.takeaways.map((point, idx) => (
                    <li key={idx}>
                      <i className="fas fa-check-circle"></i>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author signature card */}
            <div className="blog-author-card">
              <img src={article.author.avatar} alt={article.author.name} className="author-card-avatar" />
              <div className="author-card-details">
                <div className="author-card-title">Written by {article.author.name}</div>
                <p className="author-card-bio">{article.author.bio}</p>
                <div className="author-card-actions">
                  <a href="#about" onClick={e => { e.preventDefault(); onNavigate('about'); }} className="btn btn-secondary btn-sm">
                    <i className="fas fa-user"></i> Full Profile
                  </a>
                  <a href="https://github.com/logicbyroshan" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                  <a href="https://linkedin.com/in/logicbyroshan" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <i className="fab fa-linkedin-in"></i> LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Related articles at bottom */}
            {relatedArticles.length > 0 && (
              <div className="blog-related-wrap">
                <div className="blog-related-heading">
                  <span>Continue Reading</span>
                  <a href="/" onClick={e => { e.preventDefault(); onNavigate('home', 'blog'); }}>
                    View All <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
                <div className="blog-related-grid">
                  {relatedArticles.slice(0, 2).map(rel => (
                    <div
                      key={rel.slug}
                      className="blog-related-card"
                      onClick={() => onNavigate('blog-detail', rel.slug)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={e => e.key === 'Enter' && onNavigate('blog-detail', rel.slug)}
                    >
                      <div className="blog-related-img-wrap">
                        <img src={rel.image} alt={rel.title} />
                      </div>
                      <div className="blog-related-meta">
                        <span className="blog-related-badge">{rel.category}</span>
                        <h4 className="blog-related-title">{rel.title}</h4>
                        <span className="blog-related-date"><i className="far fa-clock"></i> {rel.readTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Right: sticky sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
