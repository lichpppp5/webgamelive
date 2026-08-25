import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Plus, Upload, Image as ImageIcon, Eye, EyeOff, LayoutDashboard, Search, X, Flame, Package, Save, Settings as SettingsIcon, BarChart2, Globe, Clock, RotateCcw, BookOpen } from 'lucide-react';
import { useToast, useSettings } from '../context/AppContext';
import './Admin.css';

const CATEGORIES = ['Tương tác', 'Tools MMO', 'Tools Sưu Tầm', 'Treo AFK'];

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const Admin = () => {
  const { showToast } = useToast();
  const { contactSettings, refreshSettings } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginShake, setLoginShake] = useState(false);

  const [activeTab, setActiveTab] = useState('products');
  const [analytics, setAnalytics] = useState({
    totalRealVisits: 0,
    todayVisits: 0,
    monthVisits: 0,
    recentVisits: []
  });
  const [settingsForm, setSettingsForm] = useState({
    zalo: '', facebook: '', telegram: '', zaloQr: '', visitCount: '1250',
    donateText: 'Nếu thấy hữu ích Donate tôi cốc cafe nha !', donateQR: '', donateName: '', donateBank: '', donateAccount: '', donateContent: '', donateEnabled: 'true'
  });

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTable, setSearchTable] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const formTopRef = useRef(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: CATEGORIES[0], price: 0, oldPrice: 0,
    image: '', downloads: 0, isHot: false, isFree: false, description: '', downloadLink: ''
  });

  const [articles, setArticles] = useState([]);
  const [articleSearch, setArticleSearch] = useState('');
  const [isArticleEditing, setIsArticleEditing] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [articleFormData, setArticleFormData] = useState({ title: '', content: '', thumbnail: '' });
  const [articleImagePreview, setArticleImagePreview] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate delay
    if (username === 'admin' && password === 'Chrlghk123#') {
      setIsAuthenticated(true);
      fetchGames();
    } else {
      setLoginShake(true);
      showToast('Sai tên đăng nhập hoặc mật khẩu!', 'error');
      setTimeout(() => setLoginShake(false), 600);
    }
    setLoginLoading(false);
  };

  useEffect(() => {
    if (contactSettings) {
      setSettingsForm(prev => ({
        ...prev,
        ...contactSettings
      }));
    }
  }, [contactSettings]);

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm)
    })
      .then(res => res.json())
      .then(() => {
        showToast('Đã lưu cấu hình liên hệ!', 'success');
        refreshSettings();
      })
      .catch(() => showToast('Lỗi khi lưu cấu hình', 'error'));
  };

  const fetchGames = () => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setGames(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const fetchAnalytics = () => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => { if (data) setAnalytics(data); })
      .catch(err => console.error(err));
  };

  const fetchArticles = () => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.error(err));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newVal }));
    if (name === 'image') setImagePreview(value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.location) {
          setFormData(prev => ({ ...prev, image: data.location }));
          setImagePreview(data.location);
          showToast('Ảnh đã được tải lên!', 'success');
        }
      })
      .catch(() => showToast('Lỗi tải ảnh lên!', 'error'));
  };

  const handleArticleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.location) {
          setArticleFormData(prev => ({ ...prev, thumbnail: data.location }));
          setArticleImagePreview(data.location);
          showToast('Ảnh đại diện bài viết đã tải lên!', 'success');
        }
      })
      .catch(() => showToast('Lỗi tải ảnh lên!', 'error'));
  };

  const handleZaloQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.location) {
          setSettingsForm(prev => ({ ...prev, zaloQr: data.location }));
          showToast('Đã tải lên Ảnh Mã QR Zalo!', 'success');
        }
      })
      .catch(() => showToast('Lỗi tải ảnh QR!', 'error'));
  };

  const handleDonateQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.location) {
          setSettingsForm(prev => ({ ...prev, donateQR: data.location }));
          showToast('Đã tải lên Ảnh Mã QR Donate!', 'success');
        }
      })
      .catch(() => showToast('Lỗi tải ảnh QR!', 'error'));
  };

  const handleInsertImageToDesc = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.location) {
          const isVideo = data.location.endsWith('.mp4') || data.location.endsWith('.webm');
          const mediaTag = isVideo 
            ? `\n<video src="${data.location}" autoPlay loop muted playsInline style="max-width:100%; border-radius:8px;"></video>\n`
            : `\n<img src="${data.location}" alt="Minh họa" />\n`;
          setFormData(prev => ({ ...prev, description: (prev.description || '') + mediaTag }));
          showToast(isVideo ? 'Đã chèn video vào nội dung!' : 'Đã chèn ảnh vào nội dung!', 'success');
        }
      })
      .catch(() => showToast('Lỗi tải ảnh!', 'error'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing
      ? `/api/products/${currentId}`
      : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, price: Number(formData.price), oldPrice: Number(formData.oldPrice), downloads: Number(formData.downloads) })
    })
      .then(res => res.json())
      .then(() => {
        fetchGames();
        resetForm();
        showToast(isEditing ? '✅ Cập nhật sản phẩm thành công!' : '✅ Thêm sản phẩm mới thành công!', 'success');
      })
      .catch(() => showToast('Lỗi khi lưu sản phẩm!', 'error'));
  };

  const handleEdit = (game) => {
    setIsEditing(true);
    setCurrentId(game.id);
    setFormData({
      title: game.title, category: game.category,
      price: game.price, oldPrice: game.oldPrice,
      image: game.image, downloads: game.downloads,
      isHot: game.isHot, isFree: game.isFree, description: game.description || '',
      downloadLink: game.downloadLink || ''
    });
    setImagePreview(game.image || '');
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Xóa sản phẩm "${title}"?`)) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(() => { fetchGames(); showToast('Đã xóa sản phẩm!', 'info'); })
        .catch(() => showToast('Lỗi khi xóa!', 'error'));
    }
  };

  const handleResetAllDownloads = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại TẤT CẢ lượt tải của toàn bộ sản phẩm về 0?')) {
      fetch('/api/products/reset-downloads', { method: 'POST' })
        .then(res => res.json())
        .then(() => {
          fetchGames();
          showToast('Đã đặt lại tất cả lượt tải về 0 thành công!', 'success');
        })
        .catch(() => showToast('Lỗi khi đặt lại lượt tải!', 'error'));
    }
  };

  const resetForm = () => {
    setIsEditing(false); setCurrentId(null);
    setFormData({ title: '', category: CATEGORIES[0], price: 0, oldPrice: 0, image: '', downloads: 0, isHot: false, isFree: false, description: '', downloadLink: '' });
    setImagePreview('');
  };

  const resetArticleForm = () => {
    setIsArticleEditing(false);
    setCurrentArticleId(null);
    setArticleFormData({ title: '', content: '', thumbnail: '' });
    setArticleImagePreview('');
  };

  const handleArticleInputChange = (e) => {
    const { name, value } = e.target;
    setArticleFormData(p => ({ ...p, [name]: value }));
    if (name === 'thumbnail') setArticleImagePreview(value);
  };

  const handleArticleSubmit = (e) => {
    e.preventDefault();
    const url = isArticleEditing ? `/api/articles/${currentArticleId}` : '/api/articles';
    const method = isArticleEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleFormData)
    })
      .then(res => res.json())
      .then(() => {
        fetchArticles();
        resetArticleForm();
        showToast(isArticleEditing ? 'Cập nhật bài viết thành công!' : 'Thêm bài viết mới thành công!', 'success');
      })
      .catch(() => showToast('Lỗi khi lưu bài viết!', 'error'));
  };

  const handleArticleEdit = (article) => {
    setIsArticleEditing(true);
    setCurrentArticleId(article.id);
    fetch(`/api/articles/${article.id}`)
      .then(res => res.json())
      .then(data => {
        setArticleFormData({
          title: data.title,
          content: data.content,
          thumbnail: data.thumbnail || ''
        });
        setArticleImagePreview(data.thumbnail || '');
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  };

  const handleArticleDelete = (id, title) => {
    if (window.confirm(`Xóa bài viết "${title}"?`)) {
      fetch(`/api/articles/${id}`, { method: 'DELETE' })
        .then(() => { fetchArticles(); showToast('Đã xóa bài viết!', 'info'); })
        .catch(() => showToast('Lỗi khi xóa!', 'error'));
    }
  };

  const filteredGames = games.filter(g =>
    g.title?.toLowerCase().includes(searchTable.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchTable.toLowerCase())
  );

  const filteredArticles = articles.filter(a =>
    a.title?.toLowerCase().includes(articleSearch.toLowerCase())
  );

  const hotCount = games.filter(g => g.isHot).length;

  // ── LOGIN SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="admin-login-bg">
        <div className="admin-login-glow" />
        <form
          className={`admin-login-form ${loginShake ? 'animate-shake' : ''}`}
          onSubmit={handleLogin}
        >
          <div className="login-logo">
            <LayoutDashboard size={28} />
          </div>
          <h2 className="login-title">Quản Trị Viên</h2>
          <p className="login-subtitle">Đăng nhập để quản lý hệ thống</p>

          <div className="login-field">
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              className="form-input"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              id="login-username"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label className="form-label">Mật khẩu</label>
            <div className="password-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="login-password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loginLoading}
            id="login-submit-btn"
          >
            {loginLoading ? (
              <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span>
            ) : 'Đăng nhập'}
          </button>
        </form>
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="admin-dashboard container page-enter">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Quản trị Hệ thống</h1>
          <p className="admin-page-sub">Thiết lập chung và quản lý sản phẩm</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-outline btn-logout" onClick={() => setIsAuthenticated(false)}>Đăng xuất</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
          style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'products' ? 'var(--primary)' : 'transparent', color: activeTab === 'products' ? '#000' : 'var(--text-100)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Package size={18} /> Quản lý Sản phẩm
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'settings' ? 'var(--primary)' : 'transparent', color: activeTab === 'settings' ? '#000' : 'var(--text-100)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <SettingsIcon size={18} /> Cài đặt chung
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}
          style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent', color: activeTab === 'analytics' ? '#000' : 'var(--text-100)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BarChart2 size={18} /> Thống kê Truy cập Thực tế
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => { setActiveTab('articles'); fetchArticles(); }}
          style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'articles' ? 'var(--primary)' : 'transparent', color: activeTab === 'articles' ? '#000' : 'var(--text-100)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BookOpen size={18} /> Quản lý Tài Liệu
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="admin-card analytics-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={22} color="var(--primary)" />
              Thống kê Lượt truy cập Thực tế
            </h2>
            <button type="button" className="btn-outline" onClick={fetchAnalytics} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              Cập nhật dữ liệu
            </button>
          </div>

          <div className="admin-stats" style={{ marginBottom: '2.5rem' }}>
            <StatCard icon={<Clock size={22} />} label="Truy cập Hôm nay" value={analytics.todayVisits.toLocaleString()} color="#00cffb" />
            <StatCard icon={<BarChart2 size={22} />} label="Truy cập Tháng này" value={analytics.monthVisits.toLocaleString()} color="var(--primary)" />
            <StatCard icon={<Globe size={22} />} label="Thực tế đã ghi nhận" value={analytics.totalRealVisits.toLocaleString()} color="var(--secondary)" />
          </div>

          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-200)' }}>
            Nhật ký 20 lượt ghé thăm gần đây nhất
          </h3>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thời gian</th>
                  <th>Địa chỉ IP</th>
                  <th>Thiết bị / Trình duyệt</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentVisits && analytics.recentVisits.length > 0 ? (
                  analytics.recentVisits.map((item, idx) => (
                    <tr key={item.id || idx} className="admin-row">
                      <td style={{ color: 'var(--text-400)' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{new Date(item.created_at).toLocaleString('vi-VN')}</td>
                      <td>
                        <span style={{ background: 'rgba(0, 207, 251, 0.1)', color: '#00cffb', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {item.ip || 'Chưa rõ'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-300)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.user_agent}>
                        {item.user_agent || 'Khách truy cập'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
                      Chưa có nhật ký truy cập nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-card settings-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={22} color="var(--primary)" />
            Cấu hình Liên hệ & Tư vấn
          </h2>
          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label className="form-label">Dòng chữ chạy ngang (Marquee)</label>
              <input className="form-input" type="text" value={settingsForm.marqueeText || ''} onChange={e => setSettingsForm({ ...settingsForm, marqueeText: e.target.value })} placeholder="VD: Chào mừng bạn đến với hệ thống..." />
            </div>
            <div className="form-group">
              <label className="form-label">Link hoặc Số điện thoại Zalo</label>
              <input className="form-input" type="text" value={settingsForm.zalo} onChange={e => setSettingsForm({ ...settingsForm, zalo: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Ảnh Mã QR Zalo (Hiển thị khi khách bấm liên hệ)</label>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <input className="form-input" type="text" value={settingsForm.zaloQr || ''} onChange={e => setSettingsForm({ ...settingsForm, zaloQr: e.target.value })} placeholder="URL ảnh QR hoặc bấm Tải QR..." style={{ flex: 1 }} />
                <label className="btn-outline upload-btn" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> Tải QR
                  <input type="file" style={{ display: 'none' }} onChange={handleZaloQrUpload} />
                </label>
              </div>
              {settingsForm.zaloQr && (
                <div style={{ marginTop: '0.6rem', width: '110px', height: '110px', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', background: '#fff', padding: '5px' }}>
                  <img src={settingsForm.zaloQr} alt="Zalo QR Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Link Facebook</label>
              <input className="form-input" type="url" value={settingsForm.facebook} onChange={e => setSettingsForm({ ...settingsForm, facebook: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Link Telegram</label>
              <input className="form-input" type="url" value={settingsForm.telegram} onChange={e => setSettingsForm({ ...settingsForm, telegram: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Số Lượt truy cập (Hiển thị &amp; Đếm)</label>
              <input className="form-input" type="number" value={settingsForm.visitCount || '1250'} onChange={e => setSettingsForm({ ...settingsForm, visitCount: e.target.value })} min="0" />
            </div>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />
            <h3 style={{ marginBottom: '1.5rem', color: '#ff4d4f' }}>❤️ Cấu hình Donate</h3>
            
            <div className="form-group">
              <label className="hot-toggle">
                <input type="checkbox" checked={settingsForm.donateEnabled === 'true'} onChange={e => setSettingsForm({ ...settingsForm, donateEnabled: e.target.checked ? 'true' : 'false' })} />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-label">Bật hiển thị bảng Donate ở Sidebar</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Dòng chữ hiển thị</label>
              <input className="form-input" type="text" value={settingsForm.donateText || ''} onChange={e => setSettingsForm({ ...settingsForm, donateText: e.target.value })} placeholder="VD: Nếu thấy hữu ích Donate tôi cốc cafe nha !" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Ảnh Mã QR Ngân hàng/Ví</label>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <input className="form-input" type="text" value={settingsForm.donateQR || ''} onChange={e => setSettingsForm({ ...settingsForm, donateQR: e.target.value })} placeholder="URL ảnh QR hoặc bấm Tải QR..." style={{ flex: 1 }} />
                <label className="btn-outline upload-btn" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> Tải QR
                  <input type="file" style={{ display: 'none' }} onChange={handleDonateQrUpload} />
                </label>
              </div>
              {settingsForm.donateQR && (
                <div style={{ marginTop: '0.6rem', width: '110px', height: '110px', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', background: '#fff', padding: '5px' }}>
                  <img src={settingsForm.donateQR} alt="Donate QR Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tên người nhận</label>
                <input className="form-input" type="text" value={settingsForm.donateName || ''} onChange={e => setSettingsForm({ ...settingsForm, donateName: e.target.value })} placeholder="VD: NGUYEN VAN A" />
              </div>
              <div className="form-group">
                <label className="form-label">Tên Ngân hàng / Ví</label>
                <input className="form-input" type="text" value={settingsForm.donateBank || ''} onChange={e => setSettingsForm({ ...settingsForm, donateBank: e.target.value })} placeholder="VD: MB Bank" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Số tài khoản</label>
              <input className="form-input" type="text" value={settingsForm.donateAccount || ''} onChange={e => setSettingsForm({ ...settingsForm, donateAccount: e.target.value })} placeholder="VD: 1903123456789" />
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung chuyển khoản mặc định</label>
              <input className="form-input" type="text" value={settingsForm.donateContent || ''} onChange={e => setSettingsForm({ ...settingsForm, donateContent: e.target.value })} placeholder="VD: Ung ho webgame" />
            </div>

            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '1rem 2rem' }}>
                <Save size={18} /> Lưu cấu hình
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'products' && (
        <>
          {/* Stats */}
          <div className="admin-stats">
            <StatCard icon={<Package size={22} />} label="Tổng sản phẩm" value={games.length} color="var(--primary)" />
            <StatCard icon={<Flame size={22} />} label="Đang HOT" value={hotCount} color="#ff6b6b" />
            <StatCard icon={<Upload size={22} />} label="Tổng lượt tải" value={games.reduce((s, g) => s + (g.downloads || 0), 0).toLocaleString()} color="var(--secondary)" />
            <StatCard icon={<Eye size={22} />} label="Lượt truy cập" value={parseInt(contactSettings.visitCount || '1250', 10).toLocaleString()} color="#00cffb" />
          </div>
    
          <div className="admin-content" ref={formTopRef}>
            {/* Form Panel */}
            <div className="admin-form-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="panel-title" style={{ margin: 0 }}>
                  {isEditing ? (
                    <><Edit size={18} /> Sửa Sản Phẩm</>
                  ) : (
                    <><Plus size={18} /> Thêm Sản Phẩm</>
                  )}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn-outline" onClick={handleResetAllDownloads} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#ff4d4f', borderColor: '#ff4d4f44' }} title="Đặt lại tất cả số lượt tải sản phẩm về 0">
                    <RotateCcw size={14} /> Đặt lại tất cả lượt tải về 0
                  </button>
                  <button type="button" className="btn-outline" onClick={resetForm} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    <Plus size={14} /> Làm mới form
                  </button>
                </div>
              </div>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input className="form-input" type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: Tool Auto Farm..." required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select className="form-input" name="category" value={formData.category} onChange={handleInputChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Lượt tải</label>
                <input className="form-input" type="number" name="downloads" value={formData.downloads} onChange={handleInputChange} min="0" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Giá bán (VNĐ)</label>
                <input className="form-input" type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Giá cũ (VNĐ)</label>
                <input className="form-input" type="number" name="oldPrice" value={formData.oldPrice} onChange={handleInputChange} min="0" />
              </div>
            </div>

            {/* Download Link */}
            <div className="form-group">
              <label className="form-label">
                🔗 Link tải xuống trực tiếp
                <span className="form-label-hint">(để trống nếu muốn hiện form liên hệ)</span>
              </label>
              <input
                className="form-input"
                type="url"
                name="downloadLink"
                value={formData.downloadLink}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/... hoặc https://mediafire.com/..."
              />
              {formData.downloadLink && (
                <div className="download-link-preview">
                  <span className="dlp-icon">✅</span>
                  <span>Người dùng sẽ được tải trực tiếp</span>
                  <a href={formData.downloadLink} target="_blank" rel="noreferrer" className="dlp-test">Kiểm tra link</a>
                </div>
              )}
              {!formData.downloadLink && (
                <div className="download-link-preview dlp-contact">
                  <span className="dlp-icon">💬</span>
                  <span>Người dùng sẽ thấy form liên hệ</span>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Ảnh đại diện</label>
              <div className="image-upload-row">
                <input
                  className="form-input"
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="URL ảnh hoặc tải lên..."
                  required
                  style={{ flex: 1 }}
                />
                <label className="btn-outline upload-btn" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> Tải lên
                  <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </div>
              {imagePreview && (
                <div className="image-preview">
                  {imagePreview && (imagePreview.endsWith('.mp4') || imagePreview.endsWith('.webm')) ? (
                    <video src={imagePreview} autoPlay loop muted playsInline onError={() => setImagePreview('')} />
                  ) : (
                    <img src={imagePreview} alt="Preview" onError={() => setImagePreview('')} />
                  )}
                  <button type="button" className="preview-remove" onClick={() => { setImagePreview(''); setFormData(p => ({ ...p, image: '' })); }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="desc-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Mô tả (hỗ trợ HTML)</label>
                <label className="btn-ghost insert-img-btn" style={{ cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={14} /> Chèn ảnh
                  <input type="file" style={{ display: 'none' }} onChange={handleInsertImageToDesc} />
                </label>
              </div>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả sản phẩm... Hỗ trợ <b>in đậm</b>, <br>, <img>, ..."
                style={{ minHeight: '200px' }}
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <label className="hot-toggle">
                <input type="checkbox" name="isHot" checked={formData.isHot} onChange={handleInputChange} />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-label">Đánh dấu HOT 🔥</span>
              </label>

              <label className="hot-toggle">
                <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleInputChange} />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-label">Sản phẩm Miễn phí 🎁</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" style={{ flex: 1 }} id="save-product-btn">
                {isEditing ? '💾 Cập nhật' : '➕ Thêm mới'}
              </button>
              {isEditing && (
                <button type="button" className="btn-ghost" onClick={resetForm}>Hủy</button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="admin-list-panel">
          <div className="list-panel-header">
            <h2 className="panel-title"><Package size={18} /> Danh sách ({filteredGames.length})</h2>
            <div className="table-search-wrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTable}
                onChange={e => setSearchTable(e.target.value)}
                className="table-search"
                id="admin-search-input"
              />
              {searchTable && (
                <button onClick={() => setSearchTable('')} className="table-search-clear">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '10px' }} />
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="admin-empty">
              <span>🔍</span> Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Danh mục</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map(game => (
                    <tr key={game.id} className="admin-row">
                      <td>
                        <div className="admin-img-wrap">
                        {game.image && (game.image.endsWith('.mp4') || game.image.endsWith('.webm')) ? (
                          <video src={game.image} autoPlay loop muted playsInline className="admin-table-img" />
                        ) : (
                          <img src={game.image} alt={game.title} className="admin-table-img"
                            onError={e => { e.target.src = 'https://via.placeholder.com/100x60?text=No+Image' }} />
                        )}
                        </div>
                      </td>
                      <td>
                        <span className="admin-title">{game.title}</span>
                        {game.isHot && <span className="hot-tag">🔥 HOT</span>}
                      </td>
                      <td className="admin-price">
                        {game.price > 0 ? game.price.toLocaleString() + 'đ' : 'LH'}
                      </td>
                      <td>
                        <span className="cat-pill">{game.category}</span>
                      </td>
                      <td>
                        <div className="action-cells">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(game)}
                            title="Sửa"
                            id={`edit-${game.id}`}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(game.id, game.title)}
                            title="Xóa"
                            id={`delete-${game.id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {activeTab === 'articles' && (
        <div className="admin-content" ref={formTopRef}>
          <div className="admin-form-panel">
            <h2 className="panel-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={22} color="var(--primary)" />
              {isArticleEditing ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
            </h2>
            <form onSubmit={handleArticleSubmit} className="product-form">
              <div className="form-group">
                <label className="form-label">Tiêu đề bài viết *</label>
                <input className="form-input" type="text" name="title" value={articleFormData.title} onChange={handleArticleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Ảnh đại diện (Thumbnail)</label>
                <div className="image-upload-row" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <input className="form-input" type="text" name="thumbnail" value={articleFormData.thumbnail} onChange={handleArticleInputChange} placeholder="URL ảnh hoặc tải lên..." style={{ flex: 1 }} />
                  <label className="btn-outline upload-btn" style={{ cursor: 'pointer' }}>
                    <Upload size={16} /> Tải lên
                    <input type="file" style={{ display: 'none' }} onChange={handleArticleImageUpload} />
                  </label>
                </div>
                {articleImagePreview && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={articleImagePreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px' }} onError={() => setArticleImagePreview('')} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung bài viết (Hỗ trợ HTML)</label>
                <textarea className="form-textarea" name="content" value={articleFormData.content} onChange={handleArticleInputChange} style={{ minHeight: '300px' }} placeholder="Sử dụng <h2>, <p>, <ul>, <b> để định dạng..."></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{isArticleEditing ? 'Cập nhật' : 'Thêm mới'}</button>
                {isArticleEditing && <button type="button" className="btn-ghost" onClick={resetArticleForm}>Hủy</button>}
              </div>
            </form>
          </div>

          <div className="admin-list-panel">
            <div className="list-panel-header">
              <h2 className="panel-title"><BookOpen size={18} /> Danh sách bài viết</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Lượt đọc</th>
                    <th>Ngày tạo</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map(article => (
                    <tr key={article.id} className="admin-row">
                      <td>
                        <div className="admin-img-wrap" style={{ width: '60px', height: '40px' }}>
                          <img src={article.thumbnail || 'https://via.placeholder.com/60x40?text=Doc'} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{article.title}</td>
                      <td style={{ color: 'var(--text-400)', fontSize: '0.9rem' }}>{article.views || 0}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-400)' }}>{new Date(article.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className="action-cells">
                          <button className="btn-edit" onClick={() => handleArticleEdit(article)}><Edit size={15} /></button>
                          <button className="btn-delete" onClick={() => handleArticleDelete(article.id, article.title)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
