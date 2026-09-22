import React, { useState } from 'react';

export default function ImageLightbox({ images = [], title }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="doc-image-system-card">
      <div className="doc-image-header">
        <span className="doc-badge-pill">
          <i className="fas fa-images"></i> High-Resolution Screenshot Gallery
        </span>
        {title && <h4 className="doc-image-title">{title}</h4>}
      </div>

      <div className="doc-image-grid">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="doc-image-item"
            onClick={() => setSelectedImage(img)}
            role="button"
            tabIndex={0}
          >
            <div className="doc-image-thumbnail-wrap">
              <img src={img.src} alt={img.title || 'Screenshot'} loading="lazy" />
              <div className="doc-image-overlay">
                <i className="fas fa-search-plus"></i>
                <span>Enlarge View</span>
              </div>
            </div>
            <div className="doc-image-caption">
              <h6>{img.title}</h6>
              {img.caption && <p>{img.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="doc-lightbox-backdrop"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="doc-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="doc-lightbox-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close Lightbox"
            >
              <i className="fas fa-times"></i>
            </button>
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title || 'Enlarged screenshot'} 
              className="doc-lightbox-img" 
            />
            <div className="doc-lightbox-info">
              <h5>{selectedImage.title}</h5>
              {selectedImage.caption && <p>{selectedImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
