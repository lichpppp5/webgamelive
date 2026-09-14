import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, X, Zap, Sun, Moon, Menu, MessageSquare, Compass, AppWindow, Sparkles, BookOpen } from 'lucide-react';
import { useCart, useTheme } from '../context/AppContext';
import ContactModal from './ContactModal';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery }) => {
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (e) => {
    if (setSearchQuery) setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    if (setSearchQuery) setSearchQuery('');
  };

  const handleNavClick = (target, category = null) => {
    setIsMobileNavOpen(false);
    if (category) {
      navigate(`/?category=${category}`);
      setTimeout(() => {
        const el = document.getElementById('product-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-inner container">
          {/* Mobile Hamburger Toggle */}
          <button 
            className="icon-btn mobile-menu-btn" 
            onClick={() => setIsMobileNavOpen(prev => !prev)}
            aria-label="Mở menu điều hướng"
          >
            {isMobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="logo" aria-label="TOOLLIVE - Trang chủ" onClick={() => setIsMobileNavOpen(false)}>
            <span className="logo-icon"><Zap size={20} fill="currentColor" /></span>
            <span className="logo-text text-gradient">TOOLLIVE</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="header-nav" aria-label="Menu chính">
            <button 
              type="button" 
              className="nav-link" 
              onClick={() => handleNavClick('product-section', 'all')}
            >
              <Compass size={15} />
              <span>Kho Tools &amp; Game</span>
            </button>
            <button 
              type="button" 
              className="nav-link nav-link-highlight" 
              onClick={() => handleNavClick('product-section', 'phan-mem')}
            >
              <AppWindow size={15} />
              <span>Phần Mềm</span>
              <span className="nav-badge-pill">Hot</span>
            </button>
            <button 
              type="button" 
              className="nav-link" 
              onClick={() => handleNavClick('features-section')}
            >
              <Sparkles size={15} />
              <span>Ưu Điểm</span>
            </button>
            <Link to="/docs" className="nav-link">
              <BookOpen size={15} />
              <span>Tài Liệu</span>
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="header-search-wrap">
            <div className={`header-search ${searchQuery ? 'has-value' : ''}`}>
              <Search size={16} className="search-icon-left" />
              <input
                type="text"
                placeholder="Tìm kiếm tool, game, app..."
                value={searchQuery || ''}
                onChange={handleSearchChange}
                id="header-search-input"
                aria-label="Tìm kiếm công cụ"
              />
              {searchQuery ? (
                <button className="search-clear-btn" onClick={clearSearch} aria-label="Xóa tìm kiếm">
                  <X size={14} />
                </button>
              ) : (
                <span className="search-kbd-hint">⌘K</span>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="header-actions">
            {/* Theme Toggle */}
            <button
              className="icon-btn theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
              aria-label="Đổi giao diện Sáng / Tối"
              id="theme-toggle-button"
            >
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            {/* Mobile Search Toggle */}
            <button
              className="icon-btn mobile-search-btn"
              onClick={() => setIsMobileSearchOpen(prev => !prev)}
              aria-label="Mở tìm kiếm"
            >
              <Search size={19} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="icon-btn cart-btn" aria-label={`Danh sách tải (${cartCount} công cụ)`}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="cart-badge animate-scaleIn">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* CTA Button: Tư Vấn Ngay */}
            <button
              type="button"
              className="header-cta-btn"
              onClick={() => setIsContactOpen(true)}
              aria-label="Tư vấn hỗ trợ trực tuyến"
            >
              <MessageSquare size={15} />
              <span>Tư Vấn Ngay</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="mobile-search-dropdown">
            <div className="mobile-search-inner container">
              <div className="header-search has-value mobile-active">
                <Search size={17} className="search-icon-left" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tool, game, app..."
                  value={searchQuery || ''}
                  onChange={handleSearchChange}
                  autoFocus
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={clearSearch}>
                    <X size={15} />
                  </button>
                )}
              </div>
              <button className="btn-ghost" onClick={() => setIsMobileSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="mobile-nav-drawer animate-fadeIn">
            <div className="mobile-nav-links">
              <button 
                type="button" 
                className="mobile-nav-item" 
                onClick={() => handleNavClick('product-section', 'all')}
              >
                <Compass size={18} />
                <span>Kho Tools &amp; Game</span>
              </button>
              <button 
                type="button" 
                className="mobile-nav-item" 
                onClick={() => handleNavClick('product-section', 'phan-mem')}
              >
                <AppWindow size={18} />
                <span>Phần Mềm Nổi Bật</span>
                <span className="nav-badge-pill">Hot</span>
              </button>
              <button 
                type="button" 
                className="mobile-nav-item" 
                onClick={() => handleNavClick('features-section')}
              >
                <Sparkles size={18} />
                <span>Ưu Điểm Vượt Trội</span>
              </button>
              <Link 
                to="/docs" 
                className="mobile-nav-item" 
                onClick={() => setIsMobileNavOpen(false)}
              >
                <BookOpen size={18} />
                <span>Tài Liệu Hướng Dẫn</span>
              </Link>
            </div>
            <div className="mobile-nav-footer">
              <button
                type="button"
                className="btn-primary w-full"
                style={{ justifyContent: 'center', width: '100%' }}
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsContactOpen(true);
                }}
              >
                <MessageSquare size={16} />
                <span>Liên Hệ Tư Vấn Kỹ Thuật</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  );
};

export default Header;
