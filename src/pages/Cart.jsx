import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import ContactModal from '../components/ContactModal';
import { useCart, useToast } from '../context/AppContext';
import { useState } from 'react';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (item) => {
    removeFromCart(item.id);
    showToast(`Đã xóa "${item.title}" khỏi giỏ hàng`, 'info');
  };

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    updateQuantity(id, newQty);
  };

  return (
    <div className="cart-page container page-enter">
      <div className="cart-header">
        <ShoppingBag size={28} />
        <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>
        {cartItems.length > 0 && (
          <span className="cart-header-count">{cartItems.length} sản phẩm</span>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Danh sách tải đang trống</h2>
          <p>Thêm sản phẩm vào giỏ để tiến hành mua hàng.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.9rem 2rem' }}>
            ← Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item animate-fadeInUp">
                <Link to={`/product/${item.id}`} className="cart-item-img-wrap">
                  {item.image && (item.image.endsWith('.mp4') || item.image.endsWith('.webm')) ? (
                    <video src={item.image} autoPlay loop muted playsInline className="cart-item-img" />
                  ) : (
                    <img src={item.image} alt={item.title} className="cart-item-img" />
                  )}
                </Link>

                <div className="cart-item-info">
                  <span className="cart-item-category">{item.category}</span>
                  <Link to={`/product/${item.id}`}>
                    <h3 className="cart-item-title">{item.title}</h3>
                  </Link>
                  <span className="cart-item-price">
                    {item.price > 0 ? item.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                  </span>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item)}
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>

              <div className="summary-lines">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-line">
                    <span className="summary-item-name">
                      {item.title}
                      <span className="summary-qty">×{item.quantity}</span>
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span>Tổng cộng</span>
                <span className="summary-total-price">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <p className="summary-note">Giá đã bao gồm hỗ trợ kỹ thuật và cài đặt.</p>

              <button
                className="btn-primary checkout-btn"
                onClick={() => setIsModalOpen(true)}
                id="checkout-btn"
              >
                Thanh Toán &amp; Liên Hệ <ArrowRight size={18} />
              </button>

              <Link to="/" className="continue-shopping">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItems={cartItems}
        totalAmount={cartTotal}
      />
    </div>
  );
};

export default Cart;
