import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Share2, Download, MessageSquare, Gift, Trophy, Play, Sparkles } from 'lucide-react';
import ContactModal from './ContactModal';
import DownloadConfirmModal from './DownloadConfirmModal';
import { useCart, useToast } from '../context/AppContext';
import { groupOf } from '../data/catalog';
import './ProductCard.css';

const ytThumbOf = (url) => {
  const m = url ? url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) : null;
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};
const stripHtml = (s) => String(s || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

// highlight: 'new' and/or 'top' (string or array) → "Mới" / "Top tải" flags, decided by the page
const ProductCard = ({ product, highlight, size = 'md' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [downloadCount, setDownloadCount] = useState(product.downloads || 0);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => { setDownloadCount(product.downloads || 0); }, [product.downloads]);

  const flags = [].concat(highlight || []);
  const group = groupOf(product);
  const GroupIcon = group.icon;
  const isFree = Boolean(product.isFree);
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) || 0;
  const discountPct = oldPrice > price && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;

  const ytThumb = ytThumbOf(product.image);
  const isVideo = !ytThumb && /\.(mp4|webm)(\?|$)/i.test(product.image || '');
  const imageSrc = ytThumb || product.image;
  const hasMedia = imageSrc && !imgError;
  const desc = stripHtml(product.description);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`Đã thêm "${product.title}" vào danh sách tải!`, 'success');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    try {
      if (navigator.share) await navigator.share({ title: product.title, url });
      else { await navigator.clipboard.writeText(url); showToast('Đã sao chép link sản phẩm!', 'info'); }
    } catch { /* cancelled */ }
  };

  // One clear primary action per state
  let cta;
  if (product.downloadLink) {
    cta = { label: isFree ? 'Tải miễn phí' : 'Tải xuống', short: 'Tải', icon: Download, kind: 'download', onClick: () => setIsDownloadConfirmOpen(true) };
  } else if (isFree) {
    cta = { label: 'Nhận miễn phí', short: 'Nhận', icon: Gift, kind: 'download', onClick: () => setIsModalOpen(true) };
  } else if (price > 0) {
    cta = { label: 'Liên hệ mua', short: 'Mua', icon: MessageSquare, kind: 'buy', onClick: () => setIsModalOpen(true) };
  } else {
    cta = { label: 'Liên hệ', short: 'Liên hệ', icon: MessageSquare, kind: 'contact', onClick: () => setIsModalOpen(true) };
  }
  const CtaIcon = cta.icon;

  return (
    <>
      <article className={`pc pc-${size} pc-tone-${group.tone}`}>
        <Link to={`/product/${product.id}`} className="pc-media" aria-label={product.title}>
          {hasMedia ? (
            isVideo ? (
              <video src={product.image} autoPlay loop muted playsInline preload="metadata" onError={() => setImgError(true)} />
            ) : (
              <img src={imageSrc} alt="" loading="lazy" onError={() => setImgError(true)} />
            )
          ) : (
            <div className="pc-fallback">
              <GroupIcon size={34} strokeWidth={1.6} />
              <span>{product.title}</span>
            </div>
          )}
          {ytThumb && <span className="pc-play"><Play size={18} fill="currentColor" /></span>}

          <span className="pc-chip"><GroupIcon size={12} />{group.short}</span>
          <div className="pc-flags">
            {isFree && <span className="pc-flag pc-flag-free"><Gift size={11} />Miễn phí</span>}
            {discountPct > 0 && <span className="pc-flag pc-flag-sale">-{discountPct}%</span>}
            {flags.includes('new') && <span className="pc-flag pc-flag-new"><Sparkles size={11} />Mới</span>}
            {flags.includes('top') && !isFree && <span className="pc-flag pc-flag-top"><Trophy size={11} />Top tải</span>}
          </div>
          <button type="button" className="pc-share" onClick={handleShare} aria-label="Chia sẻ">
            <Share2 size={14} />
          </button>
        </Link>

        <div className="pc-body">
          <Link to={`/product/${product.id}`} className="pc-title-link">
            <h3 className="pc-title" title={product.title}>{product.title}</h3>
          </Link>
          {size === 'lg' && desc && <p className="pc-desc">{desc}</p>}

          <div className="pc-meta">
            <span><Download size={12} />{(downloadCount || 0).toLocaleString('vi-VN')} lượt tải</span>
            {product.version && <span className="pc-ver">{product.version}</span>}
          </div>

          <div className="pc-foot">
            {price > 0 && !isFree && (
              <div className="pc-price">
                <strong>{price.toLocaleString('vi-VN')}đ</strong>
                {oldPrice > price && <s>{oldPrice.toLocaleString('vi-VN')}đ</s>}
              </div>
            )}
            <div className="pc-actions">
              <button type="button" className={`pc-cta pc-cta-${cta.kind}`} onClick={cta.onClick} id={`cta-btn-${product.id}`}>
                <CtaIcon size={15} />
                <span className="pc-cta-long">{cta.label}</span>
                <span className="pc-cta-short">{cta.short}</span>
              </button>
              <button type="button" className="pc-cart" onClick={handleAddToCart} aria-label={`Thêm ${product.title} vào danh sách tải`} id={`cart-btn-${product.id}`}>
                <ShoppingCart size={15} />
              </button>
            </div>
          </div>
        </div>
      </article>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} productTitle={product.title} />
      <DownloadConfirmModal
        isOpen={isDownloadConfirmOpen}
        onClose={() => setIsDownloadConfirmOpen(false)}
        downloadLink={product.downloadLink}
        productId={product.id}
        isFree={product.isFree}
        onContact={() => setIsModalOpen(true)}
        onDownloadSuccess={(newCount) => setDownloadCount(newCount)}
      />
    </>
  );
};

export default ProductCard;
