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

- **Đổi trên web:** Admin → tab **Cài đặt chung & Liên hệ** → mục **Đổi mật khẩu Admin**. Mật khẩu mới có hiệu lực ngay, không cần restart và không cần git. Mọi phiên đăng nhập khác bị đăng xuất.
- Mật khẩu đổi trên web được lưu (dạng mã băm) trong database, không ghi vào file trong git, nên `git pull` không bao giờ bị xung đột.
- Cách khác, trên máy dev: `node server/set-admin-password.js`, rồi commit, push và `git pull`. Server dùng bản **mới hơn** giữa database và file `server/admin-auth.json`.
- Quên mật khẩu: chạy lệnh trên ở máy dev rồi push và pull. Bản trong file sẽ mới hơn nên được dùng.
- Biến môi trường `ADMIN_PASSWORD_HASH` (và `ADMIN_USERNAME`) trên server, nếu có đặt, được ưu tiên hơn cả hai.
- Nhập sai mật khẩu 8 lần trong 15 phút sẽ bị khoá tạm theo IP. Phiên đăng nhập có hạn 12 giờ.

Các API công khai không đổi: game kích hoạt key (`/api/v1/license/verify`, `/api/license/verify`, `/api/v1/license/ping`), xem sản phẩm, bài viết, phần mềm, đếm lượt truy cập và lượt tải.
