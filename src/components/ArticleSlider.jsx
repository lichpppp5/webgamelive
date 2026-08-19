import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import './ArticleSlider.css';

const ArticleSlider = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.slice(0, 8)); // Lấy 8 bài mới nhất
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching articles:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <section className="article-slider-section">
      <div className="article-slider-header">
        <h2 className="article-slider-title">
          <BookOpen size={20} className="text-primary" />
          Tài Liệu & Hướng Dẫn Mới
        </h2>
        <Link to="/docs" className="article-slider-more">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>

      <div className="article-slider-container marquee-container">
        <div className="article-slider-track marquee-track">
          {/* Lặp lại 4 lần danh sách để đảm bảo đủ chiều dài cho hiệu ứng vô tận */}
          {[1, 2, 3, 4].map(group => (
            <div key={group} className="marquee-group">
              {articles.map((article, i) => (
                <Link to={`/docs/${article.id}`} key={`${article.id}-${group}-${i}`} className="article-slide-card marquee-item">
                  <div className="article-slide-img">
                    {article.thumbnail ? (
                      <img src={article.thumbnail} alt={article.title} />
                    ) : (
                      <div className="article-slide-placeholder">
                        <BookOpen size={30} />
                      </div>
                    )}
                  </div>
                  <div className="article-slide-content">
                    <h3 className="article-slide-title">{article.title}</h3>
                    <span className="article-slide-date">
                      {new Date(article.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleSlider;
