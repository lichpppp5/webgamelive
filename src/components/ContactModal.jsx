import { createPortal } from 'react-dom';
import { X, MessageCircle, Send, MessageSquare } from 'lucide-react';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose, productTitle }) => {
  if (!isOpen) return null;

  const contacts = [
    {
      id: 'zalo',
      name: 'Zalo',
      icon: <MessageCircle size={24} />,
      link: `https://zalo.me/0833954354`, 
      color: '#0068ff'
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      icon: <MessageSquare size={24} />,
      link: `https://m.me/yourpage`, 
      color: '#0866ff'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <Send size={24} />,
      link: `https://t.me/yourusername`, 
      color: '#0088cc'
    }
  ];

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="modal-title">Tải Xuống Game/App</h2>
        <p className="modal-subtitle">
          Vui lòng chọn kênh liên hệ dưới đây để được hỗ trợ thanh toán và nhận sản phẩm nhanh nhất.
        </p>
        
        {productTitle && (
          <div className="modal-product-info">
            <strong>Sản phẩm:</strong> {productTitle}
          </div>
        )}

        <div className="contact-options">
          {contacts.map(contact => (
            <a 
              key={contact.id} 
              href={contact.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-btn"
              style={{ '--hover-color': contact.color }}
            >
              <span className="contact-icon" style={{ backgroundColor: contact.color }}>
                {contact.icon}
              </span>
              <span className="contact-name">Chat qua {contact.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContactModal;
