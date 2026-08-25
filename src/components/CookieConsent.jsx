import { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-content">
        <p>
          Chúng tôi sử dụng cookie và thông tin ẩn danh để cải thiện trải nghiệm trên trang web này. 
          Việc tiếp tục sử dụng website đồng nghĩa với việc bạn chấp nhận 
          <a href="/privacy" className="cookie-link"> Chính sách bảo mật</a> của chúng tôi.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="btn-primary" onClick={handleAccept}>
          Tôi đồng ý
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
