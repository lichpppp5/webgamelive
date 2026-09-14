import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Flame, 
  Layers, 
  Wrench, 
  Gamepad2, 
  Cpu, 
  AppWindow, 
  Clock, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Headphones, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  Download,
  Filter,
  Laptop
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import ArticleSlider from '../components/ArticleSlider';
import DisclaimerSection from '../components/DisclaimerSection';
import SoftwareShowcase from '../components/SoftwareShowcase';
import ContactModal from '../components/ContactModal';
import { categories } from '../data/mockData';
import { useSettings } from '../context/AppContext';
import './Home.css';

// Skeleton loading card
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ aspectRatio: '16/10', width: '100%', borderRadius: '12px' }} />
    <div className="skeleton-info" style={{ padding: '1rem' }}>
      <div className="skeleton" style={{ height: '12px', width: '60px', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '18px', width: '90%', borderRadius: '4px', marginTop: '8px' }} />
      <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px', marginTop: '6px' }} />
      <div className="skeleton" style={{ height: '38px', width: '100%', borderRadius: '8px', marginTop: '1rem' }} />
    </div>
  </div>
);

// Bulletproof media card with fallback for spotlight items
const SpotlightMediaCard = ({ src, tag, badgeClass = 'cyan' }) => {
  const [hasError, setHasError] = useState(false);
  const isVideo = src && (src.endsWith('.mp4') || src.endsWith('.webm'));

  return (
    <div className="spotlight-media-wrap">
      {!hasError && src ? (
        isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="spotlight-img"
            onError={() => setHasError(true)}
          />
        ) : (
          <img
            src={src}
            alt=""
            className="spotlight-img"
            onError={() => setHasError(true)}
          />
        )
      ) : (
        <div className="spotlight-fallback-media">
          <div className="fallback-glow" />
          <div className="fallback-icon-wrap">
            <Zap size={30} />
          </div>
          <span className="fallback-label">Tools &amp; Phần Mềm Tiện Ích</span>
        </div>
      )}
      <div className="spotlight-media-overlay" />
      {tag && <span className={`bento-tag ${badgeClass}`}>{tag}</span>}
    </div>
  );
};

const SORT_OPTIONS = [
  { value: 'newest', label: '🆕 Mới nhất' },
  { value: 'downloads', label: '🔥 Lượt tải nhiều nhất' },
  { value: 'price-asc', label: '💰 Mức đóng góp tăng dần' },
  { value: 'price-desc', label: '💎 Mức đóng góp giảm dần' },
];

const Home = ({ defaultCategory = 'all' }) => {
  const outletCtx = useOutletContext();
  const { contactSettings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = outletCtx?.searchQuery || '';

  const initialCat = searchParams.get('category') || defaultCategory;
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Software showcase data
  const [softwareList, setSoftwareList] = useState([]);
  const [softwareLoading, setSoftwareLoading] = useState(true);

  const fetchSoftware = () => {
    fetch('/api/software')
      .then(res => res.json())
      .then(data => {
        setSoftwareList(data || []);
        setSoftwareLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải phần mềm:', err);
        setSoftwareLoading(false);
      });
  };

  useEffect(() => {
    fetchSoftware();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== activeCategory) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải dữ liệu:', err);
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
    const section = document.getElementById('product-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...games];

    // Category filter
    if (activeCategory !== 'all' && activeCategory !== 'phan-mem') {
      const catName = categories.find(c => c.id === activeCategory)?.name;
      result = result.filter(g => {
        if (activeCategory === 'tools-tien-ich') {
          return g.category === 'Tools Tiện Ích' || g.category === 'Tools MMO';
        }
        return g.category === catName;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.title?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'downloads':
        result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        break;
    }

    return result;
  }, [games, activeCategory, searchQuery, sortBy]);

  // Flagship Hot items for Spotlight
  const hotGames = useMemo(() => games.filter(g => g.isHot), [games]);
  const spotlightItems = useMemo(() => {
    if (hotGames.length >= 3) return hotGames.slice(0, 3);
    return games.slice(0, 3);
  }, [hotGames, games]);

  // Helper icons for categories
  const getCategoryIcon = (id) => {
    switch (id) {
      case 'all': return <Layers size={16} />;
      case 'phan-mem': return <AppWindow size={16} />;
      case 'tuong-tac': return <Gamepad2 size={16} />;
      case 'tools-tien-ich': return <Wrench size={16} />;
      case 'tools-suu-tam': return <Cpu size={16} />;
      case 'treo-afk': return <Clock size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const getCategoryCount = (id) => {
    if (id === 'all') return games.length;
    if (id === 'phan-mem') return softwareList.length;
    if (id === 'tools-tien-ich') {
      return games.filter(g => g.category === 'Tools Tiện Ích' || g.category === 'Tools MMO').length;
    }
    const catName = categories.find(c => c.id === id)?.name;
    return games.filter(g => g.category === catName).length;
  };

  return (
    <div className="home-showcase-page page-enter">
      {/* 1. Hero Showcase Section */}
      <HeroBanner 
        hotGames={hotGames} 
        allProducts={games}
        softwareList={softwareList}
        totalProducts={games.length + softwareList.length} 
        onSelectCategory={handleCategoryChange}
      />

      {/* 1.5 Tech Ecosystem & Guarantee Trust Bar */}
      <section className="tech-ecosystem-bar container" aria-label="Hệ sinh thái & Tiêu chuẩn phần mềm">
        <div className="ecosystem-inner">
          <div className="eco-item">
            <div className="eco-icon-wrap cyan">
              <Laptop size={18} />
            </div>
            <div className="eco-text">
              <span className="eco-title">Tương Thích Mọi Windows</span>
              <span className="eco-sub">Win 10 &amp; 11 64-bit mượt mà</span>
            </div>
          </div>

          <div className="eco-divider" />

          <div className="eco-item">
            <div className="eco-icon-wrap green">
              <Zap size={18} />
            </div>
            <div className="eco-text">
              <span className="eco-title">Đa Luồng &amp; Tiết Kiệm RAM</span>
              <span className="eco-sub">Vận hành êm ái, tối ưu tài nguyên</span>
            </div>
          </div>

          <div className="eco-divider" />

          <div className="eco-item">
            <div className="eco-icon-wrap blue">
              <ShieldCheck size={18} />
            </div>
            <div className="eco-text">
              <span className="eco-title">Kiểm Định VirusTotal</span>
              <span className="eco-sub">100% Sạch mã độc, an toàn tuyệt đối</span>
            </div>
          </div>

          <div className="eco-divider" />

          <div className="eco-item">
            <div className="eco-icon-wrap purple">
              <RefreshCw size={18} />
            </div>
            <div className="eco-text">
              <span className="eco-title">Tự Động Cập Nhật</span>
              <span className="eco-sub">Bắt kịp thuật toán &amp; phiên bản mới</span>
            </div>
          </div>

          <div className="eco-divider" />

          <div className="eco-item">
            <div className="eco-icon-wrap orange">
              <Headphones size={18} />
            </div>
            <div className="eco-text">
              <span className="eco-title">Kỹ Thuật Hỗ Trợ 24/7</span>
              <span className="eco-sub">Cài đặt trực tiếp qua Ultraview</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Spotlight Cards (Flagship Showcase) */}
      {spotlightItems.length > 0 && activeCategory === 'all' && !searchQuery && (
        <section className="spotlight-showcase-section container">
          <div className="section-head-center">
            <div className="section-pill-tag">
              <Flame size={14} className="icon-pulse" />
              <span>SẢN PHẨM &amp; PHẦN MỀM TIÊU BIỂU</span>
            </div>
            <h2 className="section-title">Giải Pháp Đột Phá Được Ưa Chuộng Nhất</h2>
            <p className="section-desc">
              Những công cụ và phần mềm tiện ích có lượng tải cao nhất, được kiểm duyệt độ ổn định và mang lại giá trị thực tế vượt trội.
            </p>
          </div>

          <div className="spotlight-cards-grid">
            {spotlightItems.map((item, idx) => {
              const displayCategory = item.category === 'Tools MMO' ? 'Tools Tiện Ích' : (item.category || 'Tools Tiện Ích');
              const badgeLabel = idx === 0 ? '🔥 ĐƯỢC CHỌN NHIỀU NHẤT' : idx === 1 ? '⚡ TỐI ƯU TỐC ĐỘ' : '🛡️ AN TOÀN & ỔN ĐỊNH';
              const badgeClass = idx === 0 ? 'flame' : idx === 1 ? 'cyan' : 'green';

              return (
                <div 
                  key={item.id} 
                  className={`spotlight-item-card ${idx === 0 ? 'card-highlight' : ''}`}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <SpotlightMediaCard 
                    src={item.image} 
                    tag={badgeLabel}
                    badgeClass={badgeClass}
                  />

                  <div className="spotlight-card-body">
                    <div className="spotlight-meta-top">
                      <span className="spotlight-cat-tag">{displayCategory}</span>
                      <span className="spotlight-rating-pill">⭐ 4.9</span>
                    </div>

                    <h3 className="spotlight-card-title">{item.title}</h3>

                    <p className="spotlight-card-desc">
                      {item.description?.replace(/<[^>]*>?/gm, '').slice(0, 95) || 'Công cụ tiện ích chất lượng cao, tối ưu hiệu suất làm việc.'}...
                    </p>

                    <div className="spotlight-features-checklist">
                      <div className="spotlight-feat-item">
                        <CheckCircle2 size={14} />
                        <span>Vận hành đa luồng ổn định</span>
                      </div>
                      <div className="spotlight-feat-item">
                        <CheckCircle2 size={14} />
                        <span>Hỗ trợ cài đặt từ xa 24/7</span>
                      </div>
                    </div>

                    <div className="spotlight-card-footer">
                      <span className="spotlight-downloads-count">
                        <Download size={14} />
                        {(item.downloads || 850).toLocaleString()} lượt tải
                      </span>
                      <button type="button" className="btn-spotlight-action">
                        <span>Khám phá</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Catalog Section with Modern Pill Tabs */}
      <section className="catalog-showcase-section container" id="product-section">
        <div className="catalog-section-header">
          <div className="catalog-header-left">
            <div className="section-pill-tag">
              <Filter size={14} />
              <span>DANH MỤC TRỰC TUYẾN</span>
            </div>
            <h2 className="catalog-title">Kho Sản Phẩm &amp; Bộ Sưu Tập Công Cụ</h2>
          </div>

          {contactSettings?.marqueeText && (
            <div className="catalog-marquee-badge">
              <span className="marquee-dot" />
              <div className="marquee-text-scroll">
                <span>{contactSettings.marqueeText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modern Pill Tabs Category Filter */}
        <div className="category-pills-bar">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className={`cat-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span className="cat-pill-icon">{getCategoryIcon(cat.id)}</span>
                <span className="cat-pill-name">{cat.name}</span>
                {cat.id === 'phan-mem' && <span className="cat-hot-pill">Hot</span>}
                <span className="cat-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* View Switcher: Software Showcase or Product Grid */}
        {activeCategory === 'phan-mem' ? (
          <div className="software-view-wrapper">
            <SoftwareShowcase 
              softwareList={softwareList}
              loading={softwareLoading}
              onReload={fetchSoftware}
            />
          </div>
        ) : (
          <div className="catalog-content-wrapper">
            {/* Filter Sub-Bar */}
            <div className="catalog-sub-bar">
              <div className="catalog-results-count">
                {searchQuery ? (
                  <span className="search-query-tag">
                    🔍 Kết quả cho: <strong>"{searchQuery}"</strong>
                  </span>
                ) : (
                  <span>
                    Đang hiển thị <strong>{filteredAndSorted.length}</strong> công cụ
                  </span>
                )}
              </div>

              <div className="catalog-sort-wrap">
                <select
                  className="catalog-sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  id="sort-select"
                  aria-label="Sắp xếp danh sách"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="product-showcase-grid">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredAndSorted.length > 0 ? (
              <div className="product-showcase-grid">
                {filteredAndSorted.map((game, i) => (
                  <div key={game.id} className="card-enter" style={{ animationDelay: `${i * 0.04}s` }}>
                    <ProductCard product={game} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-catalog-state">
                <div className="empty-icon">🔍</div>
                <h3>Chưa tìm thấy công cụ phù hợp</h3>
                <p>
                  {searchQuery
                    ? `Không có kết quả nào khớp với "${searchQuery}". Hãy thử tìm với từ khóa khác.`
                    : 'Danh mục này hiện chưa có công cụ nào.'}
                </p>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => handleCategoryChange('all')}
                  style={{ marginTop: '1rem' }}
                >
                  Xem tất cả công cụ
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Why Choose Us (Ưu Điểm Vượt Trội - 4 Trụ Cột) */}
      <section className="features-showcase-section container" id="features-section">
        <div className="section-head-center">
          <div className="section-pill-tag">
            <ShieldCheck size={14} />
            <span>UY TÍN &amp; CHẤT LƯỢNG HÀNG ĐẦU</span>
          </div>
          <h2 className="section-title">Tại Sao Khách Hàng Lựa Chọn TOOL LIVE?</h2>
          <p className="section-desc">
            Chúng tôi cam kết mang tới những giải pháp tối ưu nhất, vận hành bền bỉ và đồng hành hỗ trợ kỹ thuật lâu dài.
          </p>
        </div>

        <div className="features-four-grid">
          <div className="feature-modern-card">
            <div className="feat-icon-bubble cyan">
              <Zap size={24} />
            </div>
            <h3 className="feat-card-title">Hiệu Năng Cực Đại</h3>
            <p className="feat-card-desc">
              Kiến trúc thuật toán đa luồng tối ưu, vận hành ổn định 24/7 mà không làm ngốn CPU hay dung lượng bộ nhớ RAM máy tính.
            </p>
          </div>

          <div className="feature-modern-card">
            <div className="feat-icon-bubble green">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feat-card-title">An Toàn Tuyệt Đối</h3>
            <p className="feat-card-desc">
              Mọi công cụ và phần mềm đều được quét kiểm tra mã độc qua VirusTotal trước khi đăng tải, nói không với backdoor.
            </p>
          </div>

          <div className="feature-modern-card">
            <div className="feat-icon-bubble purple">
              <RefreshCw size={24} />
            </div>
            <h3 className="feat-card-title">Cập Nhật Trọn Đời</h3>
            <p className="feat-card-desc">
              Đội ngũ liên tục bảo trì, khắc phục lỗi thuật toán và bổ sung tính năng mới thường xuyên theo sự biến động của thị trường.
            </p>
          </div>

          <div className="feature-modern-card">
            <div className="feat-icon-bubble orange">
              <Headphones size={24} />
            </div>
            <h3 className="feat-card-title">Hỗ Trợ Kỹ Thuật 24/7</h3>
            <p className="feat-card-desc">
              Kỹ thuật viên nhiệt tình hỗ trợ cài đặt, cấu hình trực tiếp qua Ultraview / Zalo / Telegram bất kể ngày đêm.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Custom Tool Request CTA Banner */}
      <section className="cta-banner-section container">
        <div className="cta-banner-card">
          <div className="cta-banner-content">
            <span className="cta-tag">🚀 DỊCH VỤ LẬP TRÌNH CHUYÊN NGHIỆP</span>
            <h2 className="cta-heading">Cần Phát Triển Tool, Game Hoặc Phần Mềm Theo Yêu Cầu Riêng?</h2>
            <p className="cta-paragraph">
              Bạn có ý tưởng độc đáo hoặc quy trình làm việc phức tạp cần tự động hóa? Đội ngũ lập trình viên chuyên nghiệp của chúng tôi sẵn sàng xây dựng giải pháp riêng biệt tối ưu theo đúng nhu cầu của bạn.
            </p>
            <div className="cta-btn-group">
              <button 
                type="button" 
                className="btn-cta-white" 
                onClick={() => setIsContactModalOpen(true)}
              >
                <MessageSquare size={17} />
                <span>Liên Hệ Đặt Hàng Ngay</span>
              </button>
              <button 
                type="button" 
                className="btn-cta-glass" 
                onClick={() => handleCategoryChange('phan-mem')}
              >
                <span>Xem Demo Phần Mềm</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="cta-banner-glow" />
        </div>
      </section>

      {/* 6. Articles & Documentation Slider */}
      <div className="container">
        <ArticleSlider />
      </div>

      {/* 7. Disclaimer Section */}
      <div className="container">
        <DisclaimerSection />
      </div>

      {/* Contact Support Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        productTitle="Yêu cầu lập trình công cụ / phần mềm theo yêu cầu"
      />
    </div>
  );
};

export default Home;
