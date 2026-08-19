import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Check } from 'lucide-react';
import './DisclaimerModal.css';

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAgreed = localStorage.getItem('disclaimerAgreed');
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('disclaimerAgreed', 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    // Nếu từ chối, chuyển hướng về google
    window.location.href = "https://google.com";
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="disclaimer-overlay" role="dialog" aria-modal="true">
      <div className="disclaimer-content">
        <div className="disclaimer-header">
          <h2><ShieldAlert size={28} color="#f59e0b" /> ĐIỀU KHOẢN & MIỄN TRỪ TRÁCH NHIỆM</h2>
        </div>
        
        <div className="disclaimer-body">
          <div className="disclaimer-item">
            <strong>Mục đích:</strong> Các công cụ MMO, Game Live và phần mềm tự phát triển trên hệ thống chỉ phục vụ tự động hóa quy trình, học tập, giải trí, nghiên cứu và tối ưu hóa công việc hợp pháp.
          </div>
          <div className="disclaimer-item">
            <strong>Rủi ro nền tảng:</strong> Khách hàng tự chịu 100% rủi ro liên quan đến tài khoản game/mạng xã hội (khóa nick, quét vi phạm, cập nhật thuật toán từ bên thứ ba) trong quá trình vận hành tool.
          </div>
          <div className="disclaimer-item">
            <strong>Nghiêm cấm:</strong> Tuyệt đối không sử dụng phần mềm vào mục đích gian lận phá hoại, lừa đảo, tấn công mạng hoặc bất kỳ hành vi nào vi phạm pháp luật.
          </div>
          <div className="disclaimer-item">
            <strong>Miễn trừ:</strong> Chúng tôi miễn trừ toàn bộ trách nhiệm dân sự, hình sự và bồi thường thiệt hại phát sinh từ việc sử dụng tool sai mục đích.
          </div>
        </div>

        <div className="disclaimer-actions">
          <button className="btn-decline" onClick={handleDecline}>
            Từ chối và thoát
          </button>
          <button className="btn-agree" onClick={handleAgree}>
            <Check size={18} /> Tôi đã hiểu và đồng ý
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DisclaimerModal;
