import { useState, useEffect } from 'react';
import { 
  Key, RefreshCw, Lock, Unlock, Clock, Plus, Search, Trash2, 
  Copy, Check, Share2, Smartphone, ShieldCheck, AlertTriangle, 
  Monitor, X, HelpCircle, Gamepad2, FileText
} from 'lucide-react';
import './LicenseManager.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const LicenseManager = () => {
  const [stats, setStats] = useState({ totalKeys: 0, activeKeys: 0, expiredKeys: 0, bannedKeys: 0, totalGames: 0 });
  const [keys, setKeys] = useState([]);
  const [games, setGames] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('keys'); // 'keys' | 'logs'

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [shareText, setShareText] = useState('');

  // Form states
  const [createForm, setCreateForm] = useState({
    gameId: '', customerName: '', customerContact: '', note: '',
    durationDays: '30', maxDevices: 1, startType: 'on_activation', customKey: ''
  });
  const [extendDays, setExtendDays] = useState('30');
  const [gameForm, setGameForm] = useState({ id: '', name: '', description: '' });

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/licenses/stats').then(r => r.json()),
      fetch('/api/admin/licenses/games').then(r => r.json()),
      fetch('/api/admin/licenses/keys').then(r => r.json()),
      fetch('/api/admin/licenses/logs').then(r => r.json())
    ]).then(([sRes, gRes, kRes, lRes]) => {
      if (sRes.success) setStats(sRes.stats);
      if (gRes.success) {
        setGames(gRes.games || []);
        if (gRes.games && gRes.games.length > 0 && !createForm.gameId) {
          setCreateForm(prev => ({ ...prev, gameId: gRes.games[0].id }));
        }
      }
      if (kRes.success) setKeys(kRes.keys || []);
      if (lRes.success) setLogs(lRes.logs || []);
    }).catch(err => {
      console.error('Lỗi khi tải dữ liệu license:', err);
    }).finally(() => setLoading(false));
  };

  const copyToClipboard = (text, keyId = null) => {
    navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      alert('Đã sao chép vào bộ nhớ tạm!');
    }
  };

  // Actions
  const handleCreateKey = (e) => {
    e.preventDefault();
    fetch('/api/admin/licenses/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.key) {
          setShowCreateModal(false);
          refreshAll();
          openShareModal(res.key);
        } else {
          alert('Lỗi: ' + (res.error || 'Không thể tạo key'));
        }
      })
      .catch(() => alert('Lỗi máy chủ khi tạo key'));
  };

  const handleAddGame = (e) => {
    e.preventDefault();
    fetch('/api/admin/licenses/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameForm)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setShowAddGameModal(false);
          setGameForm({ id: '', name: '', description: '' });
          refreshAll();
        } else {
          alert('Lỗi: ' + (res.error || 'Không thể thêm game'));
        }
      })
      .catch(() => alert('Lỗi máy chủ'));
  };

  const handleExtendKey = (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    fetch(`/api/admin/licenses/keys/${encodeURIComponent(selectedKey.key)}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: extendDays })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setShowExtendModal(false);
          refreshAll();
        } else {
          alert('Lỗi: ' + (res.error || 'Không thể gia hạn'));
        }
      })
      .catch(() => alert('Lỗi máy chủ'));
  };

  const handleResetHwid = (keyString) => {
    if (!window.confirm(`Reset thiết bị cho key: ${keyString}?\nKhách sẽ có thể nhập key trên máy tính mới!`)) return;
    fetch(`/api/admin/licenses/keys/${encodeURIComponent(keyString)}/reset-hwid`, { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          refreshAll();
          alert('Đã reset thiết bị thành công!');
        } else {
          alert('Lỗi: ' + (res.error || 'Thao tác thất bại'));
        }
      });
  };

  const handleToggleLock = (keyString) => {
    fetch(`/api/admin/licenses/keys/${encodeURIComponent(keyString)}/toggle-lock`, { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        if (res.success) refreshAll();
        else alert('Lỗi: ' + (res.error || 'Thao tác thất bại'));
      });
  };

  const handleDeleteKey = (keyString) => {
    if (!window.confirm(`CẢNH BÁO: Xóa vĩnh viễn key ${keyString} khỏi hệ thống?\nThao tác này không thể hoàn tác!`)) return;
    fetch(`/api/admin/licenses/keys/${encodeURIComponent(keyString)}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(res => {
        if (res.success) refreshAll();
        else alert('Lỗi: ' + (res.error || 'Thao tác thất bại'));
      });
  };

  const openShareModal = (k) => {
    const game = games.find(g => g.id === k.gameId);
    const gameName = game ? game.name : k.gameId;
    let durText = k.isLifetime ? 'Vĩnh Viễn (Trọn Đời)' : `${k.durationDays} Ngày (Bắt đầu tính khi mở game)`;

    const text = 
`🎮 [THÔNG BÁO BẢN QUYỀN GAME]
Kính gửi: ${k.customerName || 'Quý khách'}

Cảm ơn bạn đã mua bản quyền game: ${gameName}
- Mã License Key của bạn: ${k.key}
- Thời hạn sử dụng: ${durText}
- Số máy hỗ trợ: ${k.maxDevices || 1} máy tính

📌 HƯỚNG DẪN KÍCH HOẠT:
1. Mở game trên máy tính của bạn.
2. Dán mã Key ở trên vào ô kích hoạt và bấm "Xác nhận".
3. Game sẽ được kích hoạt ngay lập tức!

Chúc bạn livestream và chơi game gặt hái nhiều thành công! 🚀`;

    setShareText(text);
    setShowShareModal(true);
  };

  // Filtered keys
  const filteredKeys = keys.filter(k => {
    if (selectedGame && k.gameId !== selectedGame) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && (k.isBanned || k.isExpired)) return false;
      if (statusFilter === 'expired' && !k.isExpired) return false;
      if (statusFilter === 'banned' && !k.isBanned) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const mKey = k.key?.toLowerCase().includes(s);
      const mName = k.customerName?.toLowerCase().includes(s);
      const mContact = k.customerContact?.toLowerCase().includes(s);
      const mNote = k.note?.toLowerCase().includes(s);
      if (!mKey && !mName && !mContact && !mNote) return false;
    }
    return true;
  });

  return (
    <div className="license-manager-container page-enter">
      {/* Stats Row */}
      <div className="license-stats-grid">
        <StatCard icon={<Key size={22} />} label="Tổng số Key" value={stats.totalKeys} color="#38bdf8" />
        <StatCard icon={<ShieldCheck size={22} />} label="Đang hoạt động" value={stats.activeKeys} color="#10b981" />
        <StatCard icon={<Clock size={22} />} label="Đã hết hạn" value={stats.expiredKeys} color="#f59e0b" />
        <StatCard icon={<Lock size={22} />} label="Đã tạm khóa" value={stats.bannedKeys} color="#ef4444" />
        <StatCard icon={<Gamepad2 size={22} />} label="Số Game Quản lý" value={stats.totalGames} color="#a855f7" />
      </div>

      {/* Toolbar */}
      <div className="license-toolbar">
        <div className="license-toolbar-left">
          <div className="license-search-wrap">
            <Search size={16} className="license-search-icon" />
            <input 
              type="text" 
              className="license-search-input" 
              placeholder="Tìm theo Key, tên khách, số Zalo..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="license-select"
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
          >
            <option value="">Tất Cả Game</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select 
            className="license-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="active">🟢 Đang hoạt động</option>
            <option value="expired">⏳ Đã hết hạn</option>
            <option value="banned">🔒 Đã bị khóa</option>
          </select>
        </div>

        <div className="license-toolbar-right">
          <button className="btn-outline" onClick={() => setShowAddGameModal(true)} style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> Thêm Game
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> Tạo Key Mới
          </button>
          <button className="btn-outline" onClick={refreshAll} title="Làm mới" style={{ padding: '0.65rem' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Subtabs */}
      <div className="license-tabs-sub">
        <button 
          className={`license-subtab-btn ${activeSubTab === 'keys' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('keys')}
        >
          <Key size={15} /> Danh Sách Key Bản Quyền ({filteredKeys.length})
        </button>
        <button 
          className={`license-subtab-btn ${activeSubTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('logs')}
        >
          <Clock size={15} /> Lịch Sử Check-in &amp; Kích Hoạt ({logs.length})
        </button>
      </div>

      {/* Tab 1: Keys Table */}
      {activeSubTab === 'keys' && (
        <div className="license-table-wrap">
          <table className="license-table">
            <thead>
              <tr>
                <th>License Key</th>
                <th>Game Áp Dụng</th>
                <th>Khách Hàng &amp; Ghi Chú</th>
                <th>Thời Hạn</th>
                <th>Thiết Bị (HWID)</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>Đang tải dữ liệu...</td></tr>
              ) : filteredKeys.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>Không tìm thấy Key nào phù hợp</td></tr>
              ) : (
                filteredKeys.map(k => {
                  const game = games.find(g => g.id === k.gameId);
                  const gameName = game ? game.name : k.gameId;

                  // Status Badge
                  let badge = <span className="license-badge badge-active">🟢 Hoạt động</span>;
                  if (k.isBanned) badge = <span className="license-badge badge-banned">🔒 Bị Khóa</span>;
                  else if (k.isExpired) badge = <span className="license-badge badge-expired">⏳ Hết Hạn</span>;
                  else if (!k.activatedAt) badge = <span className="license-badge badge-unused">⚡ Chưa Kích Hoạt</span>;

                  // Duration text
                  let durText = '';
                  if (k.isLifetime) {
                    durText = <strong style={{ color: '#c084fc' }}>👑 Vĩnh Viễn</strong>;
                  } else if (!k.activatedAt && k.startType === 'on_activation') {
                    durText = <span>{k.durationDays} Ngày (Tính từ lúc mở)</span>;
                  } else if (k.expiresAt) {
                    const exp = new Date(k.expiresAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    const rem = Math.max(0, Math.ceil((k.expiresAt - Date.now()) / 86400000));
                    durText = (
                      <div>
                        <div>{exp}</div>
                        <small style={{ color: rem <= 3 ? '#f59e0b' : '#94a3b8' }}>Còn {rem} ngày</small>
                      </div>
                    );
                  }

                  const boundCount = (k.boundDevices || []).length;
                  const maxDev = k.maxDevices || 1;

                  return (
                    <tr key={k.id}>
                      <td>
                        <div className="license-key-badge">
                          <span>{k.key}</span>
                          <button 
                            className="license-copy-btn" 
                            title="Sao chép Key"
                            onClick={() => copyToClipboard(k.key, k.id)}
                          >
                            {copiedKey === k.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td><strong>{gameName}</strong></td>
                      <td>
                        <div><strong>{k.customerName || 'Khách'}</strong></div>
                        <small style={{ color: '#94a3b8' }}>{k.customerContact} {k.note ? `(${k.note})` : ''}</small>
                      </td>
                      <td>{durText}</td>
                      <td>
                        <span>{boundCount}/{maxDev} PC</span>
                        {boundCount > 0 && (
                          <button 
                            className="license-btn" 
                            style={{ marginLeft: '0.4rem', fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                            title="Reset HWID để khách đổi sang máy tính mới"
                            onClick={() => handleResetHwid(k.key)}
                          >
                            <RefreshCw size={11} /> Đổi máy
                          </button>
                        )}
                      </td>
                      <td>{badge}</td>
                      <td>
                        <div className="license-actions">
                          <button className="license-btn" onClick={() => openShareModal(k)} title="Soạn tin nhắn Zalo gửi khách">
                            <Share2 size={13} /> Gửi Khách
                          </button>
                          <button 
                            className="license-btn" 
                            onClick={() => { setSelectedKey(k); setShowExtendModal(true); }}
                            title="Gia hạn thời gian"
                          >
                            <Clock size={13} /> Gia Hạn
                          </button>
                          {k.isBanned ? (
                            <button className="license-btn license-btn-warn" onClick={() => handleToggleLock(k.key)} title="Mở khóa key">
                              <Unlock size={13} /> Mở
                            </button>
                          ) : (
                            <button className="license-btn license-btn-warn" onClick={() => handleToggleLock(k.key)} title="Tạm khóa key">
                              <Lock size={13} /> Khóa
                            </button>
                          )}
                          <button className="license-btn license-btn-danger" onClick={() => handleDeleteKey(k.key)} title="Xóa Key">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Logs Table */}
      {activeSubTab === 'logs' && (
        <div className="license-table-wrap">
          <table className="license-table">
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Mã Key</th>
                <th>Game</th>
                <th>Thiết Bị (HWID)</th>
                <th>Địa Chỉ IP</th>
                <th>Kết Quả Xác Thực</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>Chưa có lượt kết nối nào</td></tr>
              ) : (
                logs.map(l => {
                  const time = new Date(l.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' });
                  const isOk = l.type === 'verify_success';
                  return (
                    <tr key={l.id}>
                      <td>{time}</td>
                      <td><code style={{ color: '#38bdf8' }}>{l.key_string}</code></td>
                      <td>{l.game_id}</td>
                      <td><small style={{ fontFamily: 'monospace' }}>{(l.machine_id || '').slice(0, 16)}...</small></td>
                      <td>{l.ip}</td>
                      <td>
                        {isOk ? (
                          <span className="license-badge badge-active">Thành công</span>
                        ) : (
                          <span className="license-badge badge-banned">{l.reason || 'Từ chối'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: TẠO KEY MỚI ── */}
      {showCreateModal && (
        <div className="license-modal-backdrop">
          <div className="license-modal-box">
            <div className="license-modal-header">
              <h3><Plus size={20} color="var(--primary)" /> Tạo Key Bản Quyền Mới</h3>
              <button className="license-close-btn" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateKey}>
              <div className="license-form-group">
                <label>Chọn Game Áp Dụng *</label>
                <select 
                  value={createForm.gameId}
                  onChange={e => setCreateForm({ ...createForm, gameId: e.target.value })}
                  required
                >
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.id})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="license-form-group" style={{ flex: 1 }}>
                  <label>Tên Khách Hàng *</label>
                  <input 
                    type="text" 
                    placeholder="VD: Anh Tuấn Livestream" 
                    value={createForm.customerName}
                    onChange={e => setCreateForm({ ...createForm, customerName: e.target.value })}
                    required
                  />
                </div>
                <div className="license-form-group" style={{ flex: 1 }}>
                  <label>Số ĐT / Zalo</label>
                  <input 
                    type="text" 
                    placeholder="VD: 0988.xxxxxx" 
                    value={createForm.customerContact}
                    onChange={e => setCreateForm({ ...createForm, customerContact: e.target.value })}
                  />
                </div>
              </div>

              <div className="license-form-group">
                <label>Ghi Chú Đơn Hàng</label>
                <input 
                  type="text" 
                  placeholder="VD: Khách mua gói 1 tháng, thanh toán MBBank" 
                  value={createForm.note}
                  onChange={e => setCreateForm({ ...createForm, note: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="license-form-group" style={{ flex: 1 }}>
                  <label>Thời Hạn Sử Dụng *</label>
                  <select 
                    value={createForm.durationDays}
                    onChange={e => setCreateForm({ ...createForm, durationDays: e.target.value })}
                  >
                    <option value="1">1 Ngày (Cho test)</option>
                    <option value="3">3 Ngày</option>
                    <option value="7">7 Ngày (1 Tuần)</option>
                    <option value="30">30 Ngày (1 Tháng)</option>
                    <option value="90">90 Ngày (3 Tháng)</option>
                    <option value="180">180 Ngày (6 Tháng)</option>
                    <option value="365">365 Ngày (1 Năm)</option>
                    <option value="lifetime">👑 Vĩnh Viễn (Lifetime)</option>
                  </select>
                </div>
                <div className="license-form-group" style={{ width: '120px' }}>
                  <label>Số Máy (PC)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={createForm.maxDevices}
                    onChange={e => setCreateForm({ ...createForm, maxDevices: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="license-form-group">
                <label>Cách Tính Bắt Đầu Thời Hạn</label>
                <select 
                  value={createForm.startType}
                  onChange={e => setCreateForm({ ...createForm, startType: e.target.value })}
                >
                  <option value="on_activation">⚡ Bắt đầu tính giờ khi khách nhập key vào game lần đầu (Khuyên dùng)</option>
                  <option value="immediate">⏱️ Tính giờ ngay từ bây giờ</option>
                </select>
              </div>

              <div className="license-form-group">
                <label>Mã Key Tự Đặt (Bỏ trống sẽ tự sinh mã đẹp ngẫu nhiên)</label>
                <input 
                  type="text" 
                  placeholder="VD: TKP-VIP-8888-9999" 
                  style={{ textTransform: 'uppercase' }}
                  value={createForm.customKey}
                  onChange={e => setCreateForm({ ...createForm, customKey: e.target.value })}
                />
              </div>

              <div className="license-modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Xác Nhận Tạo Key</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GIA HẠN KEY ── */}
      {showExtendModal && selectedKey && (
        <div className="license-modal-backdrop">
          <div className="license-modal-box">
            <div className="license-modal-header">
              <h3><Clock size={20} color="var(--primary)" /> Gia Hạn Key Bản Quyền</h3>
              <button className="license-close-btn" onClick={() => setShowExtendModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleExtendKey}>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Đang gia hạn cho Key: <code style={{ color: '#38bdf8' }}>{selectedKey.key}</code> ({selectedKey.customerName})
              </p>
              <div className="license-form-group">
                <label>Chọn Thời Gian Thêm Vào *</label>
                <select value={extendDays} onChange={e => setExtendDays(e.target.value)}>
                  <option value="7">+ 7 Ngày (1 Tuần)</option>
                  <option value="30">+ 30 Ngày (1 Tháng)</option>
                  <option value="60">+ 60 Ngày (2 Tháng)</option>
                  <option value="90">+ 90 Ngày (3 Tháng)</option>
                  <option value="180">+ 180 Ngày (6 Tháng)</option>
                  <option value="365">+ 365 Ngày (1 Năm)</option>
                  <option value="lifetime">👑 Nâng Cấp Thành Vĩnh Viễn (Lifetime)</option>
                </select>
              </div>
              <div className="license-modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowExtendModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Xác Nhận Gia Hạn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: THÊM GAME MỚI ── */}
      {showAddGameModal && (
        <div className="license-modal-backdrop">
          <div className="license-modal-box">
            <div className="license-modal-header">
              <h3><Gamepad2 size={20} color="var(--primary)" /> Thêm Game Mới Vào Hệ Thống</h3>
              <button className="license-close-btn" onClick={() => setShowAddGameModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddGame}>
              <div className="license-form-group">
                <label>Mã Game ID (Viết liền không dấu) *</label>
                <input 
                  type="text" 
                  placeholder="VD: vong-quay, plinko, bau-cua" 
                  value={gameForm.id}
                  onChange={e => setGameForm({ ...gameForm, id: e.target.value })}
                  required
                  pattern="^[a-zA-Z0-9_-]+$"
                />
                <small style={{ color: '#71717a', fontSize: '0.78rem' }}>Mã này sẽ dùng trong code game khi gọi xác thực.</small>
              </div>
              <div className="license-form-group">
                <label>Tên Hiển Thị Của Game *</label>
                <input 
                  type="text" 
                  placeholder="VD: Vòng Quay May Mắn TikTok" 
                  value={gameForm.name}
                  onChange={e => setGameForm({ ...gameForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="license-form-group">
                <label>Mô Tả Game</label>
                <input 
                  type="text" 
                  placeholder="VD: Game livestream tương tác quà TikTok" 
                  value={gameForm.description}
                  onChange={e => setGameForm({ ...gameForm, description: e.target.value })}
                />
              </div>
              <div className="license-modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowAddGameModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu Game</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SOẠN TIN NHẮN ZALO GỬI KHÁCH ── */}
      {showShareModal && (
        <div className="license-modal-backdrop">
          <div className="license-modal-box">
            <div className="license-modal-header">
              <h3><Share2 size={20} color="var(--primary)" /> Tin Nhắn Gửi Cho Khách Hàng</h3>
              <button className="license-close-btn" onClick={() => setShowShareModal(false)}><X size={18} /></button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Nội dung tin nhắn đã được soạn sẵn lịch sự và đầy đủ hướng dẫn. Bạn chỉ cần bấm <strong>Sao Chép</strong> rồi dán gửi qua Zalo / Facebook cho khách:
            </p>
            <textarea 
              className="license-msg-box" 
              rows="12" 
              readOnly 
              value={shareText}
            />
            <div className="license-modal-footer">
              <button type="button" className="btn-outline" onClick={() => setShowShareModal(false)}>Đóng</button>
              <button type="button" className="btn-primary" onClick={() => copyToClipboard(shareText)}>
                <Copy size={16} /> Sao Chép Toàn Bộ Tin Nhắn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;
