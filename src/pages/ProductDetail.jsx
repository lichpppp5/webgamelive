import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Check, 
  ArrowLeft, 
  ShoppingCart, 
  Download, 
  Share2, 
  Flame, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Laptop, 
  HardDrive, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import ContactModal from '../components/ContactModal';
import DownloadConfirmModal from '../components/DownloadConfirmModal';
import { useCart, useToast } from '../context/AppContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
          setDownloadCount(data.downloads || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải chi tiết:', err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    showToast(`Đã thêm "${product.title}" vào danh sách tải!`, 'success');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Đã sao chép link công cụ!', 'info');
      }
    } catch { /* user cancelled */ }
  };

  const discountPct = product?.oldPrice > 0
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="product-detail-page container page-enter">
        <div className="detail-skeleton">
          <div className="skeleton" style={{ height: '20px', width: '240px', borderRadius: '4px', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: '420px', width: '100%', borderRadius: '20px', marginBottom: '2rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div className="skeleton" style={{ height: '350px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ height: '350px', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-100)' }}>Không tìm thấy công cụ!</h2>
        <p style={{ color: 'var(--text-300)', marginBottom: '1.5rem' }}>Công cụ này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link to="/" className="btn-primary">← Về trang chủ</Link>
      </div>
    );
  }

  // Sanitize category & title to remove any "MMO" occurrences
  const cleanCategory = (product.category === 'Tools MMO' || product.category?.includes('MMO'))
    ? 'Tools Tiện Ích'
    : (product.category || 'Tools Tiện Ích');

  const cleanTitle = product.title?.replace(/\bMMO\b/gi, 'Tiện Ích').replace(/\(MMO\)/gi, '').trim();

  const ytMatch = product.image ? product.image.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) : null;
  const ytEmbedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` : null;
  const isVideo = !ytEmbedUrl && product.image && (product.image.endsWith('.mp4') || product.image.endsWith('.webm'));

  return (
    <div className="product-detail-page container page-enter">
      {/* 1. Breadcrumb Navigation */}
      <nav className="detail-breadcrumb" aria-label="Điều hướng">
        <Link to="/" className="breadcrumb-link">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/?category=${product.category === 'Tools MMO' ? 'tools-tien-ich' : ''}`} className="breadcrumb-link">
          {cleanCategory}
        </Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{cleanTitle}</span>
      </nav>

      {/* 2. Top Header Overview */}
      <div className="detail-header-overview">
        <div className="detail-badges-row">
          <span className="detail-category-badge">{cleanCategory}</span>
          {product.isHot && (
            <span className="detail-hot-pill">
              <Flame size={14} />
              <span>Sản Phẩm Hot</span>
            </span>
          )}
          <span className="detail-downloads-pill">
            <Download size={14} />
            <span>{(downloadCount || 0).toLocaleString()} lượt tải</span>
          </span>
          <span className="detail-rating-pill">
            <Star size={14} fill="currentColor" />
            <span>4.9 (Đánh giá cao)</span>
          </span>
        </div>

        <h1 className="detail-main-heading">{cleanTitle}</h1>

        <p className="detail-tagline-text">
          Giải pháp công nghệ chuyên nghiệp, vận hành ổn định và được tối ưu hóa cho hiệu suất làm việc cao nhất.
        </p>
      </div>

      {/* 3. Wide Media Preview Showcase (Phù hợp cho cả video 16:9 và hình ảnh rộng) */}
      <div className="detail-media-showcase">
        <div className="media-stage-window">
          {/* macOS Style Bar */}
          <div className="media-stage-header">
            <div className="media-stage-dots">
              <span className="stage-dot red" />
              <span className="stage-dot yellow" />
              <span className="stage-dot green" />
            </div>
            <div className="media-stage-title">
              <span>preview-workspace.app</span>
              <span className="media-live-badge">Live Preview</span>
            </div>
          </div>

          {/* Media Viewport */}
          <div className="media-stage-viewport">
            {!imgError && product.image ? (
              ytEmbedUrl ? (
                <iframe
                  src={ytEmbedUrl}
                  title={cleanTitle}
                  className="stage-video"
                  style={{ border: 'none', width: '100%', height: '100%', minHeight: '400px' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVideo ? (
                <video
                  src={product.image}
                  className="stage-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  onError={() => setImgError(true)}
                />
              ) : (
                <img
                  src={product.image}
                  alt=""
                  className="stage-image"
                  onError={() => setImgError(true)}
                />
              )
            ) : (
              <div className="stage-fallback-art">
                <div className="stage-fallback-glow" />
                <div className="stage-fallback-icon">
                  <Zap size={44} />
                </div>
                <h3 className="stage-fallback-title">{cleanTitle}</h3>
                <span className="stage-fallback-note">Xem chi tiết bài viết và tài liệu hướng dẫn bên dưới</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Expanded Two-Column Layout: Wide Article Body (70%) + Sticky Sidebar (30%) */}
      <div className="detail-expanded-grid">
        {/* LEFT COLUMN: Wide Article, Rich Text & Documentation (70%) */}
        <div className="detail-article-column">
          {/* Article Box */}
          <div className="article-main-card">
            <div className="article-card-header">
              <div className="article-header-icon">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="article-card-title">Mô Tả Chi Tiết &amp; Hướng Dẫn Vận Hành</h2>
                <p className="article-card-subtitle">Thông tin tính năng, kịch bản tự động hóa và tài liệu hỗ trợ</p>
              </div>
            </div>

            {/* Rich HTML Content: allows large embedded images, videos, tables */}
            {product.description ? (
              <div
                className="article-rich-content ql-editor-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <div className="article-empty-notice">
                <p>Công cụ này đang được đội ngũ kỹ thuật viên cập nhật tài liệu hướng dẫn chi tiết. Bạn có thể nhấn nút <strong>"Tải xuống ngay"</strong> hoặc liên hệ để được hỗ trợ từ xa qua Ultraview.</p>
              </div>
            )}
          </div>

          {/* Core Feature Highlights */}
          <div className="highlights-card">
            <h3 className="highlights-title">
              <Sparkles size={18} className="highlights-icon" />
              <span>Đặc Điểm Nổi Bật Của Công Cụ</span>
            </h3>
            <div className="highlights-grid">
              <div className="highlight-item">
                <div className="hl-icon-wrap cyan">
                  <Zap size={18} />
                </div>
                <div>
                  <h4>Hiệu Năng Tối Đa</h4>
                  <p>Xử lý đa luồng thông minh, không chiếm dụng tài nguyên máy tính.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="hl-icon-wrap green">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4>An Toàn Tuyệt Đối</h4>
                  <p>Không chứa mã độc hay backdoor, đã kiểm duyệt an toàn.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="hl-icon-wrap purple">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <h4>Cập Nhật Trọn Đời</h4>
                  <p>Tự động nhận các bản vá lỗi và nâng cấp tính năng mới.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="hl-icon-wrap orange">
                  <Laptop size={18} />
                </div>
                <div>
                  <h4>Giao Diện Trực Quan</h4>
                  <p>Dễ dàng sử dụng chỉ với vài thao tác nhấp chuột cơ bản.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Purchase & Download Sidebar (30%) */}
        <div className="detail-sidebar-column">
          <div className="sticky-action-card">
            {/* Price section */}
            <div className="sidebar-price-row">
              <div className="price-block">
                <span className="price-label">Mức đóng góp / Chi phí</span>
                <div className="price-values">
                  <span className="price-main">
                    {product.price > 0 && !product.isFree
                      ? product.price.toLocaleString('vi-VN') + 'đ'
                      : 'Miễn Phí'}
                  </span>
                  {product.oldPrice > 0 && (
                    <>
                      <span className="price-strike">{product.oldPrice.toLocaleString('vi-VN')}đ</span>
                      <span className="price-save-tag">-{discountPct}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="sidebar-buttons-stack">
              {(product.downloadLink || product.isFree) ? (
                <>
                  <button
                    className="btn-detail-download"
                    onClick={() => setIsDownloadConfirmOpen(true)}
                    id={`detail-download-btn-${product.id}`}
                  >
                    <Download size={20} />
                    <span>Tải Xuống Ngay</span>
                  </button>

                  <button
                    className="btn-detail-consult"
                    onClick={() => setIsModalOpen(true)}
                    id={`detail-contact-btn-${product.id}`}
                  >
                    <MessageSquare size={18} />
                    <span>Tư Vấn Hỗ Trợ Kỹ Thuật</span>
                  </button>
                </>
              ) : (
                <button
                  className="btn-detail-download"
                  onClick={() => setIsModalOpen(true)}
                  id={`detail-download-btn-${product.id}`}
                >
                  <Download size={20} />
                  <span>Tải Xuống Ngay</span>
                </button>
              )}

              <div className="sidebar-aux-buttons">
                <button
                  className="btn-aux-cart"
                  onClick={handleAddToCart}
                  id={`detail-cart-btn-${product.id}`}
                  title="Thêm vào danh sách tải"
                >
                  <ShoppingCart size={18} />
                  <span>Thêm Danh Sách Tải</span>
                </button>

                <button
                  className="btn-aux-share"
                  onClick={handleShare}
                  id={`detail-share-btn-${product.id}`}
                  aria-label="Chia sẻ công cụ"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Inclusions checklist */}
            <div className="sidebar-inclusions">
              <h4 className="inclusions-title">Quyền Lợi Kèm Theo:</h4>
              <div className="inclusions-list">
                <div className="inclusion-item">
                  <CheckCircle2 size={16} className="inc-check" />
                  <span>Hỗ trợ cài đặt từ xa qua Ultraview</span>
                </div>
                <div className="inclusion-item">
                  <CheckCircle2 size={16} className="inc-check" />
                  <span>Hướng dẫn chi tiết từ A-Z</span>
                </div>
                <div className="inclusion-item">
                  <CheckCircle2 size={16} className="inc-check" />
                  <span>Cập nhật miễn phí khi có phiên bản mới</span>
                </div>
                <div className="inclusion-item">
                  <CheckCircle2 size={16} className="inc-check" />
                  <span>Hỗ trợ kỹ thuật 24/7 nhiệt tình</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="sidebar-specs">
              <div className="spec-row">
                <span className="spec-name">Danh mục:</span>
                <span className="spec-val">{cleanCategory}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Phiên bản:</span>
                <span className="spec-val">v{product.version || '1.0 Pro'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Nền tảng:</span>
                <span className="spec-val">Windows / Web / VPS</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Bảo mật:</span>
                <span className="spec-val text-green">100% Sạch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productTitle={cleanTitle}
      />

      <DownloadConfirmModal
        isOpen={isDownloadConfirmOpen}
        onClose={() => setIsDownloadConfirmOpen(false)}
        downloadLink={product.downloadLink}
        productId={product.id}
        isFree={product.isFree}
        onContact={() => setIsModalOpen(true)}
        onDownloadSuccess={(newCount) => setDownloadCount(newCount)}
      />
    </div>
  );
};

export default ProductDetail;
