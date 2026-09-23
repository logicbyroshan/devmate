import React, { useState, useEffect } from 'react';
import { fetchProfile, fetchSummary } from '../api/portfolioApi';
import { safeUrl } from '../api/hydratePortfolio';

export default function RexiModal() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const [profRes, sumRes] = await Promise.allSettled([
          fetchProfile(),
          fetchSummary(),
        ]);
        if (!isMounted) return;
        if (profRes.status === 'fulfilled' && profRes.value && !profRes.value.detail) {
          setProfile(profRes.value);
        }
        if (sumRes.status === 'fulfilled' && sumRes.value) {
          setSummary(sumRes.value);
        }
      } catch {
        // Ignore fallback
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const fullName = profile?.full_name || 'Roshan Damor';
  const roleTitle = profile?.title || 'Software Engineer · Full Stack AI';
  const email = profile?.email || 'mail@logicbyroshan.in';
  const location = profile?.location || 'India';
  const yearsExp = summary?.years_of_experience ? `${summary.years_of_experience}+ Years` : '3+ Years';
  const resumeUrl = profile?.resume ? safeUrl(profile.resume) : null;
  const videoResumeUrl = profile?.video_resume ? safeUrl(profile.video_resume) : 'https://www.youtube.com/@logicbyroshan';

  return (
    <>
      {/* ── Resume & Video Presentation Modal ───────────────────────── */}
      <div className="modal-overlay" id="modal-resume">
        <div className="modal-box modal-box-resume">
          {/* Sticky header bar with icon + title + close button */}
          <div className="modal-header-bar">
            <div className="modal-header-left">
              <div className="modal-icon-wrap modal-icon-compact modal-icon-blue">
                <i className="fas fa-play-circle"></i>
              </div>
              <div>
                <h2 className="modal-title modal-title-compact">Resume &amp; Video Presentation</h2>
                <p className="modal-subtitle" style={{ margin: 0, fontSize: '12px' }}>{fullName} &mdash; {roleTitle}</p>
              </div>
            </div>
            <div className="modal-header-right">
              <button type="button" className="modal-header-btn modal-close" aria-label="Close" title="Close">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Interactive Video Showcase Card */}
          <div className="modal-video-card-wrap">
            <div className="modal-video-card">
              <img
                src="/static/images/hero.webp"
                alt="Roshan Damor Video Resume"
                className="modal-video-thumbnail"
                loading="eager"
              />
              <div className="modal-video-overlay">
                <div className="modal-video-top-tag">
                  <span className="pulse-indicator"></span>
                  <span>Video Resume &middot; 1:00 min</span>
                </div>
                <a
                  href={videoResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-video-play-btn"
                  aria-label="Watch Video Presentation on YouTube"
                  title="Watch on YouTube"
                >
                  <div className="play-pulse-ring"></div>
                  <i className="fas fa-play"></i>
                </a>
                <div className="modal-video-bottom-info">
                  <span className="modal-video-category">ENGINEERING PRESENTATION</span>
                  <h3 className="modal-video-title">Full Stack Systems, SaaS &amp; AI Architecture</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions modal-actions-resume">
            {resumeUrl ? (
              <a href={resumeUrl} download="Roshan_Damor_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-btn">
                <i className="fas fa-file-download"></i>
                <span>Download Resume</span>
              </a>
            ) : (
              <a href={`mailto:${email}?subject=Resume%20Request`} className="btn btn-primary modal-btn">
                <i className="fas fa-file-download"></i>
                <span>Download Resume</span>
              </a>
            )}
            <a
              href={videoResumeUrl}
              className="btn btn-secondary modal-btn modal-btn-yt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-youtube yt-icon"></i>
              <span>Watch on YouTube</span>
            </a>
            <a href="/about" className="btn btn-secondary modal-btn" data-route="about">
              <i className="fas fa-user-circle"></i>
              <span>Full Profile</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Video Resume Modal ──────────────────────────── */}
      <div className="modal-overlay" id="modal-video-resume">
        <div className="modal-box modal-box-resume">
          <div className="modal-header-bar">
            <div className="modal-header-left">
              <div className="modal-icon-wrap modal-icon-blue modal-icon-compact">
                <i className="fas fa-play-circle"></i>
              </div>
              <div>
                <h2 className="modal-title modal-title-compact">Video Resume</h2>
                <p className="modal-subtitle" style={{ margin: 0, fontSize: '12px' }}>60 seconds &mdash; who I am, what I build</p>
              </div>
            </div>
            <div className="modal-header-right">
              <button type="button" className="modal-header-btn modal-close" aria-label="Close" title="Close">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="modal-video-card-wrap">
            <div className="modal-video-card">
              <img
                src="/static/images/hero.webp"
                alt="Roshan Damor Video Resume"
                className="modal-video-thumbnail"
                loading="eager"
              />
              <div className="modal-video-overlay">
                <div className="modal-video-top-tag">
                  <span className="pulse-indicator"></span>
                  <span>Video Resume &middot; 1:00 min</span>
                </div>
                <a
                  href={videoResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-video-play-btn"
                  aria-label="Watch Video Presentation on YouTube"
                  title="Watch on YouTube"
                >
                  <div className="play-pulse-ring"></div>
                  <i className="fas fa-play"></i>
                </a>
                <div className="modal-video-bottom-info">
                  <span className="modal-video-category">ENGINEERING PRESENTATION</span>
                  <h3 className="modal-video-title">Full Stack Systems, SaaS &amp; AI Architecture</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions modal-actions-resume">
            {resumeUrl ? (
              <a href={resumeUrl} download="Roshan_Damor_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-btn">
                <i className="fas fa-file-download"></i>
                <span>Download Resume</span>
              </a>
            ) : (
              <a href={`mailto:${email}?subject=Resume%20Request`} className="btn btn-primary modal-btn">
                <i className="fas fa-file-download"></i>
                <span>Download Resume</span>
              </a>
            )}
            <a
              href={videoResumeUrl}
              className="btn btn-secondary modal-btn modal-btn-yt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-youtube yt-icon"></i>
              <span>Watch on YouTube</span>
            </a>
            <a href={`mailto:${email}`} className="btn btn-secondary modal-btn">
              <i className="fas fa-paper-plane"></i>
              <span>Contact Me</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Rexi AI Chat Modal ──────────────────────────── */}
      <div className="modal-overlay" id="modal-rexi">
        <div className="modal-box modal-box-rexi">
          <div className="modal-header-bar modal-rexi-header">
            <div className="modal-header-left modal-rexi-header-left">
              <div className="modal-icon-wrap modal-icon-green modal-icon-compact">
                <i className="fas fa-dragon"></i>
              </div>
              <h2 className="modal-title modal-title-compact">Ask Rexi</h2>
              <span className="rexi-model-badge">Qwen3-0.6B</span>
            </div>
            <div className="modal-header-right modal-rexi-header-right">
              <button
                type="button"
                className="modal-header-btn modal-expand-btn"
                id="rexi-fullscreen-btn"
                aria-label="Full Page View"
                title="Full Page View"
              >
                <i className="fas fa-expand"></i>
              </button>
              <button
                type="button"
                className="modal-header-btn modal-close"
                aria-label="Close"
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div className="modal-chat">
            <div className="chat-messages" id="rexi-messages">
              <div className="chat-msg chat-msg-bot">
                <div className="chat-avatar">
                  <i className="fas fa-dragon"></i>
                </div>
                <div className="chat-bubble">
                  Hey! 👋 I&apos;m Rexi, Roshan&apos;s AI assistant powered by ⚡ <b>Qwen3-0.6B</b>. Ask me about his skills, projects, experience, or anything else!
                </div>
              </div>
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                id="rexi-input"
                placeholder="Ask me something..."
                autoComplete="off"
              />
              <button
                className="chat-send-btn"
                id="rexi-send"
                type="button"
                aria-label="Send message to Rexi"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
