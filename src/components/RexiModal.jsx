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
      {/* ── Resume Modal ────────────────────────────────── */}
      <div className="modal-overlay" id="modal-resume">
        <div className="modal-box">
          {/* Sticky header bar with icon + title + close button */}
          <div className="modal-header-bar">
            <div className="modal-header-left">
              <div className="modal-icon-wrap modal-icon-compact">
                <i className="fas fa-file-alt"></i>
              </div>
              <div>
                <h2 className="modal-title modal-title-compact">Resume</h2>
                <p className="modal-subtitle" style={{ margin: 0, fontSize: '12px' }}>{fullName} &mdash; {roleTitle}</p>
              </div>
            </div>
            <div className="modal-header-right">
              <button type="button" className="modal-header-btn modal-close" aria-label="Close" title="Close">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          {/* Resume rows */}
          <div className="modal-resume-preview" style={{ marginTop: '4px' }}>
            <div className="resume-row">
              <span className="resume-label">Name</span>
              <span className="resume-value">{fullName}</span>
            </div>
            <div className="resume-row">
              <span className="resume-label">Role</span>
              <span className="resume-value">{roleTitle}</span>
            </div>
            <div className="resume-row">
              <span className="resume-label">Core Tech</span>
              <span className="resume-value">Python &middot; Django &middot; React &middot; PostgreSQL &middot; Redis &middot; Celery</span>
            </div>
            <div className="resume-row">
              <span className="resume-label">Experience</span>
              <span className="resume-value">{yearsExp} Engineering Work</span>
            </div>
            <div className="resume-row">
              <span className="resume-label">Location</span>
              <span className="resume-value">{location}</span>
            </div>
          </div>
          <div className="modal-actions">
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-btn">
                <i className="fas fa-download"></i> Download PDF
              </a>
            ) : (
              <a href={`mailto:${email}`} className="btn btn-primary modal-btn">
                <i className="fas fa-download"></i> Request PDF
              </a>
            )}
            <a href="/about" className="btn btn-secondary modal-btn" data-route="about">
              <i className="fas fa-eye"></i> Full Profile
            </a>
          </div>
        </div>
      </div>

      {/* ── Video Resume Modal ──────────────────────────── */}
      <div className="modal-overlay" id="modal-video-resume">
        <div className="modal-box">
          {/* Sticky header bar with icon + title + close button */}
          <div className="modal-header-bar">
            <div className="modal-header-left">
              <div className="modal-icon-wrap modal-icon-purple modal-icon-compact">
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
          {/* Video placeholder */}
          <div className="modal-video-wrap" style={{ marginTop: '8px' }}>
            <div className="modal-video-placeholder">
              <div className="video-play-btn"><i className="fas fa-play"></i></div>
              <p className="video-placeholder-text">Video Resume &middot; 1:00 min</p>
            </div>
          </div>
          <div className="modal-actions">
            <a
              href={videoResumeUrl}
              className="btn btn-primary modal-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-youtube"></i> Watch on YouTube
            </a>
            <a href={`mailto:${email}`} className="btn btn-secondary modal-btn">
              <i className="fas fa-paper-plane"></i> Contact Me
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
