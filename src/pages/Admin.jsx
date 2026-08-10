import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Plus, Upload, Image as ImageIcon, Eye, EyeOff, LayoutDashboard, Search, X, Flame, Package, Save, Settings as SettingsIcon } from 'lucide-react';
import { useToast, useSettings } from '../context/AppContext';
import './Admin.css';

const CATEGORIES = ['Tương tác', 'Tool MMO', 'Treo AFK'];

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
  const [settingsForm, setSettingsForm] = useState({
    zalo: '', facebook: '', telegram: ''
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
    image: '', downloads: 0, isHot: false, description: '', downloadLink: ''
  });

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
      setSettingsForm({
        zalo: contactSettings.zalo || '',
        facebook: contactSettings.facebook || '',
        telegram: contactSettings.telegram || ''
      });
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

  const handleInsertImageToDesc = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.location) {
          const imgTag = `\n<img src="${data.location}" alt="Minh họa" />\n`;
          setFormData(prev => ({ ...prev, description: (prev.description || '') + imgTag }));
          showToast('Đã chèn ảnh vào nội dung!', 'success');
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
      isHot: game.isHot, description: game.description || '',
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

  const resetForm = () => {
    setIsEditing(false); setCurrentId(null);
    setFormData({ title: '', category: CATEGORIES[0], price: 0, oldPrice: 0, image: '', downloads: 0, isHot: false, description: '', downloadLink: '' });
    setImagePreview('');
  };

  const filteredGames = games.filter(g =>
    g.title?.toLowerCase().includes(searchTable.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchTable.toLowerCase())
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
      </div>

      {activeTab === 'settings' && (
        <div className="admin-card settings-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={22} color="var(--primary)" />
            Cấu hình Liên hệ & Tư vấn
          </h2>
          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label className="form-label">Link Zalo</label>
              <input className="form-input" type="url" value={settingsForm.zalo} onChange={e => setSettingsForm({ ...settingsForm, zalo: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Link Facebook</label>
              <input className="form-input" type="url" value={settingsForm.facebook} onChange={e => setSettingsForm({ ...settingsForm, facebook: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Link Telegram</label>
              <input className="form-input" type="url" value={settingsForm.telegram} onChange={e => setSettingsForm({ ...settingsForm, telegram: e.target.value })} required />
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
                <button type="button" className="btn-outline" onClick={resetForm} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Làm mới form
                </button>
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
                  <input type="file" accept="image/*,video/mp4,video/webm" style={{ display: 'none' }} onChange={handleImageUpload} />
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
                  <input type="file" accept="image/*,video/mp4,video/webm" style={{ display: 'none' }} onChange={handleInsertImageToDesc} />
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

            {/* Hot toggle */}
            <label className="hot-toggle">
              <input type="checkbox" name="isHot" checked={formData.isHot} onChange={handleInputChange} />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">Đánh dấu HOT 🔥</span>
            </label>

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
    </div>
  );
};

export default Admin;
