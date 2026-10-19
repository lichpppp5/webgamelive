import { useState } from 'react';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { useToast } from '../context/AppContext';
import { adminChangePassword } from '../utils/adminApi';

// 0..4 rough strength score for the meter
const strength = (p) => {
  let s = 0;
  if (p.length >= 10) s++;
  if (p.length >= 14) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const LEVELS = [
  { label: 'Rất yếu', color: '#ff4d4f' },
  { label: 'Yếu', color: '#ff7a45' },
  { label: 'Trung bình', color: '#faad14' },
  { label: 'Mạnh', color: '#52c41a' },
  { label: 'Rất mạnh', color: '#13c2c2' },
];

const ChangePasswordCard = () => {
  const { showToast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = strength(next);
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = current && next.length >= 10 && next === confirm && !saving;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const res = await adminChangePassword(current, next);
      showToast(res.message || 'Đã đổi mật khẩu admin!', 'success');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  const type = show ? 'text' : 'password';
  return (
    <div className="admin-card settings-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Key size={22} color="var(--primary)" />
        Đổi mật khẩu Admin
      </h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-300, #888)', fontSize: '0.9rem' }}>
        Sau khi đổi, mọi phiên đăng nhập admin ở máy khác sẽ bị đăng xuất.
      </p>
      <form onSubmit={onSubmit} style={{ maxWidth: 480 }} autoComplete="off">
        <div className="form-group">
          <label className="form-label">Mật khẩu hiện tại</label>
          <input className="form-input" type={type} value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" required />
        </div>
        <div className="form-group">
          <label className="form-label">Mật khẩu mới (ít nhất 10 ký tự)</label>
          <input className="form-input" type={type} value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" required minLength={10} />
          {next && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(128,128,128,0.2)', overflow: 'hidden' }}>
                <div style={{ width: `${(score + 1) * 20}%`, height: '100%', background: LEVELS[score].color, transition: 'width .2s' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: LEVELS[score].color, minWidth: 70 }}>{next.length < 10 ? 'Quá ngắn' : LEVELS[score].label}</span>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Nhập lại mật khẩu mới</label>
          <input className="form-input" type={type} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required style={mismatch ? { borderColor: '#ff4d4f' } : undefined} />
          {mismatch && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '0.3rem' }}>Mật khẩu nhập lại không khớp</div>}
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary" disabled={!canSubmit} style={{ padding: '0.8rem 1.6rem', opacity: canSubmit ? 1 : 0.6 }}>
            <Save size={18} /> {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
          <button type="button" className="btn-outline" onClick={() => setShow(v => !v)} style={{ padding: '0.7rem 1rem' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />} {show ? 'Ẩn' : 'Hiện'} mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordCard;
