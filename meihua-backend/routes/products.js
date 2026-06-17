const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

// GET semua produk
router.get('/', async (req, res) => {
  try {
    const { cat } = req.query;
    let query = 'SELECT * FROM products ORDER BY created_at DESC';
    let params = [];
    if (cat) {
      query = 'SELECT * FROM products WHERE cat = ? ORDER BY created_at DESC';
      params = [cat];
    }
    const [rows] = await db.query(query, params);
    const result = rows.map(p => ({
      ...p,
      oldPrice: p.old_price,
      img: p.img || null,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data produk.' });
  }
});

// GET produk by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    const p = rows[0];
    res.json({ ...p, oldPrice: p.old_price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil produk.' });
  }
});

// POST tambah produk — img dikirim sebagai base64 dari frontend
router.post('/', verifyToken, adminOnly, async (req, res) => {
  const { name, cat, price, old_price, discount, img, rating, sold, seller } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Nama dan harga produk wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO products (name, cat, price, old_price, discount, img, rating, sold, seller)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, cat || null, price, old_price || null, discount || null, img || null, rating || 5.0, sold || '', seller || 'MeiHua Official']
    );

    res.status(201).json({
      message: 'Produk berhasil ditambahkan.',
      id: result.insertId,
      name, cat, price,
      img: img || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan produk.' });
  }
});

// PUT update produk
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { name, cat, price, old_price, discount, img, rating, sold } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Nama dan harga produk wajib diisi.' });
  }

  // Kalau img tidak dikirim, ambil dari database
  let imgValue = img;
  if (imgValue === undefined) {
    const [rows] = await db.query('SELECT img FROM products WHERE id = ?', [req.params.id]);
    imgValue = rows[0]?.img || null;
  }

  try {
    const [result] = await db.query(
      `UPDATE products SET name=?, cat=?, price=?, old_price=?, discount=?, img=?, rating=?, sold=? WHERE id=?`,
      [name, cat || null, price, old_price || null, discount || null, imgValue, rating || 5.0, sold || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    res.json({ message: 'Produk berhasil diperbarui.', img: imgValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui produk.' });
  }
});

// DELETE produk
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus produk.' });
  }
});

module.exports = router;