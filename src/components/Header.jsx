import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, X, Zap } from 'lucide-react';
import { useCart } from '../context/AppContext';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery }) => {
  const { cartCount } = useCart();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    if (setSearchQuery) setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    if (setSearchQuery) setSearchQuery('');
  };

  return (
    <header className="header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="TOOLLIVE - Trang chủ">
          <span className="logo-icon"><Zap size={20} fill="currentColor" /></span>
          <span className="logo-text text-gradient">TOOLLIVE</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="header-search-wrap">
          <div className={`header-search ${searchQuery ? 'has-value' : ''}`}>
            <Search size={17} className="search-icon-left" />
            <input
              type="text"
              placeholder="Tìm kiếm tool, game, app..."
              value={searchQuery || ''}
              onChange={handleSearchChange}
              id="header-search-input"
              aria-label="Tìm kiếm sản phẩm"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={clearSearch} aria-label="Xóa tìm kiếm">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Mobile Search Toggle */}
          <button
            className="icon-btn mobile-search-btn"
            onClick={() => setIsMobileSearchOpen(prev => !prev)}
            aria-label="Mở tìm kiếm"
          >
            <Search size={20} />
          </button>

          {/* Cart */}
          <Link to="/cart" className="icon-btn cart-btn" aria-label={`Danh sách tải (${cartCount} sản phẩm)`}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="cart-badge animate-scaleIn">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
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
    </header>
  );
};

export default Header;
