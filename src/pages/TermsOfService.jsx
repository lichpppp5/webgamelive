import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import './Policy.css';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="policy-page container page-enter">
      <div className="policy-header">
        <ScrollText size={48} className="policy-icon" />
        <h1 className="policy-title">Điều Khoản Sử Dụng</h1>
        <p className="policy-last-updated">Cập nhật lần cuối: Tháng 8/2026</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Mục Đích Hoạt Động</h2>
          <p>
            TOOLLIVE là một nền tảng <strong>chia sẻ cộng đồng, cung cấp tài liệu, công cụ, game và phần mềm nhằm mục đích học tập, nghiên cứu và tối ưu hóa quy trình làm việc.</strong> Chúng tôi không phải là một sàn thương mại điện tử chuyên nghiệp và các khoản thanh toán được xem như hình thức <strong>ủng hộ (Donate)</strong> cho công sức phát triển của tác giả.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Trách Nhiệm Người Dùng</h2>
          <p>Khi tải xuống hoặc sử dụng bất kỳ công cụ/phần mềm nào từ website, bạn đồng ý rằng:</p>
          <ul>
            <li>Bạn tự chịu hoàn toàn trách nhiệm đối với việc sử dụng công cụ.</li>
            <li>Việc sử dụng công cụ để can thiệp vào nền tảng của bên thứ 3 (ví dụ: TikTok, Facebook) có thể vi phạm điều khoản dịch vụ của các nền tảng đó. Chúng tôi <strong>không chịu trách nhiệm</strong> cho bất kỳ hậu quả nào phát sinh (như khóa tài khoản, hạn chế tính năng).</li>
            <li>Tuyệt đối không sử dụng công cụ do chúng tôi chia sẻ cho các mục đích vi phạm pháp luật (như lừa đảo, tấn công mạng, đánh bạc).</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Giới Hạn Trách Nhiệm</h2>
          <p>
            Tất cả các công cụ được cung cấp "nguyên trạng". Mặc dù chúng tôi luôn nỗ lực đảm bảo chất lượng, nhưng chúng tôi không đưa ra bất kỳ bảo đảm tuyệt đối nào về tính năng không lỗi hoặc sự phù hợp cho một mục đích thương mại cụ thể.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Bản Quyền & Sở Hữu Trí Tuệ</h2>
          <p>
            Tất cả các mã nguồn mở được chia sẻ tuân thủ giấy phép nguồn mở tương ứng. Đối với các công cụ độc quyền của tác giả, bạn được cấp quyền sử dụng cá nhân (hoặc theo nhóm giới hạn) và không được phép bán lại, phân phối lại dưới bất kỳ hình thức nào khi chưa có sự cho phép.
          </p>
        </section>

        <div className="policy-footer-actions">
          <Link to="/" className="btn-primary">Đồng ý và Quay lại Trang Chủ</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
