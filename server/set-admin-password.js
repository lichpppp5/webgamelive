// Set / change the admin panel password.
//   node server/set-admin-password.js                 → asks for username + password
//   node server/set-admin-password.js admin "MyPass"  → non-interactive
//   node server/set-admin-password.js --random        → generates a strong password and prints it once
// Writes server/admin-auth.json, which holds ONLY a scrypt hash (safe to commit:
// git push + git pull on the server applies the new password, no restart needed).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { hashPassword } = require('./admin-auth');

const FILE = path.join(__dirname, 'admin-auth.json');

function save(username, password) {
  if (!username || !password || password.length < 10) {
    console.error('Mật khẩu phải có ít nhất 10 ký tự.');
    process.exit(1);
  }
  const cfg = { username, passwordHash: hashPassword(password), updatedAt: new Date().toISOString() };
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2) + '\n');
  console.log(`Đã lưu mật khẩu admin cho tài khoản "${username}" vào ${path.relative(process.cwd(), FILE)}`);
  console.log('Tiếp theo: commit + push, rồi trên server chạy git pull.');
}

const args = process.argv.slice(2);
if (args[0] === '--random') {
  const password = crypto.randomBytes(15).toString('base64url'); // 20 chars
  save(args[1] || 'admin', password);
  console.log(`\nMẬT KHẨU MỚI (chỉ hiện một lần, hãy lưu lại): ${password}\n`);
} else if (args.length >= 2) {
  save(args[0], args[1]);
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Tên đăng nhập admin [admin]: ', (u) => {
    rl.question('Mật khẩu mới (≥ 10 ký tự): ', (p) => {
      rl.close();
      save((u || 'admin').trim(), p);
    });
  });
}
