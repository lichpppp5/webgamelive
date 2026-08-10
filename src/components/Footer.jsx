import { Link } from 'react-router-dom';
import { Zap, MessageCircle, Send, MessageSquare, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/AppContext';
import './Footer.css';

const Footer = () => {
  const { contactSettings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon"><Zap size={18} fill="currentColor" /></span>
            <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1.5px' }}>TOOLLIVE</span>
          </Link>
          <p className="footer-desc">
            Nền tảng cung cấp tool và game MMO chất lượng cao tại Việt Nam. 
            Hỗ trợ cài đặt, vận hành tận tâm.
          </p>
          <div className="footer-socials">
            <a href={contactSettings?.facebook || 'https://facebook.com'} target="_blank" rel="noreferrer" className="social-link" title="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href={contactSettings?.zalo || 'https://zalo.me/'} target="_blank" rel="noreferrer" className="social-link" title="Zalo" style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Zalo
            </a>
            <a href={contactSettings?.telegram || 'https://t.me/'} target="_blank" rel="noreferrer" className="social-link" title="Telegram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-col">
          <h3 className="footer-col-title">Sản phẩm</h3>
          <ul className="footer-links">
            <li><Link to="/?cat=tuong-tac">Game Tương Tác</Link></li>
            <li><Link to="/?cat=tool-mmo">Tool MMO</Link></li>
            <li><Link to="/?cat=treo-afk">Treo AFK</Link></li>
            <li><Link to="/cart">Giỏ hàng</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Hỗ trợ</h3>
          <ul className="footer-links">
            <li><a href="https://zalo.me/0833954354" target="_blank" rel="noreferrer">Hướng dẫn cài đặt</a></li>
            <li><a href="https://zalo.me/0833954354" target="_blank" rel="noreferrer">Chính sách bảo hành</a></li>
            <li><a href="https://zalo.me/0833954354" target="_blank" rel="noreferrer">Liên hệ tư vấn</a></li>
          </ul>
        </div>

        {/* CTA */}
        <div className="footer-col footer-cta-col">
          <h3 className="footer-col-title">Cần tư vấn?</h3>
          <p className="footer-cta-desc">Liên hệ ngay để được hỗ trợ miễn phí và nhận ưu đãi tốt nhất.</p>
          <a
            href="https://zalo.me/0833954354"
            target="_blank"
            rel="noreferrer"
            className="footer-cta-btn"
          >
            Chat với tư vấn viên <ArrowRight size={15} />
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            © {year} <strong>TOOLLIVE</strong>. All rights reserved.
          </p>
          <p className="footer-tagline">
            Chuyên cung cấp game &amp; tool MMO chất lượng cao
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
