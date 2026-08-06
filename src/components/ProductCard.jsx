import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Info, Share2 } from 'lucide-react';
import ContactModal from './ContactModal';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link">
        <div className="product-image">
          <img src={product.image} alt={product.title} />
          {product.isHot && <span className="badge-hot">HOT</span>}
          <button className="share-btn" onClick={(e) => { e.preventDefault(); /* handle share */ }}>
            <Share2 size={16} />
          </button>
        </div>
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>
        
        <div className="product-stats">
          <span className="download-dot"></span>
          <span className="download-text">Lượt tải xuống: <strong>{product.downloads || 0}</strong></span>
        </div>

        <div className="product-actions">
          <button 
            className="action-btn btn-buy"
            onClick={() => setIsModalOpen(true)}
          >
            TẢI XUỐNG
          </button>
          <button 
            className="action-btn btn-detail"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            CHI TIẾT
          </button>
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

export default ProductCard;
