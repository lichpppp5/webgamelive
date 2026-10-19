import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart, X, Copy, Check, Download, QrCode } from 'lucide-react';
import { useSettings } from '../context/AppContext';
import './DonateWidget.css';

// Opens from the floating button, or from anywhere via openDonate() in utils/donate.js

const CopyRow = ({ label, value, copyable }) => {
  const [done, setDone] = useState(false);
  if (!value) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch { window.prompt('Sao chép:', value); }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <div className="dn-row">
      <span className="dn-label">{label}</span>
      <strong className="dn-value">{value}</strong>
      {copyable && (
        <button type="button" className={`dn-copy ${done ? 'is-done' : ''}`} onClick={copy} aria-label={`Sao chép ${label}`}>
          {done ? <Check size={14} /> : <Copy size={14} />}
          <span>{done ? 'Đã chép' : 'Chép'}</span>
        </button>
      )}
    </div>
  );
};

const DonateWidget = () => {
  const { contactSettings: s } = useSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [qrError, setQrError] = useState(false);
  // Floating button appears once the visitor scrolls, so it never covers the hero
  const [showFab, setShowFab] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const enabled = s?.donateEnabled === 'true' && (s.donateQR || s.donateAccount);
  const hidden = pathname.startsWith('/admin');

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-donate', onOpen);
    return () => window.removeEventListener('open-donate', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => { setQrError(false); }, [s?.donateQR]);

  if (!enabled || hidden) return null;

  return (
    <>
      <button type="button" className={`dn-fab ${showFab ? 'is-visible' : ''}`} onClick={() => setOpen(true)} aria-label="Ủng hộ TOOLLIVE" tabIndex={showFab ? 0 : -1}>
        <Heart size={18} fill="currentColor" />
        <span>Ủng hộ</span>
      </button>

      {open && (
        <div className="dn-backdrop" onClick={() => setOpen(false)} role="presentation">
          <div className="dn-modal" role="dialog" aria-modal="true" aria-labelledby="dn-title" onClick={e => e.stopPropagation()}>
            <button type="button" className="dn-close" onClick={() => setOpen(false)} aria-label="Đóng"><X size={18} /></button>

            <div className="dn-head">
              <span className="dn-head-icon"><Heart size={20} fill="currentColor" /></span>
              <div>
                <h2 id="dn-title">Ủng hộ TOOLLIVE</h2>
                <p>{s.donateText || 'Nếu thấy hữu ích, mời mình một ly cà phê nhé!'}</p>
              </div>
            </div>

            <div className="dn-body">
              {s.donateQR && !qrError ? (
                <div className="dn-qr">
                  <img src={s.donateQR} alt="Mã QR chuyển khoản ủng hộ" onError={() => setQrError(true)} />
                  <span className="dn-qr-hint"><QrCode size={14} /> Mở app ngân hàng → Quét mã QR</span>
                </div>
              ) : null}

              <div className="dn-info">
                <CopyRow label="Ngân hàng" value={s.donateBank} />
                <CopyRow label="Chủ tài khoản" value={s.donateName} />
                <CopyRow label="Số tài khoản" value={s.donateAccount} copyable />
                <CopyRow label="Nội dung" value={s.donateContent} copyable />
                {s.donateQR && !qrError && (
                  <a className="dn-download" href={s.donateQR} download="toollive-donate-qr.png" target="_blank" rel="noreferrer">
                    <Download size={15} /> Tải ảnh QR
                  </a>
                )}
                <p className="dn-thanks">Cảm ơn bạn rất nhiều ❤️ Mọi đóng góp giúp mình duy trì và phát triển thêm công cụ miễn phí.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonateWidget;
