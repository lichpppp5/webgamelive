import { createPortal } from 'react-dom';
import { X, Download, MessageSquare } from 'lucide-react';
import './DownloadConfirmModal.css';

const DownloadConfirmModal = ({ isOpen, onClose, downloadLink, onContact }) => {
  if (!isOpen) return null;

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
            Vui lòng liên hệ thanh toán và nhận key kích hoạt. Xin cảm ơn !
          </p>
        </div>

        <div className="download-modal-actions">
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            onClick={onClose}
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
