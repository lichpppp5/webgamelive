import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import './DocDetail.css';

const DocDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="doc-detail-page container">
        <div className="skeleton" style={{ width: '100px', height: '24px', marginBottom: '2rem' }}></div>
        <div className="skeleton" style={{ width: '80%', height: '40px', marginBottom: '1rem' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="doc-detail-page container text-center">
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/docs" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="doc-detail-page container page-enter">
      <Link to="/docs" className="back-link">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <article className="doc-article">
        <header className="doc-header">
          <h1 className="doc-title">{article.title}</h1>
          <div className="doc-meta">
            <span className="meta-item">
              <Calendar size={14} />
              {new Date(article.created_at).toLocaleDateString('vi-VN')}
            </span>
            <span className="meta-item">
              <Clock size={14} />
              5 phút đọc
            </span>
          </div>
        </header>

        {article.thumbnail && (
          <div className="doc-hero-img">
            <img src={article.thumbnail} alt={article.title} />
          </div>
        )}

        <div 
          className="doc-content custom-html-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
};

export default DocDetail;
