import { useState, useEffect } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tương tác',
    price: 0,
    oldPrice: 0,
    image: '',
    downloads: 0,
    isHot: false,
    description: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'Chrlghk123#') {
      setIsAuthenticated(true);
      fetchGames();
    } else {
      alert('Sai thông tin đăng nhập!');
    }
  };

  const fetchGames = () => {
    setLoading(true);
    fetch('http://localhost:3005/api/products')
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDescriptionChange = (e) => {
    setFormData({
      ...formData,
      description: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const url = isEditing 
      ? `http://localhost:3005/api/products/${currentId}`
      : 'http://localhost:3005/api/products';
      
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      fetchGames();
      resetForm();
      alert(isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    })
    .catch(err => console.error(err));
  };

  const handleEdit = (game) => {
    setIsEditing(true);
    setCurrentId(game.id);
    setFormData({
      title: game.title,
      category: game.category,
      price: game.price,
      oldPrice: game.oldPrice,
      image: game.image,
      downloads: game.downloads,
      isHot: game.isHot,
      description: game.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      fetch(`http://localhost:3005/api/products/${id}`, { method: 'DELETE' })
        .then(() => fetchGames())
        .catch(err => console.error(err));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '',
      category: 'Tương tác',
      price: 0,
      oldPrice: 0,
      image: '',
      downloads: 0,
      isHot: false,
      description: ''
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h2>Đăng nhập Admin</h2>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary w-full">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container">
      <div className="admin-header">
        <h1>Quản lý Sản phẩm</h1>
        <button className="btn-primary" onClick={resetForm}><Plus size={20} /> Thêm Sản Phẩm Mới</button>
      </div>

      <div className="admin-content">
        <div className="admin-form-panel">
          <h2>{isEditing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Tên Sản phẩm</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Danh mục</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Tương tác">Tương tác</option>
                  <option value="Tool MMO">Tool MMO</option>
                  <option value="Treo AFK">Treo AFK</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lượt tải</label>
                <input type="number" name="downloads" value={formData.downloads} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá bán (VNĐ)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Giá cũ (VNĐ)</label>
                <input type="number" name="oldPrice" value={formData.oldPrice} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Link Hình ảnh (URL - Ảnh đại diện)</label>
              <input type="text" name="image" value={formData.image} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Giới thiệu chi tiết (Hỗ trợ thẻ HTML: &lt;b&gt;, &lt;br&gt;, &lt;img src="..."&gt;)</label>
              <textarea 
                name="description"
                value={formData.description} 
                onChange={handleDescriptionChange} 
                style={{ minHeight: '200px', padding: '1rem', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
                placeholder="Nhập nội dung giới thiệu..."
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="isHot" checked={formData.isHot} onChange={handleInputChange} />
                Sản phẩm HOT (hiển thị nhãn HOT)
              </label>
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: '1rem' }}>
              {isEditing ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {isEditing && (
              <button type="button" className="btn-outline w-full" onClick={resetForm} style={{ marginTop: '0.5rem' }}>
                Hủy
              </button>
            )}
          </form>
        </div>

        <div className="admin-list-panel">
          <h2>Danh sách Sản phẩm</h2>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr key={game.id}>
                    <td><img src={game.image} alt={game.title} className="admin-table-img" /></td>
                    <td>{game.title} {game.isHot && <span className="hot-tag">HOT</span>}</td>
                    <td>{game.price.toLocaleString()}đ</td>
                    <td>{game.category}</td>
                    <td className="action-cells">
                      <button className="btn-edit" onClick={() => handleEdit(game)}><Edit size={16} /></button>
                      <button className="btn-delete" onClick={() => handleDelete(game.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
