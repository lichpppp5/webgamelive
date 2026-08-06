import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import ContactModal from '../components/ContactModal';
import './Cart.css';

const Cart = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập giỏ hàng bằng cách gọi 2 API
    Promise.all([
      fetch('http://localhost:3005/api/products/g1').then(r => r.json()),
      fetch('http://localhost:3005/api/products/g3').then(r => r.json())
    ]).then(([p1, p2]) => {
      if(!p1.error && !p2.error) {
        setCartItems([
          { ...p1, quantity: 1 },
          { ...p2, quantity: 2 }
        ]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="cart-page container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="page-title">Giỏ Hàng Của Bạn</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Giỏ hàng đang trống.</p>
          <Link to="/" className="btn-primary">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item-img" />
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <p className="cart-item-price">{item.price.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button>-</button>
                    <span>{item.quantity}</span>
                    <button>+</button>
                  </div>
                  <button className="remove-btn">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Tổng cộng</h3>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="summary-row total-row">
              <span>Thành tiền:</span>
              <span className="total-price">{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <button className="btn-primary w-full checkout-btn" onClick={() => setIsModalOpen(true)}>
              Thanh Toán & Liên Hệ <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Cart;
