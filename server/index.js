const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

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
      isHot BOOLEAN DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err);
      } else {
        // Seed mock data if empty
        db.get("SELECT count(*) as count FROM products", (err, row) => {
          if (row.count === 0) {
            console.log('Seeding initial data...');
            const stmt = db.prepare(`INSERT INTO products (id, title, price, oldPrice, image, category, downloads, isHot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            stmt.run('g1', 'Dog AI', 500000, 800000, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', 'Tương tác', 137, 1);
            stmt.run('g2', 'Tool Kéo Traffic', 150000, 200000, 'https://images.unsplash.com/photo-1629853925763-74b8897d1e8c?q=80&w=600&auto=format&fit=crop', 'Tool MMO', 58, 0);
            stmt.run('g3', 'Bar DJ 3 (không avatar)', 300000, 0, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop', 'Treo AFK', 585, 1);
            stmt.run('g4', 'Auto Đăng Bài', 650000, 900000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop', 'Tool MMO', 24, 1);
            stmt.finalize();
          }
        });
      }
    });
  }
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
  const { title, description, price, oldPrice, image, category, downloads, isHot } = req.body;
  // Simple ID generation
  const id = 'g' + Date.now();
  
  const stmt = db.prepare(`INSERT INTO products (id, title, description, price, oldPrice, image, category, downloads, isHot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run(id, title, description || '', price || 0, oldPrice || 0, image || '', category || 'Tất cả', downloads || 0, isHot ? 1 : 0, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, title, price, oldPrice, image, category, downloads, isHot });
  });
  stmt.finalize();
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, oldPrice, image, category, downloads, isHot } = req.body;
  
  const stmt = db.prepare(`UPDATE products SET title = ?, description = ?, price = ?, oldPrice = ?, image = ?, category = ?, downloads = ?, isHot = ? WHERE id = ?`);
  
  stmt.run(title, description || '', price, oldPrice, image, category, downloads, isHot ? 1 : 0, id, function(err) {
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
