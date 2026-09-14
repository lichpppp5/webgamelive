import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Star, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  Wrench, 
  Headphones, 
  Sparkles, 
  AppWindow, 
  Gamepad2, 
  Clock 
} from 'lucide-react';
import ContactModal from './ContactModal';
import { useSettings } from '../context/AppContext';
import './HeroBanner.css';

const DEFAULT_FALLBACK_SLIDES = [
  {
    id: 'game-bar-dj',
    tabLabel: 'Game Tương Tác',
    title: 'Game Bar DJ Tương Tác Livestream',
    category: 'Game Tương Tác',
    tagline: 'Âm thanh sống động, hiệu ứng trực quan kết nối phòng chat tự động mượt mà',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
    badge: '⚡ Hot Trend',
    version: 'v2.1 VN',
    platform: 'Web / Desktop',
    rating: 4.8,
    downloads: 1850,
    link: '/?category=tuong-tac'
  },
  {
    id: 'tool-tien-ich-pro',
    tabLabel: 'Tools Tiện Ích',
    title: 'Bộ Tool Tiện Ích Tối Ưu Hóa & Tương Tác Đa Kênh',
    category: 'Tools Tiện Ích',
    tagline: 'Kịch bản kéo thả thông minh, mô phỏng thao tác người dùng chuẩn 100%',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    badge: '⭐ Tiện Ích Đỉnh Cao',
    version: 'v4.0 Pro',
    platform: 'Windows / VPS',
    rating: 5.0,
    downloads: 3200,
    link: '/?category=tools-tien-ich'
  },
  {
    id: 'tool-afk-keeper',
    tabLabel: 'Treo AFK',
    title: 'Tool Giữ Kết Nối & Tự Động Treo AFK 24/7',
    category: 'Treo AFK',
    tagline: 'Tiết kiệm 90% tài nguyên CPU/RAM, chống ngắt kết nối tự động an toàn',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    badge: '🕒 Ổn Định 24/7',
    version: 'v1.5',
    platform: 'Windows / Web',
    rating: 4.9,
    downloads: 1420,
    link: '/?category=treo-afk'
  }
];

const HeroBanner = ({ hotGames = [], allProducts = [], softwareList = [], totalProducts = 0, onSelectCategory }) => {
  const { contactSettings } = useSettings();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Pool of available products (combining hot games and all products)
  const pool = useMemo(() => {
    const combined = [...hotGames];
    allProducts.forEach(p => {
      if (!combined.some(c => c.id === p.id)) {
        combined.push(p);
      }
    });
    return combined;
  }, [hotGames, allProducts]);

  // Construct dynamic showcase slides exclusively from REAL items in database
  const slides = useMemo(() => {
    const list = [];

    // 1. If user has real software in softwareList, add it first!
    if (softwareList && softwareList.length > 0) {
      softwareList.slice(0, 2).forEach(sw => {
        list.push({
          id: sw.id,
          tabLabel: 'Phần Mềm',
          title: sw.title,
          category: 'Phần Mềm',
          tagline: sw.tagline || sw.description?.replace(/<[^>]*>?/gm, '').slice(0, 80) || 'Phần mềm tiện ích máy tính chất lượng cao',
          image: sw.media || '',
          mediaType: sw.mediaType || 'image',
          badge: sw.badge || '🔥 Phần Mềm Hot',
          version: sw.version || 'v1.0',
          platform: sw.platform || 'Windows 10/11 (64-bit)',
          rating: 4.9,
          downloads: sw.downloads || 0,
          link: '/?category=phan-mem'
        });
      });
    }

    // 2. Add real products by category from pool
    const targetCats = [
      { cat: 'Tương tác', label: 'Game Tương Tác' },
      { cat: 'Tools Tiện Ích', label: 'Tools Tiện Ích' },
      { cat: 'Treo AFK', label: 'Treo AFK' },
      { cat: 'Tools Sưu Tầm', label: 'Tools Sưu Tầm' },
    ];

    targetCats.forEach(({ cat, label }) => {
      const match = pool.find(g => {
        if (cat === 'Tools Tiện Ích') {
          return g.category === 'Tools Tiện Ích' || g.category === 'Tools MMO';
        }
        return g.category === cat;
      });

      if (match && !list.some(item => item.id === match.id)) {
        const cleanCat = match.category === 'Tools MMO' ? 'Tools Tiện Ích' : match.category;
        const cleanTitle = match.title?.replace(/\bMMO\b/gi, 'Tiện Ích').replace(/\(MMO\)/gi, '').trim();
        const cleanDesc = match.description?.replace(/<[^>]*>?/gm, '').replace(/\bMMO\b/gi, 'tiện ích').slice(0, 80);

        list.push({
          id: match.id,
          tabLabel: label,
          title: cleanTitle,
          category: cleanCat,
          tagline: cleanDesc ? cleanDesc + '...' : 'Công cụ tiện ích chất lượng cao, vận hành bền bỉ',
          image: match.image,
          badge: match.isHot ? '🔥 Sản Phẩm HOT' : 'Mới Nhất',
          version: 'v' + (match.version || '2.0'),
          platform: 'Windows / Web',
          rating: 4.9,
          downloads: match.downloads || 0,
          link: `/product/${match.id}`
        });
      }
    });

    // 3. If list has fewer than 2 items, fill with remaining pool items
    if (list.length < 3) {
      pool.forEach(p => {
        if (list.length < 4 && !list.some(item => item.id === p.id)) {
          const cleanCat = p.category === 'Tools MMO' ? 'Tools Tiện Ích' : p.category;
          const cleanTitle = p.title?.replace(/\bMMO\b/gi, 'Tiện Ích').replace(/\(MMO\)/gi, '').trim();
          const cleanDesc = p.description?.replace(/<[^>]*>?/gm, '').replace(/\bMMO\b/gi, 'tiện ích').slice(0, 80);

          list.push({
            id: p.id,
            tabLabel: cleanCat || 'Nổi Bật',
            title: cleanTitle,
            category: cleanCat || 'Tools Tiện Ích',
            tagline: cleanDesc ? cleanDesc + '...' : 'Công cụ tiện ích hỗ trợ tối ưu hiệu suất',
            image: p.image,
            badge: '🔥 Tiêu Biểu',
            version: 'v1.0',
            platform: 'Windows / Web',
            rating: 4.9,
            downloads: p.downloads || 0,
            link: `/product/${p.id}`
          });
        }
      });
    }

    // 4. If pool and software are both empty (e.g. initial fetch delay), use safe default slides
    return list.length > 0 ? list : DEFAULT_FALLBACK_SLIDES;
  }, [pool, softwareList]);

  // Reset img error when slide changes
  useEffect(() => {
    setImgError(false);
  }, [currentIdx]);

  const goTo = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setImgError(false);
      setIsTransitioning(false);
    }, 200);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    if (!slides || slides.length === 0) return;
    goTo((currentIdx + 1) % slides.length);
  }, [currentIdx, slides, goTo]);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext, slides]);

  const safeIdx = Math.min(currentIdx, Math.max(0, (slides?.length || 1) - 1));
  const currentSlide = (slides && slides.length > 0) ? (slides[safeIdx] || slides[0]) : DEFAULT_FALLBACK_SLIDES[0];

  const handleExploreClick = () => {
    const el = document.getElementById('product-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSlideClick = (slide) => {
    if (!slide) return;
    if (slide.category === 'Phần Mềm') {
      if (onSelectCategory) onSelectCategory('phan-mem');
      else navigate('/?category=phan-mem');
    } else {
      navigate(slide.link || `/product/${slide.id}`);
    }
  };

  const isVideo = Boolean(currentSlide?.image && (currentSlide.image.endsWith('.mp4') || currentSlide.image.endsWith('.webm')));

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

            {/* Dynamic Real Category Tabs */}
            <div className="window-tab-bar">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  className={`win-tab-btn ${currentIdx === idx ? 'active' : ''}`}
                  onClick={() => goTo(idx)}
                >
                  <span>{slide.tabLabel}</span>
                  {idx === currentIdx && <span className="tab-indicator" />}
                </button>
              ))}
            </div>

            {/* Main Showcase Viewport */}
            {currentSlide ? (
              <div 
                className={`window-viewport ${isTransitioning ? 'fading' : ''}`}
                onClick={() => handleSlideClick(currentSlide)}
              >
                <div className="viewport-image-wrap">
                  {!imgError && currentSlide.image ? (
                    isVideo ? (
                      <video
                        src={currentSlide.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="viewport-img"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <img
                        src={currentSlide.image}
                        alt=""
                        className="viewport-img"
                        loading="eager"
                        onError={() => setImgError(true)}
                      />
                    )
                  ) : (
                    <div className="viewport-fallback-graphic">
                      <div className="fallback-aura" />
                      <div className="fallback-icon">
                        {currentIdx === 0 && <AppWindow size={36} />}
                        {currentIdx === 1 && <Gamepad2 size={36} />}
                        {currentIdx === 2 && <Wrench size={36} />}
                        {currentIdx === 3 && <Clock size={36} />}
                      </div>
                      <span className="fallback-text">{currentSlide.title}</span>
                    </div>
                  )}
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
                      <span className="review-count">({(currentSlide.downloads || 0).toLocaleString()}+ tải)</span>
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
            ) : (
              <div className="window-viewport empty-viewport">
                <div className="empty-catalog-state" style={{ padding: '3rem 1.5rem' }}>
                  <Zap size={32} color="var(--primary)" />
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-300)' }}>Hệ thống công cụ &amp; tiện ích sẵn sàng vận hành.</p>
                </div>
              </div>
            )}

            {/* Slide Navigation Dots */}
            {slides.length > 1 && (
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
            )}
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
