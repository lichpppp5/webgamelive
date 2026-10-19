// Admin API helper: the password is checked by the server (POST /api/admin/login),
// which returns a short-lived token. Every admin request sends it as a Bearer header.
const TOKEN_KEY = 'admin_token';

export const getAdminToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
};

const setAdminToken = (token) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable: session lasts until reload */ }
};

export async function adminLogin(username, password) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Đăng nhập thất bại');
  setAdminToken(data.token);
  return data;
}

// Manual "Đăng xuất": forget the token (no expiry notice)
export function clearAdminSession() {
  setAdminToken(null);
}

export function adminLogout() {
  setAdminToken(null);
  window.dispatchEvent(new Event('admin-logout'));
}

// Is the stored token still accepted by the server?
export async function checkAdminSession() {
  if (!getAdminToken()) return false;
  try {
    const res = await adminFetch('/api/admin/session');
    return res.ok;
  } catch {
    return false;
  }
}

// Drop-in replacement for fetch() in the admin panel
export async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && token) adminLogout(); // expired / invalid → back to the login screen
  return res;
}

// Change the admin password; the server logs out every other session and returns a new token
export async function adminChangePassword(currentPassword, newPassword) {
  const res = await adminFetch('/api/admin/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Đổi mật khẩu thất bại');
  setAdminToken(data.token);
  return data;
}
