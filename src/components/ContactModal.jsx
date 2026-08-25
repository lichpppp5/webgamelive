import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X, MessageCircle, Send, MessageSquare, Phone, QrCode, Copy, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import { useSettings, useToast } from '../context/AppContext';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose, productTitle, cartItems, totalAmount }) => {
  const { contactSettings } = useSettings();
  const { showToast } = useToast();
  const [showZaloView, setShowZaloView] = useState(true);
  const [copied, setCopied] = useState(false);

  const rawZalo = contactSettings?.zalo || '';
  const extractedDigits = rawZalo.replace(/[^0-9]/g, '');
  const zaloPhone = extractedDigits || rawZalo || 'Zalo Support';
  const zaloLink = rawZalo.startsWith('http') ? rawZalo : (extractedDigits ? `https://zalo.me/${extractedDigits}` : 'https://zalo.me/');
  
  // Custom uploaded QR or auto-generated QR code
  const zaloQrImage = contactSettings?.zaloQr || (extractedDigits ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(zaloLink)}` : '');

  const handleCopyPhone = (e) => {
    e.stopPropagation();
    if (!zaloPhone) return;
    navigator.clipboard.writeText(zaloPhone);
    setCopied(true);
    if (showToast) showToast(`Đã sao chép SĐT Zalo (${zaloPhone})!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShowZaloView(true);
    onClose();
  };

  if (!isOpen) return null;

  const contacts = [
    {
      id: 'zalo',
      name: 'Zalo (Quét mã QR / SĐT)',
      desc: 'Phản hồi nhanh nhất',
      icon: <QrCode size={22} />,
      isQr: true,
      color: '#0068ff',
      gradient: 'linear-gradient(135deg, #0068ff, #0056d6)',
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      desc: 'Chat qua Messenger',
      icon: <MessageSquare size={22} />,
      link: contactSettings?.facebook || 'https://m.me/',
      color: '#0866ff',
      gradient: 'linear-gradient(135deg, #0866ff, #1651c9)',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      desc: 'Nhóm hỗ trợ 24/7',
      icon: <Send size={22} />,
      link: contactSettings?.telegram || 'https://t.me/',
      color: '#0088cc',
      gradient: 'linear-gradient(135deg, #0088cc, #006699)',
    },
  ];

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chọn kênh liên hệ"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="modal-close" onClick={handleClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {showZaloView ? (
          /* ── Zalo QR View ── */
          <div className="zalo-qr-view animate-fadeIn">
            <button className="zalo-back-btn" onClick={() => setShowZaloView(false)}>
              <ArrowLeft size={16} /> Xem kênh liên hệ khác (FB, Telegram)
            </button>

            <div className="zalo-qr-header">
              <div className="zalo-qr-icon-wrap">
                <MessageCircle size={24} />
              </div>
              <h2 className="zalo-qr-title">Mã QR Zalo Hỗ Trợ</h2>
              <p className="zalo-qr-subtitle">Quét bằng ứng dụng Zalo trên điện thoại để nhắn tin ngay</p>
            </div>

            {/* QR Card */}
            <div className="zalo-qr-card">
              <div className="zalo-qr-img-frame">
                <img src={zaloQrImage} alt="Zalo QR Code" className="zalo-qr-img" />
              </div>
              
              <div className="zalo-phone-row">
                <div className="zalo-phone-info">
                  <span className="zalo-phone-label">SĐT Zalo:</span>
                  <span className="zalo-phone-val">{zaloPhone}</span>
                </div>
                <button className="btn-copy-phone" onClick={handleCopyPhone}>
                  {copied ? <Check size={14} color="#00e676" /> : <Copy size={14} />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="zalo-qr-actions">
              <button
                type="button"
                className="btn-open-zalo"
                onClick={handleCopyPhone}
              >
                {copied ? <Check size={16} color="#00e676" /> : <Copy size={16} />}
                {copied ? 'Đã sao chép SĐT Zalo!' : 'Sao chép SĐT Zalo để nhắn tin'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Default Options List ── */
          <>
            {/* Header */}
            <div className="modal-header">
              <div className="modal-icon">
                <Phone size={22} />
              </div>
              <div>
                <h2 className="modal-title">Liên hệ nhận công cụ</h2>
                <p className="modal-subtitle">Chọn kênh bên dưới để được hỗ trợ nhanh nhất</p>
              </div>
            </div>

            {/* Product / Cart info */}
            {productTitle && (
              <div className="modal-product-info">
                <span className="modal-product-label">Công cụ:</span>
                <span className="modal-product-name">{productTitle}</span>
              </div>
            )}

            {cartItems && cartItems.length > 0 && (
              <div className="modal-product-info">
                <span className="modal-product-label">{cartItems.length} công cụ —</span>
                <span className="modal-product-name">
                  Tổng: {totalAmount?.toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}

            {/* Contacts */}
            <div className="contact-options">
              {contacts.map(c => (
                c.isQr ? (
                  <button
                    key={c.id}
                    onClick={() => setShowZaloView(true)}
                    className="contact-btn contact-btn-clickable"
                    id={`contact-${c.id}`}
                    type="button"
                  >
                    <span className="contact-icon" style={{ background: c.gradient }}>
                      {c.icon}
                    </span>
                    <div className="contact-text">
                      <span className="contact-name">{c.name}</span>
                      <span className="contact-desc">{c.desc}</span>
                    </div>
                    <span className="contact-arrow">→</span>
                  </button>
                ) : (
                  <a
                    key={c.id}
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn"
                    id={`contact-${c.id}`}
                  >
                    <span className="contact-icon" style={{ background: c.gradient }}>
                      {c.icon}
                    </span>
                    <div className="contact-text">
                      <span className="contact-name">{c.name}</span>
                      <span className="contact-desc">{c.desc}</span>
                    </div>
                    <span className="contact-arrow">→</span>
                  </a>
                )
              ))}
            </div>

            <p className="modal-note">
              Phản hồi trong vòng 5–15 phút. Hỗ trợ 8:00 – 23:00 mỗi ngày.
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ContactModal;
