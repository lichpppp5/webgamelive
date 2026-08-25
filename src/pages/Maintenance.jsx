import { Settings } from 'lucide-react';
import './Maintenance.css';

const Maintenance = () => {
  return (
    <div className="maintenance-page">
      <div className="maintenance-icon-wrapper">
        <Settings size={48} className="maintenance-icon" />
      </div>
      <h1 className="maintenance-title">Website đang Bảo Trì</h1>
      <p className="maintenance-text">Rất xin lỗi vì sự bất tiện này</p>
      <p className="maintenance-text">Vui lòng quay lại sau</p>
    </div>
  );
};

export default Maintenance;
