import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, MonitorPlay, Cpu, Wrench, Sparkles, MessageCircle, Send, MessageSquare, Layers, BookOpen, AppWindow } from 'lucide-react';
import { categories } from '../data/mockData';
import { useSettings } from '../context/AppContext';
import ContactModal from './ContactModal';
import './Sidebar.css';

const getCategoryIcon = (id) => {
  switch (id) {
    case 'all': return <Sparkles size={17} />;
    case 'tuong-tac': return <MonitorPlay size={17} />;
    case 'tools-tien-ich':
    case 'tools-mmo': return <Wrench size={17} />;
    case 'tools-suu-tam': return <Layers size={17} />;
    case 'treo-afk': return <Cpu size={17} />;
    case 'phan-mem': return <AppWindow size={17} />;
    default: return <Gamepad2 size={17} />;
  }
};

const getCategoryCount = (name, games, softwareCount = 0) => {
  if (name === 'Phần Mềm') return softwareCount;
  if (!games) return 0;
  if (name === 'Tất cả') return games.length;
  if (name === 'Tools Tiện Ích') {
    return games.filter(g => g.category === 'Tools Tiện Ích' || g.category === 'Tools MMO').length;
  }
  return games.filter(g => g.category === name).length;
};

const Sidebar = ({ activeCategory, setActiveCategory, games, softwareCount = 0 }) => {
  const { contactSettings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="sidebar" aria-label="Sidebar điều hướng">
      {/* Categories */}
      <div className="sidebar-section">
        <h2 className="sidebar-title">
          <Sparkles size={14} />
          DANH MỤC
        </h2>
        <ul className="category-list" role="list">
          {categories.map(cat => {
            const count = getCategoryCount(cat.name, games, softwareCount);
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id} role="listitem">
                <button
                  className={`category-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${cat.name} (${count} công cụ)`}
                >
                  {isActive && <span className="active-indicator" aria-hidden="true" />}
                  <span className="category-icon" aria-hidden="true">
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count" aria-label={`${count} công cụ`}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
          <li role="listitem">
            <Link
              to="/docs"
              className="category-item"
              aria-label="Tài Liệu & Hướng Dẫn"
            >
              <span className="category-icon" aria-hidden="true">
                <BookOpen size={17} />
              </span>
              <span className="category-name">Tài Liệu & Hướng Dẫn</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Donate Section */}
      {contactSettings?.donateEnabled === 'true' && (
        <>
          <div className="sidebar-section sidebar-donate-section">
            <h2 className="sidebar-title" style={{ fontSize: '0.78rem', color: '#ff4d4f' }}>
              ❤️ DONATE
            </h2>
            <div className="donate-container">
              <p className="donate-text">{contactSettings.donateText || 'Nếu thấy hữu ích Donate tôi cốc cafe nha !'}</p>
              
              {contactSettings.donateQR && (
                <div className="donate-qr-wrap">
                  <img src={contactSettings.donateQR} alt="Donate QR" className="donate-qr" />
                </div>
              )}
              
              <div className="donate-info-box">
                {contactSettings.donateBank && (
                  <div className="donate-row">
                    <span className="donate-label">Ngân hàng:</span>
                    <strong className="donate-value">{contactSettings.donateBank}</strong>
                  </div>
                )}
                {contactSettings.donateAccount && (
                  <div className="donate-row">
                    <span className="donate-label">STK:</span>
                    <strong className="donate-value">{contactSettings.donateAccount}</strong>
                  </div>
                )}
                {contactSettings.donateName && (
                  <div className="donate-row">
                    <span className="donate-label">Tên:</span>
                    <strong className="donate-value">{contactSettings.donateName}</strong>
                  </div>
                )}
                {contactSettings.donateContent && (
                  <div className="donate-row">
                    <span className="donate-label">Nội dung CK:</span>
                    <strong className="donate-value">{contactSettings.donateContent}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="sidebar-divider" />
        </>
      )}

      {/* Community */}
      <div className="sidebar-section sidebar-community-section">
        <h2 className="sidebar-title" style={{ fontSize: '0.78rem' }}>
          <MessageCircle size={14} />
          LIÊN HỆ - TƯ VẤN
        </h2>
        <div className="community-links">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="community-btn btn-zalo"
            aria-label="Liên hệ qua Zalo"
            style={{ cursor: 'pointer', border: 'none' }}
          >
            <MessageCircle size={16} />
            <span>Zalo QR</span>
          </button>
          <a
            href={contactSettings?.facebook || 'https://facebook.com'}
            target="_blank"
            rel="noreferrer"
            className="community-btn btn-facebook"
            aria-label="Liên hệ qua Facebook"
          >
            <MessageSquare size={16} />
            <span>Facebook</span>
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            className="community-btn btn-telegram"
            aria-label="Liên hệ qua Telegram"
          >
            <Send size={16} />
            <span>Telegram</span>
          </a>
        </div>
      </div>
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;
