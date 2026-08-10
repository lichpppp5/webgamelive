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
                stmt.run('zalo', 'https://zalo.me/0833954354');
                stmt.run('facebook', 'https://facebook.com');
                stmt.run('telegram', 'https://t.me');
                stmt.finalize();
              }
            });
          }
        });
      }
    });
  }
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
  const { title, description, price, oldPrice, image, category, downloads, isHot, downloadLink } = req.body;
  // Simple ID generation
  const id = 'g' + Date.now();
  
  const stmt = db.prepare(`INSERT INTO products (id, title, description, price, oldPrice, image, category, downloads, isHot, downloadLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run(id, title, description || '', price || 0, oldPrice || 0, image || '', category || 'Tất cả', downloads || 0, isHot ? 1 : 0, downloadLink || '', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, title, price, oldPrice, image, category, downloads, isHot, downloadLink: downloadLink || '' });
  });
  stmt.finalize();
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, oldPrice, image, category, downloads, isHot, downloadLink } = req.body;
  
  const stmt = db.prepare(`UPDATE products SET title = ?, description = ?, price = ?, oldPrice = ?, image = ?, category = ?, downloads = ?, isHot = ?, downloadLink = ? WHERE id = ?`);
  
  stmt.run(title, description || '', price, oldPrice, image, category, downloads, isHot ? 1 : 0, downloadLink || '', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product updated successfully' });
  });
  stmt.finalize();
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
