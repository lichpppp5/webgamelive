import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff } from 'lucide-react';
import './Policy.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="policy-page container page-enter">
      <div className="policy-header">
        <Shield size={48} className="policy-icon" />
        <h1 className="policy-title">Chính Sách Bảo Mật</h1>
        <p className="policy-last-updated">Cập nhật lần cuối: Tháng 8/2026</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Mục Đích Thu Thập Dữ Liệu</h2>
          <p>
            TOOLLIVE ("chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chúng tôi thu thập một số dữ liệu cơ bản nhằm mục đích:
          </p>
          <ul>
            <li>Thống kê lượng truy cập website (để hiển thị số lượt truy cập).</li>
            <li>Bảo vệ hệ thống khỏi các hành vi tấn công từ chối dịch vụ (DDoS) và spam.</li>
            <li>Cải thiện trải nghiệm người dùng trên nền tảng.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. Dữ Liệu Được Thu Thập</h2>
          <p>Khi bạn truy cập website, hệ thống có thể tự động ghi nhận các thông tin cơ bản sau:</p>
          <ul>
            <li><strong>Địa chỉ IP (Đã ẩn danh):</strong> Chúng tôi lưu trữ địa chỉ IP của bạn dưới dạng ẩn danh (ví dụ: 192.168.1.xxx) để đảm bảo không thể định danh cá nhân cụ thể, tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.</li>
            <li><strong>Thông tin trình duyệt (User-Agent):</strong> Loại trình duyệt, hệ điều hành thiết bị bạn đang sử dụng.</li>
            <li><strong>Cookie:</strong> Các tệp văn bản nhỏ lưu trên thiết bị của bạn để duy trì trạng thái tùy chọn (ví dụ: đã đồng ý với chính sách cookie).</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Sử Dụng và Chia Sẻ Dữ Liệu</h2>
          <p>
            Dữ liệu của bạn <strong>chỉ</strong> được sử dụng cho mục đích nội bộ nhằm duy trì hoạt động website. Chúng tôi <strong>cam kết tuyệt đối không bán, cho thuê hoặc chia sẻ</strong> dữ liệu của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Quyền Của Người Dùng</h2>
          <p>
            Bạn có quyền từ chối sử dụng Cookie bằng cách thay đổi cài đặt trong trình duyệt của mình. Tuy nhiên, một số tính năng ghi nhớ của website có thể không hoạt động chính xác.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Cam Kết An Toàn</h2>
          <p>
            Mọi thao tác giao dịch (nếu có) thông qua chuyển khoản/donate đều diễn ra ngoài hệ thống website (thông qua ứng dụng ngân hàng của bạn). Chúng tôi không lưu trữ thông tin thẻ tín dụng hay tài khoản ngân hàng của bạn.
          </p>
        </section>

        <div className="policy-footer-actions">
          <Link to="/" className="btn-primary">Quay lại Trang Chủ</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
