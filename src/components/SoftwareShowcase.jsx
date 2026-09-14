import { useState, useEffect } from 'react';
import { 
  Download, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  Monitor, 
  Layers, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Cpu, 
  ExternalLink, 
  PlayCircle, 
  Image as ImageIcon 
} from 'lucide-react';
import ContactModal from './ContactModal';
import { useToast } from '../context/AppContext';
import './SoftwareShowcase.css';

const SoftwareShowcase = ({ softwareList = [], loading = false, onReload }) => {
  const { showToast } = useToast();
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Set default selected software
  useEffect(() => {
    if (softwareList && softwareList.length > 0) {
      if (!selectedSoftwareId || !softwareList.find(s => s.id === selectedSoftwareId)) {
        setSelectedSoftwareId(softwareList[0].id);
      }
    }
  }, [softwareList, selectedSoftwareId]);

  const current = softwareList.find(s => s.id === selectedSoftwareId) || softwareList[0];

  const handleDownload = async (sw) => {
    if (!sw) return;
    setDownloading(true);
    try {
      // Call download API to increment counter
      await fetch(`/api/software/${sw.id}/download`, { method: 'POST' });
      if (onReload) onReload();
    } catch (e) {
      console.error('Error recording download:', e);
    } finally {
      setDownloading(false);
    }

    if (sw.downloadLink && sw.downloadLink !== '#' && sw.downloadLink.trim() !== '') {
      window.open(sw.downloadLink, '_blank', 'noopener,noreferrer');
      showToast(`Đang chuyển hướng tải phần mềm "${sw.title}"!`, 'success');
    } else {
      showToast(`Vui lòng liên hệ Admin để nhận link tải & key kích hoạt "${sw.title}"!`, 'info');
      setIsContactOpen(true);
    }
  };

  const handleShare = async (sw) => {
    if (!sw) return;
    const shareUrl = window.location.origin + '/?category=phan-mem&id=' + sw.id;
    try {
      if (navigator.share) {
        await navigator.share({
          title: sw.title,
          text: sw.tagline || sw.title,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Đã sao chép đường dẫn giới thiệu phần mềm!', 'info');
      }
    } catch {
      // user cancelled
    }
  };

  // Helper to parse features safely
  const parseFeatures = (feat) => {
    if (!feat) return [];
    if (Array.isArray(feat)) return feat;
    try {
      const parsed = JSON.parse(feat);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return feat.split('\n').filter(Boolean);
    }
  };

  // Helper to detect if media is YouTube
  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0` : url;
  };

  const isVideoFile = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.includes('video');
  };

  if (loading) {
    return (
      <div className="software-showcase-container">
        <div className="software-skeleton-header skeleton" style={{ height: '70px', borderRadius: '14px', marginBottom: '1.5rem' }} />
        <div className="software-skeleton-media skeleton" style={{ height: '400px', borderRadius: '16px', marginBottom: '1.5rem' }} />
        <div className="software-skeleton-content skeleton" style={{ height: '260px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!softwareList || softwareList.length === 0) {
    return (
      <div className="software-empty-card">
        <div className="empty-icon-wrap">
          <Monitor size={48} className="empty-icon" />
        </div>
        <h3 className="empty-title">Chưa có sản phẩm phần mềm nào</h3>
        <p className="empty-desc">
          Các sản phẩm phần mềm mới nhất đang được tối ưu hóa và sẽ được cập nhật trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  const featuresList = parseFeatures(current?.features);

  return (
    <div className="software-showcase-container page-enter">
      {/* Top Banner Header */}
      <div className="software-hero-banner">
        <div className="hero-badge">
          <Sparkles size={15} />
          <span>HỆ THỐNG PHẦN MỀM CHUYÊN NGHIỆP</span>
        </div>
        <h1 className="software-main-title">
          Giới Thiệu Sản Phẩm Phần Mềm Tiện Ích
        </h1>
        <p className="software-subtitle">
          Khám phá và tải các công cụ phần mềm tự động hóa hàng đầu, tối ưu hóa tốc độ và nâng cao hiệu suất làm việc 24/7.
        </p>
      </div>

      {/* Software Selector Tabs (if more than 1 software) */}
      {softwareList.length > 1 && (
        <div className="software-nav-tabs">
          {softwareList.map(sw => {
            const isSelected = sw.id === current.id;
            return (
              <button
                key={sw.id}
                className={`software-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedSoftwareId(sw.id)}
              >
                <Monitor size={16} />
                <span className="software-tab-title">{sw.title}</span>
                {sw.version && <span className="software-tab-ver">{sw.version}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Software Card Showcase */}
      <div className="software-detail-card">
        {/* Media Showcase (Video or Image) */}
        <div className="software-media-wrapper">
          {current.media ? (
            isYouTubeUrl(current.media) ? (
              <div className="media-video-container">
                <iframe
                  src={getYouTubeEmbedUrl(current.media)}
                  title={current.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="software-iframe"
                />
              </div>
            ) : (current.mediaType === 'video' || isVideoFile(current.media)) ? (
              <div className="media-video-container">
                <video
                  src={current.media}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="software-video-player"
                />
              </div>
            ) : (
              <div className="media-image-container">
                <img
                  src={current.media}
                  alt={current.title}
                  className="software-preview-image"
                />
              </div>
            )
          ) : (
            <div className="media-placeholder">
              <Monitor size={64} className="placeholder-icon" />
              <span>Chưa cập nhật media giới thiệu</span>
            </div>
          )}

          {/* Media overlay badge */}
          <div className="media-type-badge">
            {(current.mediaType === 'video' || isVideoFile(current.media) || isYouTubeUrl(current.media)) ? (
              <>
                <PlayCircle size={15} />
                <span>Video Trải Nghiệm Thực Tế</span>
              </>
            ) : (
              <>
                <ImageIcon size={15} />
                <span>Ảnh Giao Diện Phần Mềm</span>
              </>
            )}
          </div>
        </div>

        {/* Software Header Info */}
        <div className="software-info-header">
          <div className="software-meta-row">
            {current.badge && (
              <span className="badge-highlight">
                <Flame size={13} />
                {current.badge}
              </span>
            )}
            <span className="badge-meta">
              <Cpu size={13} />
              {current.platform || 'Windows 10/11 (64-bit)'}
            </span>
            {current.version && (
              <span className="badge-meta">
                Phiên bản: <strong>{current.version}</strong>
              </span>
            )}
            <span className="badge-meta badge-downloads">
              🔥 {current.downloads || 0} lượt tải
            </span>
          </div>

          <h2 className="software-title-display">{current.title}</h2>
          {current.tagline && <p className="software-tagline-display">{current.tagline}</p>}

          {/* Pricing & Action Buttons */}
          <div className="software-action-bar">
            <div className="software-price-wrap">
              <span className="price-label">Mức phí sở hữu:</span>
              <div className="price-amount">
                {current.price > 0 ? (
                  <>
                    <strong className="text-gradient">{current.price.toLocaleString('vi-VN')}</strong>
                    <span className="currency">VNĐ</span>
                  </>
                ) : (
                  <strong className="free-badge">MIỄN PHÍ TRẢI NGHIỆM</strong>
                )}
              </div>
            </div>

            <div className="software-buttons-group">
              <button
                className="btn btn-primary btn-download-sw"
                onClick={() => handleDownload(current)}
                disabled={downloading}
              >
                <Download size={18} />
                <span>{downloading ? 'Đang xử lý...' : 'Tải Phần Mềm'}</span>
              </button>

              <button
                className="btn btn-outline btn-contact-sw"
                onClick={() => setIsContactOpen(true)}
              >
                <MessageCircle size={18} />
                <span>Tư Vấn & Bản Quyền</span>
              </button>

              <button
                className="btn btn-ghost btn-share-sw"
                onClick={() => handleShare(current)}
                title="Chia sẻ phần mềm này"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Badges */}
        {featuresList.length > 0 && (
          <div className="software-features-section">
            <h3 className="section-small-title">
              <ShieldCheck size={18} color="var(--primary)" />
              Đặc Điểm Nổi Bật
            </h3>
            <div className="features-grid">
              {featuresList.map((feature, idx) => (
                <div key={idx} className="feature-item-pill">
                  <CheckCircle2 size={16} className="feature-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAILED INTRODUCTION / BÀI VIẾT GIỚI THIỆU PHẦN MỀM */}
        <div className="software-content-section">
          <div className="content-section-header">
            <h3 className="content-heading">
              <Layers size={20} color="var(--primary)" />
              Bài Viết Giới Thiệu Chi Tiết Phần Mềm
            </h3>
            <span className="content-sub">Thông tin hướng dẫn sử dụng, giải pháp tính năng và thông số kỹ thuật</span>
          </div>

          <div className="software-rich-body">
            {current.description ? (
              <div 
                className="software-html-content"
                dangerouslySetInnerHTML={{ __html: current.description }} 
              />
            ) : (
              <p className="no-desc-text">Phần mềm chưa có bài giới thiệu chi tiết.</p>
            )}
          </div>
        </div>

        {/* Bottom CTA Box */}
        <div className="software-bottom-cta">
          <div className="bottom-cta-left">
            <h4>Sẵn sàng tối ưu hóa trải nghiệm & hiệu suất của bạn?</h4>
            <p>Tải ngay bản cập nhật mới nhất hoặc liên hệ đội ngũ hỗ trợ để nhận hướng dẫn cài đặt trực tiếp qua Ultraview / Anydesk.</p>
          </div>
          <div className="bottom-cta-right">
            <button
              className="btn btn-primary"
              onClick={() => handleDownload(current)}
            >
              <Download size={18} /> Tải Bản Mới Nhất
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setIsContactOpen(true)}
            >
              <MessageCircle size={18} /> Hỗ Trợ 1-1
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isContactOpen && (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
      )}
    </div>
  );
};

export default SoftwareShowcase;
