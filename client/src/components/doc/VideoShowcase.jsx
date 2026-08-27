import React, { useState, useRef } from 'react';

export default function VideoShowcase({ 
  videoSrc, 
  posterSrc, 
  title = 'Platform Walkthrough & Live Demo', 
  duration = '03:45',
  resolution = '1080p 60fps' 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="doc-video-card">
      <div className="doc-video-header">
        <div>
          <span className="doc-badge-pill">
            <i className="fas fa-video"></i> Production Video Walkthrough
          </span>
          <h4 className="doc-video-title">{title}</h4>
        </div>
        <div className="doc-video-meta-pills">
          <span className="doc-video-pill"><i className="far fa-clock"></i> {duration}</span>
          <span className="doc-video-pill"><i className="fas fa-hd"></i> {resolution}</span>
        </div>
      </div>

      <div className="doc-video-player-wrap">
        {videoSrc ? (
          <video 
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            controls
            className="doc-video-element"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="doc-video-simulated" style={{ backgroundImage: `url(${posterSrc || '/static/images/cardflow-banner.webp'})` }}>
            <div className="doc-video-overlay-tint">
              <button 
                className="doc-video-play-btn"
                onClick={togglePlay}
                aria-label="Play video walkthrough"
              >
                <i className="fas fa-play"></i>
              </button>
              <div className="doc-video-sim-badge">
                <span className="sim-pulse"></span>
                <span>Interactive Video Demo Container</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
