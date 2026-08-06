import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Check, Shield, ArrowLeft } from 'lucide-react';
import ContactModal from '../components/ContactModal';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3005/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải chi tiết:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Đang tải thông tin sản phẩm...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm!</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page container">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Quay lại
      </Link>
      
      <div className="product-detail-container">
        <div className="product-gallery">
          <img src={product.image} alt={product.title} className="main-image" />
        </div>
        
        <div className="product-info-full">
          <span className="category-label">{product.category}</span>
          <h1 className="title">{product.title}</h1>
          
          <div className="price-section">
            <span className="current">{product.price.toLocaleString('vi-VN')}đ</span>
            {product.oldPrice > 0 && (
              <span className="old">{product.oldPrice.toLocaleString('vi-VN')}đ</span>
            )}
            {product.oldPrice > 0 && (
              <span className="discount">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>
          
          <div 
            className="description ql-editor-content" 
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />
          
          <div className="features">
            <div className="feature-item">
              <Check size={20} className="icon-success" /> Giao hàng tự động
            </div>
            <div className="feature-item">
              <Shield size={20} className="icon-primary" /> Bảo hành 100%
            </div>
            <div className="feature-item">
              <Check size={20} className="icon-success" /> Hỗ trợ cài đặt
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="btn-primary btn-large w-full" onClick={() => setIsModalOpen(true)}>
              TẢI XUỐNG
            </button>
            <button className="btn-outline btn-large w-full" onClick={() => setIsModalOpen(true)}>
              <ShoppingCart size={20} /> Thêm Vào Giỏ Hàng
            </button>
          </div>
        </div>
      </div>
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productTitle={product.title} 
      />
    </div>
  );
};

export default ProductDetail;
