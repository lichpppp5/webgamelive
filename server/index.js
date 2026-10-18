const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Serve thư mục uploads dưới dạng static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình Multer để lưu ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// API Nhận File Ảnh
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file nào được tải lên.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  // Trả về 'location' để TinyMCE nhận diện
  res.json({ location: imageUrl });
});

// Initialize SQLite DB
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create products table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price INTEGER DEFAULT 0,
      oldPrice INTEGER DEFAULT 0,
      image TEXT,
      category TEXT,
      downloads INTEGER DEFAULT 0,
      isHot BOOLEAN DEFAULT 0,
      isFree BOOLEAN DEFAULT 0,
      downloadLink TEXT DEFAULT ''
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err);
      } else {
        // Migrate: add downloadLink column if not exists (for existing DBs)
        db.run(`ALTER TABLE products ADD COLUMN downloadLink TEXT DEFAULT ''`, (alterErr) => {
          if (alterErr && !alterErr.message.includes('duplicate column')) {
            // Column already exists or other error — ignore silently
          }
        });
        db.run(`ALTER TABLE products ADD COLUMN isFree BOOLEAN DEFAULT 0`, (alterErr) => {
          // ignore error if exists
        });

        // Product seeding removed for production
        // Create settings table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )`, (err) => {
          if (err) {
            console.error('Error creating settings table', err);
          } else {
            // Seed default settings if empty or missing keys
            db.all("SELECT key FROM settings", (err, rows) => {
              const existingKeys = (rows || []).map(r => r.key);
              const defaults = [
                ['zalo', 'https://zalo.me/'],
                ['facebook', 'https://facebook.com'],
                ['telegram', 'https://t.me'],
                ['visitCount', '1250'],
                ['marqueeText', 'Chào mừng bạn đến với Webgame Live! Chúc bạn một ngày tốt lành. Liên hệ ngay để được hỗ trợ tốt nhất.'],
                ['donateText', 'Nếu thấy hữu ích Donate tôi cốc cafe nha !'],
                ['donateQR', ''],
                ['donateName', ''],
                ['donateBank', ''],
                ['donateAccount', ''],
                ['donateContent', 'Ung ho webgame'],
                ['donateEnabled', 'true'],
                ['maintenanceMode', 'false'],
                ['zaloQr', '']
              ];
              const stmt = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
              defaults.forEach(([k, v]) => {
                if (!existingKeys.includes(k)) {
                  stmt.run(k, v);
                }
              });
              stmt.finalize();
            });
          }
        });

        // Create visits_log table
        db.run(`CREATE TABLE IF NOT EXISTS visits_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create articles table for Docs & Guides
        db.run(`CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT,
          thumbnail TEXT,
          views INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (!err) {
            db.run(`ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0`, (alterErr) => {
              // Ignore if column already exists
            });
          }
        });

        // Create software table for Software Showcase
        db.run(`CREATE TABLE IF NOT EXISTS software (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          tagline TEXT DEFAULT '',
          description TEXT DEFAULT '',
          media TEXT DEFAULT '',
          mediaType TEXT DEFAULT 'image',
          version TEXT DEFAULT 'v1.0',
          platform TEXT DEFAULT 'Windows 10/11 (64-bit)',
          price INTEGER DEFAULT 0,
          badge TEXT DEFAULT '',
          downloadLink TEXT DEFAULT '',
          downloads INTEGER DEFAULT 0,
          isFree BOOLEAN DEFAULT 0,
          features TEXT DEFAULT '[]',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) {
            console.error('Error creating software table:', err);
          } else {
            db.run(`ALTER TABLE software ADD COLUMN isFree BOOLEAN DEFAULT 0`, (alterErr) => {
              // Ignore if column already exists
            });
            db.run(`ALTER TABLE software ADD COLUMN features TEXT DEFAULT '[]'`, (alterErr) => {
              // Ignore if column already exists
            });
            // ================= MASTERKEY LICENSE TABLES =================
            db.run(`CREATE TABLE IF NOT EXISTS license_games (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT DEFAULT '',
              active BOOLEAN DEFAULT 1,
              created_at INTEGER
            )`, (err) => {
              if (!err) {
                db.get("SELECT count(*) as count FROM license_games", (err2, row) => {
                  if (row && row.count === 0) {
                    db.run("INSERT OR IGNORE INTO license_games (id, name, description, active, created_at) VALUES ('tiktok-printer', 'TikTok Máy In Giấy', 'Game in hoá đơn livestream TikTok', 1, ?)", [Date.now()]);
                    db.run("INSERT OR IGNORE INTO license_games (id, name, description, active, created_at) VALUES ('game-le-phat', 'Game Lễ Phật Online', 'Game tương tác lễ Phật 3D livestream TikTok', 1, ?)", [Date.now()]);
                  }
                });
              }
            });

            db.run(`CREATE TABLE IF NOT EXISTS license_keys (
              id TEXT PRIMARY KEY,
              key_string TEXT UNIQUE NOT NULL,
              game_id TEXT NOT NULL,
              customer_name TEXT,
              customer_contact TEXT,
              note TEXT,
              duration_days INTEGER,
              is_lifetime BOOLEAN DEFAULT 0,
              start_type TEXT DEFAULT 'on_activation',
              status TEXT DEFAULT 'active',
              max_devices INTEGER DEFAULT 1,
              bound_devices TEXT DEFAULT '[]',
              created_at INTEGER,
              activated_at INTEGER,
              expires_at INTEGER,
              last_check_in INTEGER,
              last_ip TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS license_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              type TEXT,
              key_string TEXT,
              game_id TEXT,
              machine_id TEXT,
              ip TEXT,
              reason TEXT,
              created_at INTEGER
            )`);

          }
        });
      }
    });
  }
});

// POST record a visit
app.post('/api/visit', (req, res) => {
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  let ip = rawIp.split(',')[0].trim();
  // Mask IP for privacy (e.g., 192.168.1.xxx)
  ip = ip.replace(/[\.\:][^\.\:]+$/, '.xxx');
  const userAgent = req.headers['user-agent'] || '';

  // Log detailed visit info
  db.run(`INSERT INTO visits_log (ip, user_agent) VALUES (?, ?)`, [ip, userAgent]);

  db.get("SELECT value FROM settings WHERE key = 'visitCount'", (err, row) => {
    let currentCount = row ? (parseInt(row.value, 10) || 1250) : 1250;
    const newCount = currentCount + 1;
    db.run(
      `INSERT INTO settings (key, value) VALUES ('visitCount', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [newCount.toString()],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ visitCount: newCount });
      }
    );
  });
});

// GET analytics data for admin
app.get('/api/admin/analytics', (req, res) => {
  db.get("SELECT count(*) as totalRealVisits FROM visits_log", (err1, rowTotal) => {
    db.get("SELECT count(*) as todayVisits FROM visits_log WHERE date(created_at) = date('now')", (err2, rowToday) => {
      db.get("SELECT count(*) as monthVisits FROM visits_log WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')", (err3, rowMonth) => {
        db.all("SELECT id, ip, user_agent, created_at FROM visits_log ORDER BY id DESC LIMIT 20", [], (err4, recentRows) => {
          res.json({
            totalRealVisits: rowTotal ? rowTotal.totalRealVisits : 0,
            todayVisits: rowToday ? rowToday.todayVisits : 0,
            monthVisits: rowMonth ? rowMonth.monthVisits : 0,
            recentVisits: recentRows || []
          });
        });
      });
    });
  });
});

// GET all settings
app.get('/api/settings', (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convert array of {key, value} to an object
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// PUT update settings
app.put('/api/settings', (req, res) => {
  const updates = req.body; // e.g., { zalo: '...', facebook: '...' }
  const keys = Object.keys(updates);
  
  if (keys.length === 0) return res.json({ message: 'No updates' });

  // Use a transaction for multiple updates
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    const stmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`);
    
    keys.forEach(key => {
      stmt.run(key, updates[key]);
    });
    
    stmt.finalize();
    db.run("COMMIT", (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Settings updated successfully' });
    });
  });
});

// GET all products
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // SQLite stores booleans as 0 or 1, convert to boolean for frontend
    const products = rows.map(row => ({
      ...row,
      isHot: row.isHot === 1,
      isFree: row.isFree === 1
    }));
    res.json(products);
  });
});

// POST increment product download count (supports both products and software)
app.post('/api/products/:id/download', (req, res) => {
  const productId = req.params.id;
  db.run(
    "UPDATE products SET downloads = downloads + 1 WHERE id = ?",
    [productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes > 0) {
        db.get("SELECT downloads FROM products WHERE id = ?", [productId], (err2, row) => {
          if (err2 || !row) {
            return res.json({ downloads: 1 });
          }
          res.json({ downloads: row.downloads });
        });
      } else {
        // Fallback: Check software table
        db.run(
          "UPDATE software SET downloads = downloads + 1 WHERE id = ?",
          [productId],
          function(swErr) {
            if (swErr) {
              return res.status(500).json({ error: swErr.message });
            }
            db.get("SELECT downloads FROM software WHERE id = ?", [productId], (swErr2, swRow) => {
              if (swErr2 || !swRow) {
                return res.json({ downloads: 1 });
              }
              res.json({ downloads: swRow.downloads });
            });
          }
        );
      }
    }
  );
});

// POST reset all product download counts to 0
app.post('/api/products/reset-downloads', (req, res) => {
  db.run("UPDATE products SET downloads = 0", [], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Reset all downloads to 0' });
  });
});

// GET single product (supports both products and software)
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      row.isHot = row.isHot === 1;
      row.isFree = row.isFree === 1;
      return res.json(row);
    }
    // Fallback: Check software table
    db.get("SELECT * FROM software WHERE id = ?", [id], (swErr, swRow) => {
      if (swErr) {
        return res.status(500).json({ error: swErr.message });
      }
      if (!swRow) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({
        id: swRow.id,
        title: swRow.title,
        tagline: swRow.tagline || '',
        description: swRow.description || swRow.tagline,
        price: swRow.price || 0,
        oldPrice: 0,
        image: swRow.media || '',
        mediaType: swRow.mediaType || 'image',
        category: 'Phần Mềm',
        downloads: swRow.downloads || 0,
        isHot: Boolean(swRow.badge?.includes('Hot') || swRow.badge?.includes('Khuyên') || swRow.badge?.includes('Đề Xuất') || swRow.badge?.includes('Trend')),
        isFree: Boolean(swRow.isFree === 1 || swRow.isFree === true || swRow.isFree === '1'),
        downloadLink: swRow.downloadLink || '',
        version: swRow.version || 'v1.0',
        platform: swRow.platform || 'Windows 10/11 (64-bit)',
        badge: swRow.badge || '',
        features: swRow.features || '[]',
        isSoftware: true
      });
    });
  });
});

// POST new product
app.post('/api/products', (req, res) => {
  const { title, description, price, oldPrice, image, category, isHot, isFree, downloadLink } = req.body;
  const id = 'g' + Date.now();
  
  const stmt = db.prepare(`INSERT INTO products (id, title, description, price, oldPrice, image, category, downloads, isHot, isFree, downloadLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run(id, title, description || '', price || 0, oldPrice || 0, image || '', category || 'Tất cả', 0, isHot ? 1 : 0, isFree ? 1 : 0, downloadLink || '', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, title, price, oldPrice, image, category, downloads: 0, isHot: isHot ? 1 : 0, isFree: isFree ? 1 : 0, downloadLink: downloadLink || '' });
  });
  stmt.finalize();
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { title, description, price, oldPrice, image, category, isHot, isFree, downloads, downloadLink } = req.body;
  const id = req.params.id;

  db.run(
    `UPDATE products 
     SET title = ?, description = ?, price = ?, oldPrice = ?, image = ?, category = ?, isHot = ?, isFree = ?, downloads = ?, downloadLink = ?
     WHERE id = ?`,
    [title, description || '', price || 0, oldPrice || 0, image || '', category || 'Tất cả', isHot ? 1 : 0, isFree ? 1 : 0, downloads || 0, downloadLink || '', id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// ================= ARTICLES API =================

// GET all articles
app.get('/api/articles', (req, res) => {
  db.all("SELECT id, title, thumbnail, views, created_at FROM articles ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST increment article view count
app.post('/api/articles/:id/view', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'View count incremented' });
  });
});

// GET single article
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM articles WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(row);
  });
});

// POST new article
app.post('/api/articles', (req, res) => {
  const { title, content, thumbnail } = req.body;
  const id = 'doc' + Date.now();
  
  const stmt = db.prepare(`INSERT INTO articles (id, title, content, thumbnail) VALUES (?, ?, ?, ?)`);
  stmt.run(id, title, content || '', thumbnail || '', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, title, thumbnail });
  });
  stmt.finalize();
});

// PUT update article
app.put('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, thumbnail } = req.body;
  
  const stmt = db.prepare(`UPDATE articles SET title = ?, content = ?, thumbnail = ? WHERE id = ?`);
  stmt.run(title, content || '', thumbnail || '', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Article updated successfully' });
  });
  stmt.finalize();
});

// DELETE article
app.delete('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM articles WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Article deleted successfully' });
  });
});

// ================= SOFTWARE API =================

// GET all software
app.get('/api/software', (req, res) => {
  db.all("SELECT * FROM software ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const formatted = (rows || []).map(r => ({
      ...r,
      isFree: Boolean(r.isFree === 1 || r.isFree === true || r.isFree === '1')
    }));
    res.json(formatted);
  });
});

// GET single software
app.get('/api/software/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM software WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Software not found' });
      return;
    }
    row.isFree = Boolean(row.isFree === 1 || row.isFree === true || row.isFree === '1');
    res.json(row);
  });
});

// POST new software
app.post('/api/software', (req, res) => {
  const { title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, isFree, features } = req.body;
  const id = 'sw' + Date.now();

  const stmt = db.prepare(`INSERT INTO software (id, title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads, isFree, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(
    id,
    title || 'Phần mềm mới',
    tagline || '',
    description || '',
    media || '',
    mediaType || 'image',
    version || 'v1.0',
    platform || 'Windows 10/11 (64-bit)',
    price || 0,
    badge || '',
    downloadLink || '',
    0,
    isFree ? 1 : 0,
    typeof features === 'string' ? features : JSON.stringify(features || []),
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads: 0, isFree: isFree ? 1 : 0, features });
    }
  );
  stmt.finalize();
});

// PUT update software
app.put('/api/software/:id', (req, res) => {
  const { id } = req.params;
  const { title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads, isFree, features } = req.body;

  const stmt = db.prepare(`UPDATE software SET title = ?, tagline = ?, description = ?, media = ?, mediaType = ?, version = ?, platform = ?, price = ?, badge = ?, downloadLink = ?, downloads = COALESCE(?, downloads), isFree = ?, features = ? WHERE id = ?`);
  stmt.run(
    title,
    tagline || '',
    description || '',
    media || '',
    mediaType || 'image',
    version || 'v1.0',
    platform || 'Windows 10/11 (64-bit)',
    price || 0,
    badge || '',
    downloadLink || '',
    downloads !== undefined ? downloads : null,
    isFree ? 1 : 0,
    typeof features === 'string' ? features : JSON.stringify(features || []),
    id,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Software updated successfully' });
    }
  );
  stmt.finalize();
});

// DELETE software
app.delete('/api/software/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM software WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Software deleted successfully' });
  });
});

// POST increment software download count
app.post('/api/software/:id/download', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE software SET downloads = COALESCE(downloads, 0) + 1 WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.get("SELECT downloads FROM software WHERE id = ?", [id], (err2, row) => {
      res.json({ downloads: row ? row.downloads : 1 });
    });
  });
});


// ================= LICENSE & MASTERKEY API =================

// Helper: Lấy IP thật của client
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || req.ip || 'Unknown';
}

let cachedMasterSecret = null;
function getMasterSecret(callback) {
  if (cachedMasterSecret) return callback(cachedMasterSecret);
  db.get("SELECT value FROM settings WHERE key = 'license_master_secret'", (err, row) => {
    if (row && row.value) {
      cachedMasterSecret = row.value;
      callback(cachedMasterSecret);
    } else {
      const newSecret = crypto.randomBytes(32).toString('hex');
      cachedMasterSecret = newSecret;
      db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('license_master_secret', ?)", [newSecret], () => {
        callback(newSecret);
      });
    }
  });
}

// 1. PUBLIC API — Dành cho game xác thực bản quyền
app.use('/api/license/verify', (req, res, next) => { req.url = '/api/v1/license/verify'; next(); });
  app.post('/api/v1/license/verify', (req, res) => {
  const { key: keyString, gameId, machineId, hwid, hostname, clientInfo } = req.body || {};
  const actualMachineId = (machineId || hwid || '').toString().trim();
  const clientIp = getClientIp(req);

  if (!keyString || !gameId || !actualMachineId) {
    return res.status(400).json({
      valid: false,
      success: false,
      code: 'MISSING_PARAMS',
      message: 'Thiếu thông tin xác thực bản quyền (Key, Game ID hoặc Machine ID)!'
    });
  }

  const normalizedKey = keyString.trim().toUpperCase();
  db.get("SELECT * FROM license_keys WHERE UPPER(key_string) = ?", [normalizedKey], (err, key) => {
    if (err) return res.status(500).json({ valid: false, message: 'Lỗi cơ sở dữ liệu' });
    if (!key) {
      db.run("INSERT INTO license_logs (type, key_string, game_id, machine_id, ip, reason, created_at) VALUES ('verify_failed', ?, ?, ?, ?, 'key_not_found', ?)",
        [keyString.slice(0, 10) + '...', gameId, actualMachineId, clientIp, Date.now()]);
      return res.status(200).json({
        valid: false,
        success: false,
        code: 'KEY_NOT_FOUND',
        message: 'License Key không tồn tại trên hệ thống máy chủ!'
      });
    }

    if (key.game_id !== gameId) {
      return res.status(200).json({
        valid: false,
        success: false,
        code: 'GAME_MISMATCH',
        message: `Key này thuộc về game khác, không sử dụng được cho game '${gameId}'!`
      });
    }

    if (key.status === 'banned') {
      db.run("INSERT INTO license_logs (type, key_string, game_id, machine_id, ip, reason, created_at) VALUES ('verify_failed', ?, ?, ?, ?, 'key_banned', ?)",
        [key.key_string, gameId, actualMachineId, clientIp, Date.now()]);
      return res.status(200).json({
        valid: false,
        success: false,
        code: 'KEY_BANNED',
        message: 'License Key này đã bị tạm khóa hoặc thu hồi bởi Quản trị viên!'
      });
    }

    const now = Date.now();
    let activatedAt = key.activated_at;
    let expiresAt = key.expires_at;

    // Kích hoạt lần đầu nếu on_activation
    if (!activatedAt) {
      activatedAt = now;
      if (!key.is_lifetime && key.duration_days) {
        expiresAt = now + key.duration_days * 86400000;
      }
    }

    // Kiểm tra hết hạn
    if (!key.is_lifetime && expiresAt && expiresAt < now) {
      db.run("UPDATE license_keys SET status = 'expired', expires_at = ? WHERE id = ?", [expiresAt, key.id]);
      db.run("INSERT INTO license_logs (type, key_string, game_id, machine_id, ip, reason, created_at) VALUES ('verify_failed', ?, ?, ?, ?, 'key_expired', ?)",
        [key.key_string, gameId, actualMachineId, clientIp, now]);
      return res.status(200).json({
        valid: false,
        success: false,
        code: 'KEY_EXPIRED',
        message: 'License Key đã hết hạn sử dụng! Vui lòng liên hệ Admin để gia hạn.',
        expiresAt: expiresAt
      });
    }

    // Kiểm tra thiết bị
    let boundDevices = [];
    try {
      boundDevices = JSON.parse(key.bound_devices || '[]');
    } catch {
      boundDevices = [];
    }

    let dev = boundDevices.find(d => d.machineId === actualMachineId);
    if (!dev) {
      if (boundDevices.length >= (key.max_devices || 1)) {
        db.run("INSERT INTO license_logs (type, key_string, game_id, machine_id, ip, reason, created_at) VALUES ('verify_failed', ?, ?, ?, ?, 'device_limit', ?)",
          [key.key_string, gameId, actualMachineId, clientIp, now]);
        return res.status(200).json({
          valid: false,
          success: false,
          code: 'DEVICE_LIMIT_EXCEEDED',
          message: `Key này đã được kích hoạt đủ ${key.max_devices || 1} máy tính! Hãy liên hệ Admin để đổi máy.`
        });
      }
      dev = {
        machineId: actualMachineId,
        hostname: hostname || (clientInfo && clientInfo.hostname) || 'Unknown PC',
        firstBoundAt: now,
        lastIp: clientIp,
        lastSeenAt: now
      };
      boundDevices.push(dev);
    } else {
      dev.lastIp = clientIp;
      dev.lastSeenAt = now;
    }

    const boundDevicesJson = JSON.stringify(boundDevices);
    db.run("UPDATE license_keys SET activated_at = ?, expires_at = ?, bound_devices = ?, last_check_in = ?, last_ip = ?, status = 'active' WHERE id = ?",
      [activatedAt, expiresAt, boundDevicesJson, now, clientIp, key.id]);

    getMasterSecret((secret) => {
      const daysLeft = key.is_lifetime ? 999999 : Math.max(0, Math.ceil((expiresAt - now) / 86400000));
      const tokenPayload = `${key.id}|${actualMachineId}|${expiresAt || 'LIFETIME'}|${now}`;
      const tokenSignature = crypto.createHmac('sha256', secret).update(tokenPayload).digest('hex');

      db.run("INSERT INTO license_logs (type, key_string, game_id, machine_id, ip, reason, created_at) VALUES ('verify_success', ?, ?, ?, ?, 'active', ?)",
        [key.key_string, gameId, actualMachineId, clientIp, now]);

      return res.status(200).json({
        valid: true,
        success: true,
        status: 'active',
        code: 'SUCCESS',
        message: 'Bản quyền hợp lệ!',
        isLifetime: Boolean(key.is_lifetime),
        activatedAt: activatedAt,
        expiresAt: expiresAt,
        daysLeft: daysLeft,
        customerName: key.customer_name,
        token: `${tokenPayload}.${tokenSignature}`
      });
    });
  });
});

// Ping định kỳ từ game
app.post('/api/v1/license/ping', (req, res) => {
  const { key: keyString, machineId, hwid } = req.body || {};
  const actualMachineId = machineId || hwid;
  if (!keyString) return res.status(400).json({ valid: false, success: false });

  const normalizedKey = keyString.trim().toUpperCase();
  db.get("SELECT * FROM license_keys WHERE UPPER(key_string) = ?", [normalizedKey], (err, key) => {
    if (err || !key || key.status === 'banned') {
      return res.status(200).json({ valid: false, success: false, status: 'banned' });
    }
    const now = Date.now();
    if (!key.is_lifetime && key.expires_at && key.expires_at < now) {
      db.run("UPDATE license_keys SET status = 'expired' WHERE id = ?", [key.id]);
      return res.status(200).json({ valid: false, success: false, status: 'expired' });
    }

    const clientIp = getClientIp(req);
    let boundDevices = [];
    try { boundDevices = JSON.parse(key.bound_devices || '[]'); } catch {}
    if (actualMachineId) {
      const d = boundDevices.find(dev => dev.machineId === actualMachineId);
      if (d) {
        d.lastSeenAt = now;
        d.lastIp = clientIp;
      }
    }
    db.run("UPDATE license_keys SET last_check_in = ?, last_ip = ?, bound_devices = ? WHERE id = ?",
      [now, clientIp, JSON.stringify(boundDevices), key.id]);

    return res.status(200).json({ valid: true, success: true, status: 'active' });
  });
});

// 2. ADMIN API — Quản lý Keys & Games
app.get('/api/admin/licenses/stats', (req, res) => {
  db.all("SELECT status, is_lifetime, expires_at FROM license_keys", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const now = Date.now();
    const totalKeys = (rows || []).length;
    let activeKeys = 0;
    let expiredKeys = 0;
    let bannedKeys = 0;

    (rows || []).forEach(k => {
      if (k.status === 'banned') bannedKeys++;
      else if (!k.is_lifetime && k.expires_at && k.expires_at < now) expiredKeys++;
      else activeKeys++;
    });

    db.get("SELECT count(*) as totalGames FROM license_games WHERE active = 1", (err2, rowGames) => {
      res.json({
        success: true,
        stats: {
          totalKeys,
          activeKeys,
          expiredKeys,
          bannedKeys,
          totalGames: rowGames ? rowGames.totalGames : 0
        }
      });
    });
  });
});

app.get('/api/admin/licenses/games', (req, res) => {
  db.all("SELECT * FROM license_games WHERE active = 1 ORDER BY created_at ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, games: rows || [] });
  });
});

app.post('/api/admin/licenses/games', (req, res) => {
  const { id, name, description } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'Mã Game và Tên Game là bắt buộc' });
  const gameId = id.trim().toLowerCase();
  db.run("INSERT OR REPLACE INTO license_games (id, name, description, active, created_at) VALUES (?, ?, ?, 1, ?)",
    [gameId, name.trim(), (description || '').trim(), Date.now()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, game: { id: gameId, name: name.trim(), description } });
    }
  );
});

app.get('/api/admin/licenses/keys', (req, res) => {
  const { gameId, status, search } = req.query || {};
  let query = "SELECT * FROM license_keys WHERE 1=1";
  const params = [];

  if (gameId) {
    query += " AND game_id = ?";
    params.push(gameId);
  }
  if (status && status !== 'all') {
    if (status === 'banned') {
      query += " AND status = 'banned'";
    } else if (status === 'expired') {
      query += " AND (status = 'expired' OR (is_lifetime = 0 AND expires_at < ?))";
      params.push(Date.now());
    } else if (status === 'active') {
      query += " AND status = 'active' AND (is_lifetime = 1 OR expires_at IS NULL OR expires_at >= ?)";
      params.push(Date.now());
    }
  }
  if (search) {
    query += " AND (UPPER(key_string) LIKE ? OR UPPER(customer_name) LIKE ? OR customer_contact LIKE ? OR note LIKE ?)";
    const s = '%' + search.trim().toUpperCase() + '%';
    const sNorm = '%' + search.trim() + '%';
    params.push(s, s, sNorm, sNorm);
  }

  query += " ORDER BY created_at DESC";

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const now = Date.now();
    const formatted = (rows || []).map(r => {
      let bound = [];
      try { bound = JSON.parse(r.bound_devices || '[]'); } catch {}
      const isExpired = !r.is_lifetime && r.expires_at && r.expires_at < now;
      return {
        id: r.id,
        key: r.key_string,
        gameId: r.game_id,
        customerName: r.customer_name,
        customerContact: r.customer_contact,
        note: r.note,
        durationDays: r.is_lifetime ? 'lifetime' : r.duration_days,
        isLifetime: Boolean(r.is_lifetime),
        startType: r.start_type,
        status: r.status,
        isBanned: r.status === 'banned',
        isExpired: isExpired,
        maxDevices: r.max_devices,
        boundDevices: bound,
        createdAt: r.created_at,
        activatedAt: r.activated_at,
        expiresAt: r.expires_at,
        lastCheckIn: r.last_check_in,
        lastIp: r.last_ip
      };
    });
    res.json({ success: true, keys: formatted });
  });
});

app.post('/api/admin/licenses/keys', (req, res) => {
  const { gameId, customerName, customerContact, note, durationDays, maxDevices, startType, customKey } = req.body || {};
  if (!gameId) return res.status(400).json({ error: 'Vui lòng chọn Game áp dụng' });

  const id = 'k_' + crypto.randomBytes(6).toString('hex');
  const isLifetime = durationDays === 'lifetime';
  const durDays = isLifetime ? null : (parseInt(durationDays) || 30);
  const now = Date.now();
  const stType = startType || 'on_activation';

  let activatedAt = null;
  let expiresAt = null;
  if (stType === 'immediate') {
    activatedAt = now;
    expiresAt = isLifetime ? null : (now + durDays * 86400000);
  }

  let keyString = '';
  if (customKey && customKey.trim()) {
    keyString = customKey.trim().toUpperCase();
  } else {
    let prefix = (gameId || 'KEY').substring(0, 3).toUpperCase();
    let dur = isLifetime ? 'LIFE' : `${durDays}D`;
    const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    keyString = `${prefix}-${dur}-${p1}-${p2}-${p3}`;
  }

  const stmt = db.prepare(`
    INSERT INTO license_keys (id, key_string, game_id, customer_name, customer_contact, note, duration_days, is_lifetime, start_type, status, max_devices, bound_devices, created_at, activated_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, '[]', ?, ?, ?)
  `);

  stmt.run(
    id, keyString, gameId, customerName || 'Khách vãng lai', customerContact || '', note || '',
    durDays, isLifetime ? 1 : 0, stType, parseInt(maxDevices) || 1, now, activatedAt, expiresAt,
    function(err) {
      if (err) return res.status(400).json({ error: 'Lỗi khi lưu key (mã key có thể đã trùng lặp): ' + err.message });
      res.json({
        success: true,
        key: {
          id, key: keyString, gameId, customerName, customerContact, note,
          durationDays: isLifetime ? 'lifetime' : durDays, isLifetime, startType: stType,
          status: 'active', maxDevices: parseInt(maxDevices) || 1, boundDevices: [],
          createdAt: now, activatedAt, expiresAt
        }
      });
    }
  );
  stmt.finalize();
});

app.post('/api/admin/licenses/keys/:id/extend', (req, res) => {
  const { id } = req.params;
  const { days, isLifetime } = req.body || {};
  const normalized = id.trim().toUpperCase();

  db.get("SELECT * FROM license_keys WHERE id = ? OR UPPER(key_string) = ?", [id, normalized], (err, key) => {
    if (err || !key) return res.status(404).json({ error: 'Không tìm thấy Key' });

    const now = Date.now();
    const wantLifetime = isLifetime || days === 'lifetime';

    if (wantLifetime) {
      db.run("UPDATE license_keys SET is_lifetime = 1, duration_days = NULL, expires_at = NULL, status = 'active' WHERE id = ?", [key.id], function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, message: 'Nâng cấp key thành Vĩnh Viễn thành công' });
      });
    } else {
      const daysToAdd = parseInt(days) || 30;
      let baseTime = now;
      if (key.expires_at && key.expires_at > now) {
        baseTime = key.expires_at;
      }
      const newExpires = baseTime + daysToAdd * 86400000;
      const newDur = (key.duration_days || 0) + daysToAdd;
      db.run("UPDATE license_keys SET expires_at = ?, duration_days = ?, status = 'active' WHERE id = ?", [newExpires, newDur, key.id], function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, message: `Gia hạn thêm ${daysToAdd} ngày thành công`, expiresAt: newExpires });
      });
    }
  });
});

app.post('/api/admin/licenses/keys/:id/reset-hwid', (req, res) => {
  const { id } = req.params;
  const normalized = id.trim().toUpperCase();
  db.run("UPDATE license_keys SET bound_devices = '[]' WHERE id = ? OR UPPER(key_string) = ?", [id, normalized], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Đã reset máy liên kết! Khách có thể kích hoạt trên máy mới.' });
  });
});

app.post('/api/admin/licenses/keys/:id/toggle-lock', (req, res) => {
  const { id } = req.params;
  const normalized = id.trim().toUpperCase();
  db.get("SELECT * FROM license_keys WHERE id = ? OR UPPER(key_string) = ?", [id, normalized], (err, key) => {
    if (err || !key) return res.status(404).json({ error: 'Không tìm thấy Key' });
    const newStatus = key.status === 'banned' ? 'active' : 'banned';
    db.run("UPDATE license_keys SET status = ? WHERE id = ?", [newStatus, key.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: (newStatus === 'banned' ? 'Đã khóa key' : 'Đã mở khóa key'), status: newStatus });
    });
  });
});

app.delete('/api/admin/licenses/keys/:id', (req, res) => {
  const { id } = req.params;
  const normalized = id.trim().toUpperCase();
  db.run("DELETE FROM license_keys WHERE id = ? OR UPPER(key_string) = ?", [id, normalized], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Đã xóa Key thành công' });
  });
});

app.get('/api/admin/licenses/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  db.all("SELECT * FROM license_logs ORDER BY created_at DESC LIMIT ?", [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, logs: rows || [] });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
