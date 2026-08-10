import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Share2, Download } from 'lucide-react';
import ContactModal from './ContactModal';
import DownloadConfirmModal from './DownloadConfirmModal';
import { useCart, useToast } from '../context/AppContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`Đã thêm "${product.title}" vào giỏ hàng!`, 'success');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Đã sao chép link sản phẩm!', 'info');
      }
    } catch {
      // user cancelled share
    }
  };

  const discountPct = product.oldPrice > 0
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <>
      <div className="product-card">
        {/* Image */}
        <Link to={`/product/${product.id}`} className="product-image-link" tabIndex={-1}>
          <div className="product-image">
            {imgError ? (
              <div className="img-fallback">
                <Download size={32} />
              </div>
            ) : (
              <img
                src={product.image}
                alt={product.title}
                loading="lazy"
                onError={() => setImgError(true)}
              />
            )}

            {/* Overlay */}
            <div className="product-overlay">
              <button
                className="overlay-btn"
                onClick={() => navigate(`/product/${product.id}`)}
                aria-label="Xem chi tiết"
              >
                <Eye size={18} />
                <span>Xem chi tiết</span>
              </button>
            </div>

            {/* Badges */}
            <div className="product-badges">
              {product.isHot && (
                <span className="badge badge-hot" aria-label="Sản phẩm hot">🔥 HOT</span>
              )}
              {discountPct > 0 && (
                <span className="badge badge-sale">-{discountPct}%</span>
              )}
            </div>

            {/* Share btn */}
            <button
              className="share-btn"
              onClick={handleShare}
              aria-label="Chia sẻ sản phẩm"
            >
              <Share2 size={14} />
            </button>
          </div>
        </Link>

        {/* Info */}
        <div className="product-info">
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            <span className="product-downloads">
              <Download size={12} />
              {(product.downloads || 0).toLocaleString()}
            </span>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="product-title">{product.title}</h3>
          </Link>

          {/* Price */}
          <div className="product-price">
            <span className="price-current">
              {product.price > 0
                ? product.price.toLocaleString('vi-VN') + 'đ'
                : <span className="price-free">Liên hệ</span>
              }
            </span>
            {product.oldPrice > 0 && (
              <span className="price-old">{product.oldPrice.toLocaleString('vi-VN')}đ</span>
            )}
          </div>

          {/* Actions */}
          <div className="product-actions">
            {product.downloadLink ? (
              <button
                className="action-btn btn-download"
                onClick={() => setIsDownloadConfirmOpen(true)}
                id={`download-btn-${product.id}`}
                aria-label={`Tải xuống ${product.title}`}
              >
                <Download size={15} />
                Tải xuống
              </button>
            ) : (
              <button
                className="action-btn btn-download"
                onClick={() => setIsModalOpen(true)}
                id={`download-btn-${product.id}`}
                aria-label={`Tải xuống ${product.title}`}
              >
                <Download size={15} />
                Tải xuống
              </button>
            )}
            <button
              className="action-btn btn-cart"
              onClick={handleAddToCart}
              id={`cart-btn-${product.id}`}
              aria-label={`Thêm ${product.title} vào giỏ hàng`}
            >
              <ShoppingCart size={15} />
            </button>
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
        onContact={() => setIsModalOpen(true)}
      />
    </>
  );
};

export default ProductCard;
