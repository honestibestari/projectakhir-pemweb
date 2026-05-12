const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY label ASC');
    const parsed = rows.map(r => ({
      ...r,
      subs: typeof r.subs === 'string' ? JSON.parse(r.subs) : (r.subs || [])
    }));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data kategori.' });
  }
});

router.post('/', verifyToken, adminOnly, async (req, res) => {
  const { id, label, subs } = req.body;

  if (!id || !label) {
    return res.status(400).json({ message: 'ID dan nama kategori wajib diisi.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Kategori dengan ID ini sudah ada.' });
    }

    await db.query(
      'INSERT INTO categories (id, label, subs) VALUES (?, ?, ?)',
      [id, label, JSON.stringify(subs || [])]
    );

    res.status(201).json({ message: 'Kategori berhasil ditambahkan.', id, label, subs: subs || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan kategori.' });
  }
});

router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { label, subs } = req.body;

  if (!label) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE categories SET label = ?, subs = ? WHERE id = ?',
      [label, JSON.stringify(subs || []), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }

    res.json({ message: 'Kategori berhasil diperbarui.', id, label, subs: subs || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui kategori.' });
  }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }

    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus kategori.' });
  }
});

module.exports = router;