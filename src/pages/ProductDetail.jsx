import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ArrowLeft, ShoppingCart, Download, Share2, Flame, MessageSquare } from 'lucide-react';
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
          <div className="skeleton" style={{ height: '20px', width: '200px', borderRadius: '4px', marginBottom: '2rem' }} />
          <div className="detail-skeleton-grid">
            <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[100, 70, 50, 80, 60].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: i === 0 ? '36px' : '16px', width: `${w}%`, borderRadius: '4px' }} />
              ))}
              <div className="skeleton" style={{ height: '52px', borderRadius: '10px', marginTop: '1rem' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ marginBottom: '1rem' }}>Không tìm thấy công cụ!</h2>
        <Link to="/" className="btn-primary">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page container page-enter">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Điều hướng">
        <Link to="/" className="breadcrumb-link">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-link">{product.category}</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{product.title}</span>
      </nav>

      <div className="product-detail-container">
        {/* Gallery */}
        <div className="product-gallery">
          {(() => {
            const isVideo = product.image && (product.image.endsWith('.mp4') || product.image.endsWith('.webm'));
            return (
              <div className={`main-image-wrap ${isVideo ? 'tiktok-video-wrap' : ''}`}>
                {isVideo ? (
                  <video
                    src={product.image}
                    className="main-image main-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="main-image"
                    onError={e => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
                  />
                )}
                {product.isHot && (
                  <div className="detail-hot-badge">
                    <Flame size={14} /> HOT
                  </div>
                )}
              </div>
            );
          })()}

          {/* Features box */}
          <div className="features-box">
            <h3 className="features-title">✅ Bao gồm trong gói</h3>
            <div className="features-list">
              {[
                'Hỗ trợ cài đặt từ xa',
                'Hướng dẫn vận hành chi tiết',
                'Cập nhật theo yêu cầu',
                'Hỗ trợ kỹ thuật 24/7',
              ].map((f, i) => (
                <div key={i} className="feature-item">
                  <Check size={16} className="feature-icon" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="product-info-full">
          <div className="info-sticky">
            <span className="category-label">{product.category}</span>
            <h1 className="detail-title">{product.title}</h1>

            {/* Stats row */}
            <div className="detail-stats">
              <span className="detail-stat">
                <Download size={14} />
                {(downloadCount || 0).toLocaleString()} lượt tải
              </span>
              {product.isHot && (
                <span className="detail-stat hot-stat">
                  <Flame size={14} />
                  Đang hot
                </span>
              )}
            </div>

            {/* Price */}
            <div className="price-section">
              <span className="price-current">
                {product.price > 0 && !product.isFree
                  ? product.price.toLocaleString('vi-VN') + 'đ'
                  : null}
              </span>
              {product.oldPrice > 0 && (
                <>
                  <span className="price-old">{product.oldPrice.toLocaleString('vi-VN')}đ</span>
                  <span className="price-discount">-{discountPct}%</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="description-section">
                <h3 className="desc-heading">Mô tả công cụ</h3>
                <div
                  className="description ql-editor-content"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {(product.downloadLink || product.isFree) ? (
                <>
                  <button
                    className="btn-primary btn-action-main"
                    onClick={() => setIsDownloadConfirmOpen(true)}
                    id={`detail-download-btn-${product.id}`}
                  >
                    <Download size={20} />
                    Tải xuống ngay
                  </button>
                  <button
                    className="btn-outline btn-action-cart"
                    onClick={() => setIsModalOpen(true)}
                    id={`detail-contact-btn-${product.id}`}
                  >
                    <MessageSquare size={18} />
                    Liên hệ hỗ trợ cấu hình, cài đặt
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary btn-action-main"
                  onClick={() => setIsModalOpen(true)}
                  id={`detail-download-btn-${product.id}`}
                >
                  <Download size={20} />
                  Tải xuống ngay
                </button>
              )}
              <button
                className="btn-action-cart" style={{ flex: '0 0 auto' }}
                onClick={handleAddToCart}
                id={`detail-cart-btn-${product.id}`}
                title="Thêm vào danh sách tải"
              >
                <ShoppingCart size={20} />
              </button>
              <button
                className="btn-share"
                onClick={handleShare}
                id={`detail-share-btn-${product.id}`}
                aria-label="Chia sẻ"
              >
                <Share2 size={18} />
              </button>
            </div>

            <p className="contact-note">
              Vui lòng liên hệ để được tư vấn và nhận hỗ trợ tốt nhất.
            </p>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productTitle={product.title}
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
