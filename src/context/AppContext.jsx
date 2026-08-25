import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── CART CONTEXT ─────────────────────────────────────────────
const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

// ─── TOAST CONTEXT ────────────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside AppProvider');
  return ctx;
};

// ─── SETTINGS CONTEXT ─────────────────────────────────────────
const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside AppProvider');
  return ctx;
};

// ─── COMBINED PROVIDER ────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [contactSettings, setContactSettings] = useState({
    zalo: 'https://zalo.me/',
    facebook: 'https://facebook.com',
    telegram: 'https://t.me',
    visitCount: '1250',
    donateText: 'Nếu thấy hữu ích Donate tôi cốc cafe nha !',
    donateQR: '',
    donateName: '',
    donateBank: '',
    donateAccount: '',
    donateContent: '',
    donateEnabled: 'true',
    marqueeText: 'Chào mừng bạn đến với Webgame Live! Chúc bạn một ngày tốt lành. Liên hệ ngay để được hỗ trợ tốt nhất.'
  });

  useEffect(() => {
    // Always load actual settings from database
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setContactSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Lỗi lấy settings:', err));

    // Record visit count once per session
    const hasVisited = sessionStorage.getItem('visited');
    if (!hasVisited) {
      fetch('/api/visit', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data && data.visitCount) {
            setContactSettings(prev => ({ ...prev, visitCount: data.visitCount.toString() }));
          }
          sessionStorage.setItem('visited', 'true');
        })
        .catch(() => {});
    }
  }, []);

  // ── Cart Actions ──
  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== id));
    } else {
      setCartItems(prev =>
        prev.map(i => i.id === id ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Toast Actions ──
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshSettings = useCallback(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setContactSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Lỗi lấy settings:', err));
  }, []);

  return (
    <SettingsContext.Provider value={{ contactSettings, refreshSettings }}>
      <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
        <ToastContext.Provider value={{ showToast }}>
          {children}
          {/* Toast Container */}
          <div className="toast-container">
            {toasts.map(toast => (
              <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </div>
        </ToastContext.Provider>
      </CartContext.Provider>
    </SettingsContext.Provider>
  );
};

// ─── TOAST ITEM COMPONENT ────────────────────────────────────
const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

const ICON_COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#00cffb',
};

const ToastItem = ({ toast, onRemove }) => (
  <div
    className={`toast toast-${toast.type}`}
    onClick={() => onRemove(toast.id)}
    style={{ cursor: 'pointer' }}
  >
    <span style={{ color: ICON_COLORS[toast.type], flexShrink: 0 }}>
      {ICONS[toast.type]}
    </span>
    <span style={{ flex: 1, fontSize: '0.95rem' }}>{toast.message}</span>
  </div>
);

export default AppProvider;
