import { useState, useEffect, useCallback } from 'react';
import ContactModal from './ContactModal';
import { useSettings } from '../context/AppContext';
import './HeroBanner.css';

const SLIDE_INTERVAL = 4000;

const HeroBanner = ({ hotGames = [] }) => {
  const { contactSettings } = useSettings();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const slides = hotGames.length > 0
    ? hotGames
    : [{ image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', title: 'MMO Tools', id: 'default' }];

  const goTo = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goTo((currentIdx + 1) % slides.length);
  }, [currentIdx, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext, slides.length]);

  const currentSlide = slides[currentIdx] || slides[0];

  return (
    <div className="hero-banner">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <div className="hero-particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Nền Tảng Tool - Game tương tác
        </div>
        <h1 className="hero-title">
          Công Cụ &amp; Giải Pháp <span className="text-gradient">MMO</span>
        </h1>
        <p className="hero-desc">
          Tối ưu thời gian, gia tăng hiệu suất với kho tool và game tương tác đa dạng.
          Hỗ trợ 24/7, cập nhật liên tục.
        </p>
        <div className="hero-cta">
          <button
            className="btn-primary hero-btn-primary"
            onClick={() => document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Khám phá ngay
          </button>
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)} 
            className="btn-outline hero-btn-outline"
          >
            Tư vấn miễn phí
          </button>
        </div>

        <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num text-gradient">20+</span>
            <span className="stat-label">Sản phẩm</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num text-gradient">
              {contactSettings?.visitCount ? parseInt(contactSettings.visitCount, 10).toLocaleString('vi-VN') : '1.250'}+
            </span>
            <span className="stat-label">Lượt truy cập</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num text-gradient">24/7</span>
            <span className="stat-label">Hỗ trợ</span>
          </div>
        </div>
      </div>

      {/* Slideshow Visual */}
      <div className="hero-visual">
        <div className="hero-img-container">
          <div className="hero-img-ring" />

          {/* Ảnh + badge gộp trong 1 wrapper có overflow:hidden */}
          <div className={`hero-slide ${isTransitioning ? 'fading' : ''}`}>
            <img
              key={currentSlide.id}
              src={currentSlide.image}
              alt={currentSlide.title || 'HOT Game'}
              className="hero-img"
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop';
              }}
            />
            {/* Badge nằm BÊN TRONG ảnh — tránh overflow ra ngoài */}
            <div className="hero-img-badge">
              <span>🔥</span>
              <span className="badge-title">{currentSlide.title || 'Đang HOT'}</span>
            </div>
          </div>

          {/* Dot indicators */}
          {slides.length > 1 && (
            <div className="hero-dots" aria-label="Chuyển slide">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  className={`hero-dot ${i === currentIdx ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}: ${s.title}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
