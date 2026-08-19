import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './Docs.css';

const Docs = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching articles:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="docs-page container page-enter">
      <div className="docs-header">
        <h1 className="docs-title">
          <BookOpen className="docs-icon" />
          Tài Liệu & Hướng Dẫn MMO
        </h1>
        <p className="docs-subtitle">Các bài viết chia sẻ kinh nghiệm, hướng dẫn sử dụng công cụ và tối ưu hóa hệ thống.</p>
      </div>

      {loading ? (
        <div className="docs-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="doc-card-skeleton skeleton"></div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="docs-grid">
          {articles.map((article, i) => (
            <Link 
              to={`/docs/${article.id}`} 
              key={article.id} 
              className="doc-card card-enter"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="doc-card-img-wrapper">
                {article.thumbnail ? (
                  <img src={article.thumbnail} alt={article.title} className="doc-card-img" />
                ) : (
                  <div className="doc-card-img-placeholder">
                    <BookOpen size={40} />
                  </div>
                )}
              </div>
              <div className="doc-card-content">
                <h2 className="doc-card-title">{article.title}</h2>
                <span className="doc-card-date">
                  {new Date(article.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Chưa có tài liệu nào</h3>
          <p>Các bài viết hướng dẫn sẽ sớm được cập nhật.</p>
        </div>
      )}
    </div>
  );
};

export default Docs;
