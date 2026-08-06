import { Link } from 'react-router-dom';
import { Gamepad2, MonitorPlay, Cpu, Wrench, Sparkles, MessageSquare, Send, MessageCircle } from 'lucide-react';
import { categories } from '../data/mockData';
import './Sidebar.css';

const getCategoryIcon = (id) => {
  switch(id) {
    case 'all': return <Sparkles size={18} />;
    case 'tuong-tac': return <MonitorPlay size={18} />;
    case 'tool-mmo': return <Wrench size={18} />;
    case 'treo-afk': return <Cpu size={18} />;
    default: return <Gamepad2 size={18} />;
  }
};

const getCategoryCount = (name, games) => {
  if (!games) return 0;
  if (name === 'Tất cả') return games.length;
  return games.filter(g => g.category === name).length;
};

const Sidebar = ({ activeCategory, setActiveCategory, games }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">DANH MỤC</h3>
        <ul className="category-list">
          {categories.map(cat => (
            <li key={cat.id}>
              <button 
                className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="category-icon">{getCategoryIcon(cat.id)}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-count">({getCategoryCount(cat.name, games)})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-community">
        <a href="https://zalo.me" target="_blank" rel="noreferrer" className="community-btn btn-zalo">
          <MessageCircle size={20} /> Zalo
        </a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="community-btn btn-facebook">
          <MessageSquare size={20} /> Facebook
        </a>
        <a href="https://t.me" target="_blank" rel="noreferrer" className="community-btn btn-telegram">
          <Send size={20} /> Telegram
        </a>
        <a href="#" target="_blank" rel="noreferrer" className="community-btn btn-wechat">
          <MessageCircle size={20} /> WeChat
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
