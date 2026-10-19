import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Zap, RefreshCw, Headphones, ArrowRight, MessageSquare,
  Download, Search, ChevronRight, ChevronLeft, Package, Users, Sparkles, X, Heart,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ArticleSlider from '../components/ArticleSlider';
import DisclaimerSection from '../components/DisclaimerSection';
import ContactModal from '../components/ContactModal';
import { openDonate } from '../utils/donate';
import { useSettings } from '../context/AppContext';
import { GROUPS, OTHER_GROUP, VIRTUAL_FILTERS, groupOf, filterFor, filterMeta } from '../data/catalog';
import './Home.css';
import './Storefront.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Tải nhiều nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
];
const FreeIcon = VIRTUAL_FILTERS['mien-phi'].icon;

// When was it published? Product ids are "g" + Date.now() and software ids "sw" + Date.now();
// software also has created_at. Falls back to 0 (sorted last).
const NEW_DAYS = 14;
const createdAtOf = (p) => {
  const m = String(p.id || '').match(/(\d{12,14})/);
  if (m) return Number(m[1]);
  const t = Date.parse(p.createdAt || p.created_at || '');
  return Number.isFinite(t) ? t : 0;
};

const ytThumbOf = (url) => {
  const m = url ? url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) : null;
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

// Image / video / YouTube thumbnail with a graceful fallback
const MediaThumb = ({ src, title, icon: Icon }) => {
  const [err, setErr] = useState(false);
  const yt = ytThumbOf(src);
  const isVideo = !yt && /\.(mp4|webm)(\?|$)/i.test(src || '');
  if (!src || err) {
    return (
      <div className="sf-thumb-fallback">
        {Icon && <Icon size={28} strokeWidth={1.6} />}
        {title && <span>{title}</span>}
      </div>
    );
  }
  return isVideo
    ? <video src={src} autoPlay loop muted playsInline preload="metadata" onError={() => setErr(true)} />
    : <img src={yt || src} alt="" loading="lazy" onError={() => setErr(true)} />;
};

// One horizontal, scroll-snapping row per group: compact overview, arrows on desktop
const ShelfRow = ({ children }) => {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: 'smooth' });
  return (
    <div className="sf-row-wrap">
      {!edge.start && <button type="button" className="sf-row-nav sf-row-prev" onClick={() => scroll(-1)} aria-label="Xem trước"><ChevronLeft size={20} /></button>}
      <div className="sf-row" ref={ref} onScroll={update}>{children}</div>
      {!edge.end && <button type="button" className="sf-row-nav sf-row-next" onClick={() => scroll(1)} aria-label="Xem tiếp"><ChevronRight size={20} /></button>}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="sf-skeleton">
    <div className="skeleton" style={{ aspectRatio: '16/10' }} />
    <div style={{ padding: '0.9rem 1rem' }}>
      <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4, marginTop: 8 }} />
      <div className="skeleton" style={{ height: 38, width: '100%', borderRadius: 10, marginTop: 14 }} />
    </div>
  </div>
);

const Home = ({ defaultCategory = 'all' }) => {
  const outletCtx = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = outletCtx?.searchQuery || '';
  const { contactSettings } = useSettings();
  const donateOn = contactSettings?.donateEnabled === 'true' && (contactSettings.donateQR || contactSettings.donateAccount);
  const setSearchQuery = outletCtx?.setSearchQuery;

  const activeCategory = searchParams.get('category') || defaultCategory || 'all';
  const [games, setGames] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()).catch(() => []),
      fetch('/api/software').then(r => r.json()).catch(() => []),
    ]).then(([products, software]) => {
      setGames(Array.isArray(products) ? products : []);
      setSoftwareList(Array.isArray(software) ? software : []);
      setLoading(false);
    });
  }, []);

  const goCategory = (catId, scroll = true) => {
    setSearchParams(catId === 'all' ? {} : { category: catId });
    if (scroll) {
      requestAnimationFrame(() => document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  // Products + software in one catalog (software normalised to the product shape)
  const catalog = useMemo(() => {
    const list = [...games];
    softwareList.forEach(sw => {
      if (list.some(g => g.id === sw.id)) return;
      list.push({
        id: sw.id,
        title: sw.title,
        description: sw.tagline || sw.description,
        price: sw.price || 0,
        oldPrice: 0,
        image: sw.media || '',
        category: 'Phần Mềm',
        downloads: sw.downloads || 0,
        isHot: Boolean(sw.badge),
        isFree: Boolean(sw.isFree),
        downloadLink: sw.downloadLink || '',
        version: sw.version || '',
        platform: sw.platform || '',
        isSoftware: true,
        createdAt: sw.created_at,
      });
    });
    return list;
  }, [games, softwareList]);

  const byPopularity = useMemo(() => [...catalog].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)), [catalog]);
  const byNewest = useMemo(() => [...catalog].sort((a, b) => createdAtOf(b) - createdAtOf(a)), [catalog]);
  const topIds = useMemo(() => new Set(byPopularity.slice(0, 3).filter(p => (p.downloads || 0) > 0).map(p => p.id)), [byPopularity]);
  const newIds = useMemo(() => {
    const cutoff = Date.now() - NEW_DAYS * 86400000;
    return new Set(catalog.filter(p => createdAtOf(p) > cutoff).map(p => p.id));
  }, [catalog]);
  // Card flags: "Mới" for recent uploads, "Top tải" for the 3 most downloaded
  const flagsOf = (p) => [newIds.has(p.id) && 'new', topIds.has(p.id) && 'top'].filter(Boolean);
  const totalDownloads = useMemo(() => catalog.reduce((s, p) => s + (p.downloads || 0), 0), [catalog]);

  // Non-empty groups, in display order, items sorted by popularity
  const shelves = useMemo(() => {
    const all = [...GROUPS, OTHER_GROUP];
    return all
      .map(g => ({ ...g, items: byNewest.filter(p => groupOf(p).id === g.id) }))  // newest first
      .filter(g => g.items.length > 0);
  }, [byNewest]);
  const freeItems = useMemo(() => byNewest.filter(VIRTUAL_FILTERS['mien-phi'].filter), [byNewest]);

  // Hero mosaic: best item with media from three different groups
  const mosaic = useMemo(() => {
    const picks = [];
    for (const g of shelves) {
      const it = byPopularity.find(p => p.image && groupOf(p).id === g.id); // showcase the best-known item
      if (it) picks.push({ item: it, group: g });
      if (picks.length === 3) break;
    }
    for (const p of byPopularity) {
      if (picks.length >= 3) break;
      if (p.image && !picks.some(x => x.item.id === p.id)) picks.push({ item: p, group: groupOf(p) });
    }
    return picks;
  }, [shelves, byPopularity]);

  const isCatalogMode = activeCategory !== 'all' || Boolean(searchQuery.trim());

  const catalogItems = useMemo(() => {
    let result = catalog.filter(filterFor(activeCategory));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        groupOf(p).name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        String(p.description || '').replace(/<[^>]*>?/gm, ' ').toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'popular': result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0)); break;
      case 'price-asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'newest': result.sort((a, b) => createdAtOf(b) - createdAtOf(a)); break;
      default: break;
    }
    return result;
  }, [catalog, activeCategory, searchQuery, sortBy]);

  const filterPills = useMemo(() => {
    const pills = [{ ...VIRTUAL_FILTERS.all, count: catalog.length }];
    shelves.forEach(g => pills.push({ id: g.id, short: g.short, icon: g.icon, count: g.items.length }));
    if (freeItems.length) pills.push({ ...VIRTUAL_FILTERS['mien-phi'], count: freeItems.length });
    if (activeCategory === 'tools-game') pills.splice(1, 0, { ...VIRTUAL_FILTERS['tools-game'], count: catalog.filter(VIRTUAL_FILTERS['tools-game'].filter).length });
    return pills;
  }, [catalog, shelves, freeItems, activeCategory]);

  const activeMeta = filterMeta(activeCategory);

  return (
    <div className="home-showcase-page sf-page page-enter">
      {/* ── 1. HERO ── */}
      <section className="sf-hero">
        <div className="container sf-hero-inner">
          <div className="sf-hero-copy">
            <span className="sf-eyebrow"><Sparkles size={14} /> Kho tools &amp; game livestream cho creator</span>
            <h1 className="sf-hero-title">
              Tools, Game Livestream <br className="sf-br" />&amp; <span className="sf-grad">Phần Mềm</span> tự động hoá
            </h1>
            <p className="sf-hero-sub">
              Game tương tác TikTok Live, tool MMO bán hàng và phần mềm tiện ích — tải về dùng ngay,
              được hỗ trợ cài đặt tận nơi.
            </p>
            <div className="sf-hero-cta">
              <button type="button" className="sf-btn sf-btn-primary" onClick={() => document.getElementById('sf-browse')?.scrollIntoView({ behavior: 'smooth' })}>
                Khám phá sản phẩm <ArrowRight size={17} />
              </button>
              <button type="button" className="sf-btn sf-btn-ghost" onClick={() => setIsContactModalOpen(true)}>
                <MessageSquare size={17} /> Tư vấn &amp; đặt làm riêng
              </button>
            </div>
            <div className="sf-hero-stats">
              <div><strong>{loading ? '—' : catalog.length}</strong><span>sản phẩm</span></div>
              <div><strong>{loading ? '—' : totalDownloads.toLocaleString('vi-VN')}+</strong><span>lượt tải</span></div>
              <div><strong>24/7</strong><span>hỗ trợ cài đặt</span></div>
            </div>
          </div>

          <div className="sf-mosaic" aria-label="Sản phẩm tiêu biểu">
            {loading
              ? [0, 1, 2].map(i => <div key={i} className={`sf-mosaic-tile sf-tile-${i} skeleton`} />)
              : mosaic.map(({ item, group }, i) => (
                <button key={item.id} type="button" className={`sf-mosaic-tile sf-tile-${i} sf-tone-${group.tone}`} onClick={() => navigate(`/product/${item.id}`)}>
                  <MediaThumb src={item.image} title={item.title} icon={group.icon} />
                  <span className="sf-mosaic-caption">
                    <span className="sf-mosaic-chip"><group.icon size={12} />{group.short}</span>
                    <span className="sf-mosaic-title">{item.title}</span>
                    <span className="sf-mosaic-dl"><Download size={12} />{(item.downloads || 0).toLocaleString('vi-VN')} lượt tải</span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* ── 2. BROWSE BY CATEGORY ── */}
      <section className="container sf-browse" id="sf-browse">
        <div className="sf-section-head">
          <div>
            <h2 className="sf-h2">Bạn đang tìm gì?</h2>
            <p className="sf-sub">Chọn nhóm sản phẩm phù hợp với nhu cầu của bạn</p>
          </div>
        </div>
        <div className="sf-cat-grid">
          {(loading ? GROUPS.slice(0, 4) : shelves).map(g => (
            <button key={g.id} type="button" className={`sf-cat-tile sf-tone-${g.tone} ${activeCategory === g.id ? 'is-active' : ''}`} onClick={() => goCategory(g.id)}>
              <span className="sf-cat-icon"><g.icon size={22} /></span>
              <span className="sf-cat-text">
                <span className="sf-cat-name">{g.name}</span>
                <span className="sf-cat-desc">{g.desc}</span>
              </span>
              <span className="sf-cat-foot">
                <span className="sf-cat-count">{loading ? '…' : `${g.items.length} sản phẩm`}</span>
                <ChevronRight size={18} className="sf-cat-arrow" />
              </span>
            </button>
          ))}
          {!loading && freeItems.length > 0 && (
            <button type="button" className={`sf-cat-tile sf-tone-green sf-cat-free ${activeCategory === 'mien-phi' ? 'is-active' : ''}`} onClick={() => goCategory('mien-phi')}>
              <span className="sf-cat-icon"><FreeIcon size={22} /></span>
              <span className="sf-cat-text">
                <span className="sf-cat-name">{VIRTUAL_FILTERS['mien-phi'].name}</span>
                <span className="sf-cat-desc">{VIRTUAL_FILTERS['mien-phi'].desc}</span>
              </span>
              <span className="sf-cat-foot"><span className="sf-cat-count">{freeItems.length} sản phẩm</span><ChevronRight size={18} className="sf-cat-arrow" /></span>
            </button>
          )}
        </div>
      </section>

      {/* ── 3. PRODUCTS: shelves on the home page, a filtered grid otherwise ── */}
      <section className="container sf-products" id="product-section">
        {isCatalogMode ? (
          <>
            <div className="sf-section-head sf-catalog-head">
              <div>
                <h2 className="sf-h2">{searchQuery.trim() ? <>Kết quả tìm kiếm “{searchQuery.trim()}”</> : activeMeta.name}</h2>
                <p className="sf-sub">
                  {loading ? 'Đang tải…' : `${catalogItems.length} sản phẩm`}
                  {activeMeta.desc && !searchQuery.trim() ? ` · ${activeMeta.desc}` : ''}
                </p>
              </div>
              <div className="sf-catalog-tools">
                {searchQuery.trim() && setSearchQuery && (
                  <button type="button" className="sf-clear" onClick={() => setSearchQuery('')}><X size={14} /> Xoá tìm kiếm</button>
                )}
                <label className="sf-sort">
                  <span>Sắp xếp</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} id="sort-select" aria-label="Sắp xếp">
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="sf-pills" role="tablist">
              {filterPills.map(p => (
                <button key={p.id} type="button" role="tab" aria-selected={activeCategory === p.id}
                  className={`sf-pill ${activeCategory === p.id ? 'is-active' : ''}`} onClick={() => goCategory(p.id, false)}>
                  <p.icon size={15} /> {p.short} <span className="sf-pill-count">{p.count}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="sf-grid">{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : catalogItems.length ? (
              <div className="sf-grid">
                {catalogItems.map(p => <ProductCard key={p.id} product={p} highlight={flagsOf(p)} />)}
              </div>
            ) : (
              <div className="sf-empty">
                <Search size={36} />
                <h3>Chưa có sản phẩm phù hợp</h3>
                <p>{searchQuery.trim() ? `Không có kết quả cho “${searchQuery.trim()}”. Thử từ khoá khác nhé.` : 'Danh mục này hiện chưa có sản phẩm.'}</p>
                <button type="button" className="sf-btn sf-btn-primary" onClick={() => { setSearchQuery?.(''); goCategory('all', false); }}>Xem tất cả sản phẩm</button>
              </div>
            )}
          </>
        ) : loading ? (
          <div className="sf-shelf">
            <div className="sf-section-head"><div className="skeleton" style={{ height: 28, width: 260, borderRadius: 6 }} /></div>
            <div className="sf-row">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
          </div>
        ) : (
          shelves.map(g => {
            return (
              <div key={g.id} className={`sf-shelf sf-tone-${g.tone}`} id={`shelf-${g.id}`}>
                <div className="sf-section-head">
                  <div className="sf-shelf-title">
                    <span className="sf-shelf-icon"><g.icon size={20} /></span>
                    <div>
                      <h2 className="sf-h2">{g.name}</h2>
                      <p className="sf-sub">{g.desc}</p>
                    </div>
                  </div>
                  <button type="button" className="sf-see-all" onClick={() => goCategory(g.id)}>
                    Xem tất cả <span>({g.items.length})</span> <ChevronRight size={16} />
                  </button>
                </div>
                <ShelfRow>
                  {g.items.map(p => (
                    <ProductCard key={p.id} product={p} highlight={flagsOf(p)} />
                  ))}
                </ShelfRow>
              </div>
            );
          })
        )}
      </section>

      {/* ── 4. WHY US ── */}
      <section className="container sf-why" id="features-section">
        <div className="sf-section-head sf-center">
          <div>
            <h2 className="sf-h2">Vì sao chọn TOOLLIVE?</h2>
            <p className="sf-sub">Sản phẩm tự phát triển, kiểm thử kỹ và được hỗ trợ lâu dài</p>
          </div>
        </div>
        <div className="sf-why-grid">
          {[
            { icon: Zap, tone: 'cyan', t: 'Hiệu năng ổn định', d: 'Tối ưu đa luồng, chạy 24/7 không ngốn CPU hay RAM.' },
            { icon: ShieldCheck, tone: 'green', t: 'An toàn', d: 'Quét mã độc trước khi đăng tải, không backdoor.' },
            { icon: RefreshCw, tone: 'violet', t: 'Cập nhật thường xuyên', d: 'Sửa lỗi và bổ sung tính năng theo nền tảng.' },
            { icon: Headphones, tone: 'orange', t: 'Hỗ trợ 24/7', d: 'Cài đặt, cấu hình qua UltraViewer / Zalo / Telegram.' },
          ].map(f => (
            <div key={f.t} className={`sf-why-card sf-tone-${f.tone}`}>
              <span className="sf-why-icon"><f.icon size={22} /></span>
              <div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CUSTOM DEVELOPMENT CTA ── */}
      <section className="container sf-cta-wrap">
        <div className="sf-cta">
          <div className="sf-cta-copy">
            <span className="sf-cta-tag"><Users size={14} /> Dịch vụ lập trình theo yêu cầu</span>
            <h2>Cần tool, game livestream hoặc phần mềm riêng?</h2>
            <p>Gửi ý tưởng hoặc quy trình bạn muốn tự động hoá — chúng tôi tư vấn miễn phí và báo giá nhanh.</p>
          </div>
          <div className="sf-cta-actions">
            <button type="button" className="sf-btn sf-btn-white" onClick={() => setIsContactModalOpen(true)}>
              <MessageSquare size={17} /> Liên hệ đặt làm
            </button>
            <button type="button" className="sf-btn sf-btn-glass" onClick={() => goCategory('phan-mem')}>
              <Package size={17} /> Xem phần mềm mẫu
            </button>
          </div>
        </div>
      </section>

      {/* ── Donate strip (same modal as the floating button) ── */}
      {donateOn && (
        <section className="container">
          <div className="sf-donate">
            <span className="sf-donate-icon"><Heart size={20} fill="currentColor" /></span>
            <p><strong>Ủng hộ TOOLLIVE</strong>{contactSettings.donateText || 'Thấy công cụ hữu ích? Mời mình một ly cà phê để có thêm tool miễn phí nhé!'}</p>
            <button type="button" className="sf-btn sf-btn-donate" onClick={openDonate}>Ủng hộ qua QR</button>
          </div>
        </section>
      )}

      {/* ── 6. DOCS & 7. TERMS ── */}
      <div className="container"><ArticleSlider /></div>
      <div className="container"><DisclaimerSection /></div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        productTitle="Yêu cầu lập trình công cụ / phần mềm theo yêu cầu"
      />
    </div>
  );
};

export default Home;
