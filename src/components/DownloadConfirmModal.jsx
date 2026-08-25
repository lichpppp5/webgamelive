import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, MessageSquare } from 'lucide-react';
import DisclaimerSection from './DisclaimerSection';
import './DownloadConfirmModal.css';

const DownloadConfirmModal = ({ isOpen, onClose, downloadLink, productId, isFree, onContact, onDownloadSuccess }) => {
  const [isAgreed, setIsAgreed] = useState(false);

  if (!isOpen) return null;

  const handleDownloadClick = (e) => {
    if (!isAgreed) {
      e.preventDefault();
      return;
    }
    if (productId) {
      fetch(`/api/products/${productId}/download`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data && data.downloads !== undefined && onDownloadSuccess) {
            onDownloadSuccess(data.downloads);
          }
        })
        .catch(() => {});
    }
    onClose();
  };

  return createPortal(
    <div className="modal-overlay active" onClick={onClose}>
      <div className="download-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <div className="download-modal-header">
          <div className="download-modal-icon-wrap">
            <Download size={28} />
          </div>
          <h2>Xác nhận Tải xuống</h2>
        </div>

        <div className="download-modal-body">
          <p className="download-warning-text">
            Vui lòng đọc kỹ Điều khoản & Miễn trừ trách nhiệm trước khi tải xuống. Liên hệ thanh toán và nhận key kích hoạt sau khi tải xuống. Xin cảm ơn !
          </p>
          
          <div className="modal-disclaimer-wrapper">
            <DisclaimerSection />
          </div>
          
          <div className="agreement-checkbox">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', margin: '20px 0', cursor: 'pointer', textAlign: 'left' }}>
              <input 
                type="checkbox" 
                checked={isAgreed} 
                onChange={(e) => setIsAgreed(e.target.checked)} 
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-100)' }}>Tôi đã đọc và đồng ý với Điều khoản & Miễn trừ trách nhiệm</span>
            </label>
          </div>

          {isFree && (
            <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
              <h3 style={{ color: '#ff4d4f', fontSize: '1.2rem', fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(255, 77, 79, 0.3)' }}>
                🎁 DONATE CHO TÔI NHÉ ! 🎁
              </h3>
            </div>
          )}
        </div>

        <div className="download-modal-actions">
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-primary ${!isAgreed ? 'disabled' : ''}`}
            onClick={handleDownloadClick}
            style={{ opacity: isAgreed ? 1 : 0.5, cursor: isAgreed ? 'pointer' : 'not-allowed' }}
          >
            <Download size={18} />
            Vẫn Tải xuống
          </a>
          <button
            className="btn-outline"
            onClick={() => {
              onClose();
              if (onContact) onContact();
            }}
          >
            <MessageSquare size={18} />
            Liên hệ nhận Key
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DownloadConfirmModal;
