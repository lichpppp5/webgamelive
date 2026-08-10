import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import HeroBanner from '../components/HeroBanner';
import { categories } from '../data/mockData';
import './Home.css';

// Skeleton loading card
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ aspectRatio: '1/1', width: '100%', borderRadius: 0 }} />
    <div className="skeleton-info">
      <div className="skeleton" style={{ height: '12px', width: '60px', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
    </div>
  </div>
);

const SORT_OPTIONS = [
  { value: 'newest', label: '🆕 Mới nhất' },
  { value: 'downloads', label: '🔥 Lượt tải nhiều nhất' },
  { value: 'price-asc', label: '💰 Giá tăng dần' },
  { value: 'price-desc', label: '💎 Giá giảm dần' },
];

const Home = () => {
  const outletCtx = useOutletContext();
  const searchQuery = outletCtx?.searchQuery || '';

  const [activeCategory, setActiveCategory] = useState('all');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

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

  const filteredAndSorted = useMemo(() => {
    let result = [...games];

    // Category filter
    if (activeCategory !== 'all') {
      const catName = categories.find(c => c.id === activeCategory)?.name;
      result = result.filter(g => g.category === catName);
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
        // Keep natural order (latest added first from API)
        break;
    }

    return result;
  }, [games, activeCategory, searchQuery, sortBy]);

  // Sản phẩm HOT — dùng cho slideshow HeroBanner
  const hotGames = useMemo(() => games.filter(g => g.isHot), [games]);

  return (
    <div className="home-page container page-enter" id="product-section">
      <div className="dashboard-layout">
        <Sidebar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          games={games}
        />

        <div className="main-content-area">
          <HeroBanner hotGames={hotGames} />

          {/* Top Bar */}
          <div className="top-bar">
            <div className="result-info">
              {loading ? (
                <div className="skeleton" style={{ height: '16px', width: '160px', borderRadius: '4px' }} />
              ) : (
                <>
                  {searchQuery && (
                    <span className="search-tag">
                      🔍 "{searchQuery}"
                    </span>
                  )}
                  <span className="result-count">
                    <strong style={{ color: 'var(--primary)' }}>{filteredAndSorted.length}</strong> sản phẩm
                  </span>
                </>
              )}
            </div>

            <div className="top-bar-actions">
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                id="sort-select"
                aria-label="Sắp xếp sản phẩm"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredAndSorted.length > 0 ? (
            <div className="product-grid">
              {filteredAndSorted.map((game, i) => (
                <div key={game.id} className="card-enter" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard product={game} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>
                {searchQuery
                  ? `Không có kết quả cho "${searchQuery}". Thử từ khóa khác nhé!`
                  : 'Danh mục này chưa có sản phẩm nào.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
