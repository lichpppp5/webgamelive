const express = require('express');
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
            // Seed default settings if empty
            db.get("SELECT count(*) as count FROM settings", (err, row) => {
              if (row.count === 0) {
                console.log('Seeding initial settings...');
                const stmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
                stmt.run('zalo', 'https://zalo.me/');
                stmt.run('facebook', 'https://facebook.com');
                stmt.run('telegram', 'https://t.me');
                stmt.run('visitCount', '1250');
                stmt.finalize();
              }
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

        // Create articles table for MMO Docs
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
          features TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (!err) {
            db.get("SELECT count(*) as count FROM software", (err, row) => {
              if (row && row.count === 0) {
                console.log('Seeding initial software...');
                const seedStmt = db.prepare(`INSERT INTO software (id, title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                const sampleDesc = `<h3>Giới thiệu Tổng quan</h3>
<p><strong>Phần Mềm Quản Lý & Tự Động Hóa MMO Pro</strong> là giải pháp toàn diện được phát triển riêng cho cộng đồng kiếm tiền online (MMO), marketer và các team vận hành nuôi tài khoản số lượng lớn.</p>

<h3>Các Tính Năng Nổi Bật</h3>
<ul>
  <li><strong>Điều khiển đa luồng cực nhanh:</strong> Tối ưu hiệu năng CPU và RAM, vận hành đồng thời hàng trăm cửa sổ mượt mà không giật lag.</li>
  <li><strong>Hệ thống Fake Fingerprint thông minh:</strong> Thay đổi Canvas, WebGL, AudioContext, WebRTC, Geolocation chống phát hiện bởi các thuật toán quét tài khoản.</li>
  <li><strong>Tích hợp Proxy đa dạng:</strong> Quản lý xoay IP tự động qua TMProxy, TinProxy, ShopLike, Dcom 4G và Proxy tĩnh IPv4/IPv6.</li>
  <li><strong>Kịch bản kéo thả tự động:</strong> Tự động lướt feed, xem video, tương tác bài viết, đăng nhập hàng loạt với độ trễ ngẫu nhiên mô phỏng người thật 100%.</li>
  <li><strong>Quản lý cơ sở dữ liệu tập trung:</strong> Sao lưu dữ liệu an toàn, xuất nhập cookie/token dễ dàng chỉ với một cú nhấp chuột.</li>
</ul>

<h3>Yêu Cầu Hệ Thống</h3>
<ul>
  <li><strong>Hệ điều hành:</strong> Windows 10 / 11 (64-bit) hoặc Windows Server 2019/2022.</li>
  <li><strong>Vi xử lý (CPU):</strong> Intel Core i5 / AMD Ryzen 5 trở lên (Khuyến nghị 6 nhân 12 luồng).</li>
  <li><strong>Bộ nhớ (RAM):</strong> Tối thiểu 8GB (Đề xuất 16GB - 32GB nếu chạy trên 50 luồng).</li>
  <li><strong>Ổ cứng:</strong> Tối thiểu 2GB dung lượng trống chuẩn SSD.</li>
</ul>`;

                const sampleFeatures = JSON.stringify([
                  "Điều khiển đa luồng tốc độ cao",
                  "Chống quét Fingerprint độc quyền",
                  "Tự động xoay Proxy đa dịch vụ",
                  "Kịch bản mô phỏng người thật 100%",
                  "Tiết kiệm 80% thời gian vận hành"
                ]);

                seedStmt.run(
                  'sw-mmo-pro',
                  'Phần Mềm Quản Lý & Tự Động Hóa MMO All-In-One Pro',
                  'Hệ sinh thái tự động hóa tương tác, quản lý hàng nghìn profile và tối ưu hóa quy trình kiếm tiền trực tuyến',
                  sampleDesc,
                  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
                  'image',
                  'v3.8.2',
                  'Windows 10/11 (64-bit) / VPS',
                  0,
                  'Khuyên Dùng - Mới Nhất',
                  '#',
                  185,
                  sampleFeatures
                );
                seedStmt.finalize();
              }
            });
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
      isHot: row.isHot === 1
    }));
    res.json(products);
  });
});

// POST increment product download count
app.post('/api/products/:id/download', (req, res) => {
  const productId = req.params.id;
  db.run(
    "UPDATE products SET downloads = downloads + 1 WHERE id = ?",
    [productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      db.get("SELECT downloads FROM products WHERE id = ?", [productId], (err2, row) => {
        if (err2 || !row) {
          return res.json({ downloads: 1 });
        }
        res.json({ downloads: row.downloads });
      });
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

// GET single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    row.isHot = row.isHot === 1;
    res.json(row);
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
    res.json(rows);
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
    res.json(row);
  });
});

// POST new software
app.post('/api/software', (req, res) => {
  const { title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, features } = req.body;
  const id = 'sw' + Date.now();

  const stmt = db.prepare(`INSERT INTO software (id, title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
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
    typeof features === 'string' ? features : JSON.stringify(features || []),
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads: 0, features });
    }
  );
  stmt.finalize();
});

// PUT update software
app.put('/api/software/:id', (req, res) => {
  const { id } = req.params;
  const { title, tagline, description, media, mediaType, version, platform, price, badge, downloadLink, downloads, features } = req.body;

  const stmt = db.prepare(`UPDATE software SET title = ?, tagline = ?, description = ?, media = ?, mediaType = ?, version = ?, platform = ?, price = ?, badge = ?, downloadLink = ?, downloads = COALESCE(?, downloads), features = ? WHERE id = ?`);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
