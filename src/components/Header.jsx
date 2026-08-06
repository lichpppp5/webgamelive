import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-left">
          <button className="menu-btn"><Menu size={24} /></button>
          <Link to="/" className="logo text-gradient">
            TOOLLIVE
          </Link>
        </div>
        
        <div className="header-search">
          <input type="text" placeholder="Tìm kiếm game/app..." />
          <button><Search size={20} /></button>
        </div>

        <div className="header-right">
          <Link to="/cart" className="cart-icon">
            <ShoppingCart size={24} />
            <span className="cart-count">0</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
