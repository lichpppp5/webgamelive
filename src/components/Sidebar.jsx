import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, MonitorPlay, Cpu, Wrench, Sparkles, MessageCircle, Send, MessageSquare } from 'lucide-react';
import { categories } from '../data/mockData';
import { useSettings } from '../context/AppContext';
import ContactModal from './ContactModal';
import './Sidebar.css';

const getCategoryIcon = (id) => {
  switch (id) {
    case 'all': return <Sparkles size={17} />;
    case 'tuong-tac': return <MonitorPlay size={17} />;
    case 'tool-mmo': return <Wrench size={17} />;
    case 'treo-afk': return <Cpu size={17} />;
    default: return <Gamepad2 size={17} />;
  }
};

const getCategoryCount = (name, games) => {
  if (!games) return 0;
  if (name === 'Tất cả') return games.length;
  return games.filter(g => g.category === name).length;
};

const Sidebar = ({ activeCategory, setActiveCategory, games }) => {
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
            const count = getCategoryCount(cat.name, games);
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id} role="listitem">
                <button
                  className={`category-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${cat.name} (${count} sản phẩm)`}
                >
                  {isActive && <span className="active-indicator" aria-hidden="true" />}
                  <span className="category-icon" aria-hidden="true">
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count" aria-label={`${count} sản phẩm`}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

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
