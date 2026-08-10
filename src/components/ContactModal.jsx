import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X, MessageCircle, Send, MessageSquare, Phone } from 'lucide-react';
import { useSettings } from '../context/AppContext';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose, productTitle, cartItems, totalAmount }) => {
  const { contactSettings } = useSettings();

  const contacts = [
    {
      id: 'zalo',
      name: 'Zalo',
      desc: 'Phản hồi nhanh nhất',
      icon: <MessageCircle size={22} />,
      link: contactSettings?.zalo || 'https://zalo.me/',
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

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chọn kênh liên hệ"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="modal-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">
            <Phone size={22} />
          </div>
          <div>
            <h2 className="modal-title">Liên hệ mua hàng</h2>
            <p className="modal-subtitle">Chọn kênh bên dưới để được hỗ trợ nhanh nhất</p>
          </div>
        </div>

        {/* Product / Cart info */}
        {productTitle && (
          <div className="modal-product-info">
            <span className="modal-product-label">Sản phẩm:</span>
            <span className="modal-product-name">{productTitle}</span>
          </div>
        )}

        {cartItems && cartItems.length > 0 && (
          <div className="modal-product-info">
            <span className="modal-product-label">{cartItems.length} sản phẩm —</span>
            <span className="modal-product-name">
              Tổng: {totalAmount?.toLocaleString('vi-VN')}đ
            </span>
          </div>
        )}

        {/* Contacts */}
        <div className="contact-options">
          {contacts.map(c => (
            <a
              key={c.id}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
              id={`contact-${c.id}`}
              aria-label={`Liên hệ qua ${c.name}`}
            >
              <span
                className="contact-icon"
                style={{ background: c.gradient }}
              >
                {c.icon}
              </span>
              <div className="contact-text">
                <span className="contact-name">{c.name}</span>
                <span className="contact-desc">{c.desc}</span>
              </div>
              <span className="contact-arrow">→</span>
            </a>
          ))}
        </div>

        <p className="modal-note">
          Phản hồi trong vòng 5–15 phút. Hỗ trợ 8:00 – 23:00 mỗi ngày.
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ContactModal;
