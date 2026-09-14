import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Zap, RefreshCw, Star, Download, ChevronRight, CheckCircle2, Wrench, Headphones, Sparkles, ExternalLink } from 'lucide-react';
import ContactModal from './ContactModal';
import { useSettings } from '../context/AppContext';
import './HeroBanner.css';

const SLIDE_INTERVAL = 4500;

const HeroBanner = ({ hotGames = [], totalProducts = 0, onSelectCategory }) => {
  const { contactSettings } = useSettings();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Enhanced showcase slides (use hot items, fallback to curated high-quality showcase items)
  const defaultShowcase = [
    {
      id: 'sw-featured',
      title: 'Phần Mềm Quản Lý & Tự Động Hóa All-In-One',
      category: 'Phần Mềm',
      tagline: 'Đa luồng tốc độ cao, Fake Fingerprint thông minh, tích hợp Proxy xoay IP',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
      badge: '🔥 Đề Xuất Số 1',
      version: 'v3.8.2',
      platform: 'Windows 10/11 (64-bit)',
      rating: 4.9,
      downloads: 2480,
      link: '/?category=phan-mem'
    },
    {
      id: 'game-bar-dj',
      title: 'Game Bar DJ Tương Tác Trực Tiếp',
      category: 'Game Tương Tác',
      tagline: 'Hiệu ứng âm thanh ánh sáng sống động, kết nối phòng chat tự động mượt mà',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
      badge: '⚡ Hot Trend',
      version: 'v2.1 VN',
      platform: 'Web / Desktop',
      rating: 4.8,
      downloads: 1850,
      link: '/product/game-bar-dj'
    },
    {
      id: 'tool-auto-pro',
      title: 'Tool Tiện Ích Tối Ưu Tương Tác & Lướt Feed',
      category: 'Tools Tiện Ích',
      tagline: 'Kịch bản kéo thả thông minh, mô phỏng thao tác người dùng chuẩn 100%',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      badge: '⭐ Tiện Ích Đỉnh Cao',
      version: 'v4.0 Pro',
      platform: 'Windows / VPS',
      rating: 5.0,
      downloads: 3200,
      link: '/product/tool-auto-pro'
    }
  ];

  const slides = hotGames.length > 0
    ? hotGames.map((g, i) => ({
        id: g.id || `hot-${i}`,
        title: g.title,
        category: g.category || 'Công cụ nổi bật',
        tagline: g.description?.replace(/<[^>]*>?/gm, '').slice(0, 75) + '...' || 'Công cụ tiện ích cao cấp được cập nhật liên tục',
        image: g.image || defaultShowcase[0].image,
        badge: g.isHot ? '🔥 Sản Phẩm HOT' : 'Mới Nhất',
        version: 'v' + (g.version || '2.5'),
        platform: 'Windows / Web',
        rating: 4.9,
        downloads: g.downloads || 950,
        link: `/product/${g.id}`
      }))
    : defaultShowcase;

  const goTo = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsTransitioning(false);
    }, 250);
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

  const handleExploreClick = () => {
    const el = document.getElementById('product-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSlideClick = (slide) => {
    if (slide.category === 'Phần Mềm') {
      if (onSelectCategory) onSelectCategory('phan-mem');
      else navigate('/?category=phan-mem');
    } else {
      navigate(slide.link || `/product/${slide.id}`);
    }
  };

  return (
    <div className="hero-product-showcase">
      {/* Dynamic Background Auras */}
      <div className="hero-aura aura-cyan" />
      <div className="hero-aura aura-purple" />
      <div className="hero-aura aura-center" />

      {/* Main Showcase Stage */}
      <div className="hero-stage container">
        {/* Left Column: Product Value Proposition */}
        <div className="hero-copy-column">
          <div className="hero-pill-badge">
            <span className="pill-dot-pulse" />
            <Sparkles size={14} className="pill-icon" />
            <span>HỆ SINH THÁI TOOLS &amp; PHẦN MỀM TIỆN ÍCH HÀNG ĐẦU</span>
          </div>

          <h1 className="hero-main-title">
            Kho Công Cụ, Game Tương Tác &amp; <span className="text-gradient">Phần Mềm</span> Đỉnh Cao
          </h1>

          <p className="hero-sub-description">
            Cung cấp các giải pháp phần mềm tự động hóa, bộ công cụ tiện ích đa năng và tựa game tương tác thế hệ mới. Tối ưu hiệu năng 10x, an toàn dữ liệu và cập nhật tính năng liên tục.
          </p>

          <div className="hero-action-buttons">
            <button
              type="button"
              className="btn-showcase-primary"
              onClick={handleExploreClick}
              id="hero-explore-btn"
            >
              <span>Khám Phá Kho Sản Phẩm</span>
              <ArrowRight size={18} className="btn-arrow" />
            </button>

            <button
              type="button"
              className="btn-showcase-secondary"
              onClick={() => setIsModalOpen(true)}
              id="hero-contact-btn"
            >
              <MessageSquare size={17} />
              <span>Tư Vấn &amp; Đặt Làm Riêng</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="hero-value-pills">
            <div className="value-pill">
              <Zap size={14} className="val-icon cyan" />
              <span>Tối ưu 10x tốc độ</span>
            </div>
            <div className="value-pill">
              <ShieldCheck size={14} className="val-icon green" />
              <span>100% Đã quét sạch mã độc</span>
            </div>
            <div className="value-pill">
              <RefreshCw size={14} className="val-icon purple" />
              <span>Cập nhật liên tục</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive App Mockup Frame (Showcase Deck) */}
        <div className="hero-visual-column">
          {/* Floating Glass Widget: Top Right */}
          <div className="floating-glass-badge float-top-right">
            <div className="floating-icon-wrap shield-wrap">
              <ShieldCheck size={18} />
            </div>
            <div className="floating-text">
              <strong>Bảo Mật Cao Cấp</strong>
              <span>Chống quét &amp; An toàn 100%</span>
            </div>
          </div>

          {/* The macOS Style Application Window Frame */}
          <div className="showcase-app-window">
            {/* Window Header */}
            <div className="window-header">
              <div className="window-controls">
                <span className="win-dot dot-close" />
                <span className="win-dot dot-minimize" />
                <span className="win-dot dot-maximize" />
              </div>
              <div className="window-title-bar">
                <span className="win-title">toollive-showcase-hub.app</span>
                <span className="win-status-badge">
                  <span className="status-dot" />
                  LIVE • v3.8
                </span>
              </div>
            </div>

            {/* Quick Filter Switchers Inside Window */}
            <div className="window-tab-bar">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  className={`win-tab-btn ${currentIdx === idx ? 'active' : ''}`}
                  onClick={() => goTo(idx)}
                >
                  <span>{s.category || `Mục ${idx + 1}`}</span>
                  {idx === currentIdx && <span className="tab-indicator" />}
                </button>
              ))}
            </div>

            {/* Main Showcase Viewport */}
            <div 
              className={`window-viewport ${isTransitioning ? 'fading' : ''}`}
              onClick={() => handleSlideClick(currentSlide)}
            >
              <div className="viewport-image-wrap">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="viewport-img"
                  loading="eager"
                />
                <div className="viewport-gradient-overlay" />
                <span className="viewport-badge-tag">{currentSlide.badge}</span>
                <div className="viewport-platform-tag">{currentSlide.platform}</div>
              </div>

              <div className="viewport-info-panel">
                <div className="viewport-meta-row">
                  <span className="viewport-cat">{currentSlide.category}</span>
                  <span className="viewport-rating">
                    <Star size={13} fill="currentColor" />
                    <span>{currentSlide.rating || 4.9}</span>
                    <span className="review-count">({(currentSlide.downloads || 900).toLocaleString()}+ tải)</span>
                  </span>
                </div>

                <h3 className="viewport-title">{currentSlide.title}</h3>
                <p className="viewport-tagline">{currentSlide.tagline}</p>

                <div className="viewport-footer-action">
                  <span className="view-detail-link">
                    <span>Xem Chi Tiết Sản Phẩm</span>
                    <ChevronRight size={16} />
                  </span>
                  <span className="quick-ver">{currentSlide.version}</span>
                </div>
              </div>
            </div>

            {/* Slide Navigation Dots */}
            <div className="window-dots-nav">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`win-nav-dot ${i === currentIdx ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                  aria-label={`Chuyển tới slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Floating Glass Widget: Bottom Left */}
          <div className="floating-glass-badge float-bottom-left">
            <div className="floating-icon-wrap zap-wrap">
              <Zap size={18} />
            </div>
            <div className="floating-text">
              <strong>Tự Động Đa Luồng</strong>
              <span>Tiết kiệm 80% thời gian</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Metric Counter Bar */}
      <div className="hero-metrics-container container">
        <div className="hero-metrics-grid">
          <div className="metric-box">
            <div className="metric-icon-box cyan-gradient">
              <Wrench size={22} />
            </div>
            <div className="metric-detail">
              <div className="metric-number">
                {totalProducts > 0 ? `${totalProducts}+` : '35+'}
              </div>
              <div className="metric-label">Công Cụ &amp; Giải Pháp</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-box green-gradient">
              <Download size={22} />
            </div>
            <div className="metric-detail">
              <div className="metric-number">
                {contactSettings?.visitCount
                  ? parseInt(contactSettings.visitCount, 10).toLocaleString('vi-VN') + '+'
                  : '15.000+'}
              </div>
              <div className="metric-label">Lượt Tải &amp; Sử Dụng</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-box purple-gradient">
              <CheckCircle2 size={22} />
            </div>
            <div className="metric-detail">
              <div className="metric-number">99.9%</div>
              <div className="metric-label">Độ Ổn Định &amp; Tương Thích</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-box orange-gradient">
              <Headphones size={22} />
            </div>
            <div className="metric-detail">
              <div className="metric-number">24/7</div>
              <div className="metric-label">Kỹ Thuật Viên Hỗ Trợ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productTitle="Tư vấn giải pháp Tools & Phần Mềm theo yêu cầu"
      />
    </div>
  );
};

export default HeroBanner;
