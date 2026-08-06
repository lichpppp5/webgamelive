import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import HeroBanner from '../components/HeroBanner';
import { categories } from '../data/mockData';
import './Home.css';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3005/api/products')
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải dữ liệu:', err);
        setLoading(false);
      });
  }, []);

  const filteredGames = activeCategory === 'all' 
    ? games 
    : games.filter(game => game.category === categories.find(c => c.id === activeCategory)?.name);

  return (
    <div className="home-page container">
      <div className="dashboard-layout">
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} games={games} />
        
        <div className="main-content-area">
          <HeroBanner />
          
          <div className="top-bar">
            <div className="result-count">Hiển thị 1–{filteredGames.length} của {filteredGames.length} kết quả</div>
            <select className="sort-select">
              <option>Sắp xếp theo mới nhất</option>
              <option>Sắp xếp theo lượt tải</option>
              <option>Sắp xếp theo giá</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state" style={{ padding: '4rem 0' }}>Đang tải dữ liệu...</div>
          ) : (
            <div className="product-grid">
              {filteredGames.map(game => (
                <ProductCard key={game.id} product={game} />
              ))}
            </div>
          )}
          
          {!loading && filteredGames.length === 0 && (
            <div className="empty-state">
              <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
