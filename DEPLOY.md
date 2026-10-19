# Deploy lên server

## Thiết lập một lần duy nhất (trên server)

```bash
cd /đường-dẫn/webgamelive
git pull
bash deploy/setup.sh
```

`setup.sh` bật git hook `.githooks/post-merge` và chạy deploy lần đầu.

## Từ đó về sau

Trên máy dev: commit rồi push (`PUSH_TO_GITHUB.bat`). Trên server:

```bash
git pull
```

Sau mỗi lần pull, hook tự chạy `deploy/update.sh`:

| Thay đổi trong lần pull | Việc tự làm |
|---|---|
| `package-lock.json` (gốc / `server/`) | `npm ci` cho phần tương ứng |
| `src/`, `public/`, `index.html`, `vite.config.js` | build vào `dist.new`, xong mới tráo sang `dist` |
| `server/` | restart API server (pm2 tự nhận diện) |

Nếu build lỗi: giữ nguyên `dist` cũ và **không** restart server, nên web vẫn chạy bản cũ. Sửa lỗi xong, push rồi `git pull` lại.

Log của lần deploy gần nhất nằm ở `deploy/last-deploy.log`. Chạy lại bằng tay: `bash deploy/update.sh`, hoặc `FORCE=1 bash deploy/update.sh` để build và restart dù không có thay đổi.

### Cấu hình riêng của server (không nằm trong git)

Tạo file `deploy/deploy.local` nếu cần:

```bash
RESTART_CMD="pm2 restart toollive-api"   # hoặc: systemctl restart toollive
PUBLISH_DIR="/var/www/toollive"          # nếu nginx phục vụ thư mục khác ./dist
```

## Mật khẩu admin

- Mật khẩu được kiểm tra ở server (`POST /api/admin/login`). File `server/admin-auth.json` chỉ chứa mã băm scrypt.
- Đổi mật khẩu trên máy dev: `node server/set-admin-password.js`, rồi commit, push và `git pull` trên server. Không cần restart.
- Hoặc chỉ đặt trên server bằng biến môi trường `ADMIN_PASSWORD_HASH` (và `ADMIN_USERNAME`). Biến này được ưu tiên hơn file.
- Đăng nhập sai 8 lần trong 15 phút sẽ bị khoá tạm theo IP. Phiên đăng nhập có hạn 12 giờ.

Các API công khai không đổi: game kích hoạt key (`/api/v1/license/verify`, `/api/license/verify`, `/api/v1/license/ping`), xem sản phẩm, bài viết, phần mềm, đếm lượt truy cập và lượt tải.
