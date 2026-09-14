import { ShieldAlert, Target, AlertTriangle, Ban, FileWarning } from 'lucide-react';
import './DisclaimerSection.css';

const DisclaimerSection = () => {
  return (
    <div className="disclaimer-section">
      <div className="disclaimer-section-header">
        <h2><ShieldAlert size={28} /> ĐIỀU KHOẢN & MIỄN TRỪ TRÁCH NHIỆM</h2>
      </div>
      
      <div className="disclaimer-section-body">
        <div className="disclaimer-box">
          <div className="disclaimer-box-title">
            <span className="disclaimer-box-icon" style={{color: '#00c6ff', background: 'rgba(0, 198, 255, 0.1)'}}>
              <Target size={18} />
            </span>
            Mục đích
          </div>
          <div className="disclaimer-box-text">
            Các công cụ tiện ích, Game tương tác và phần mềm tự phát triển trên hệ thống chỉ phục vụ tự động hóa quy trình, học tập, giải trí, nghiên cứu và tối ưu hóa công việc hợp pháp.
          </div>
        </div>

        <div className="disclaimer-box">
          <div className="disclaimer-box-title">
            <span className="disclaimer-box-icon" style={{color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)'}}>
              <AlertTriangle size={18} />
            </span>
            Rủi ro nền tảng
          </div>
          <div className="disclaimer-box-text">
            Khách hàng tự chịu 100% rủi ro liên quan đến tài khoản game/mạng xã hội (khóa nick, quét vi phạm, cập nhật thuật toán từ bên thứ ba) trong quá trình vận hành tool.
          </div>
        </div>

        <div className="disclaimer-box">
          <div className="disclaimer-box-title">
            <span className="disclaimer-box-icon" style={{color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)'}}>
              <Ban size={18} />
            </span>
            Nghiêm cấm
          </div>
          <div className="disclaimer-box-text">
            Tuyệt đối không sử dụng phần mềm vào mục đích gian lận phá hoại, lừa đảo, tấn công mạng hoặc bất kỳ hành vi nào vi phạm pháp luật.
          </div>
        </div>

        <div className="disclaimer-box">
          <div className="disclaimer-box-title">
            <span className="disclaimer-box-icon" style={{color: '#10b981', background: 'rgba(16, 185, 129, 0.1)'}}>
              <FileWarning size={18} />
            </span>
            Miễn trừ
          </div>
          <div className="disclaimer-box-text">
            Chúng tôi miễn trừ toàn bộ trách nhiệm dân sự, hình sự và bồi thường thiệt hại phát sinh từ việc sử dụng tool sai mục đích.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerSection;
