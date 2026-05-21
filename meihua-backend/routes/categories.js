const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, label FROM categories ORDER BY label ASC'
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data kategori.' });
  }
});

router.post('/', verifyToken, adminOnly, async (req, res) => {
  const { id, label } = req.body;

  if (!id || !label) {
    return res.status(400).json({
      message: 'ID dan nama kategori wajib diisi.'
    });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'Kategori dengan ID ini sudah ada.'
      });
    }

    await db.query(
      'INSERT INTO categories (id, label) VALUES (?, ?)',
      [id, label]
    );

    res.status(201).json({
      message: 'Kategori berhasil ditambahkan.',
      id,
      label
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal menambahkan kategori.'
    });
  }
});

router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({
      message: 'Nama kategori wajib diisi.'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE categories SET label = ? WHERE id = ?',
      [label, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Kategori tidak ditemukan.'
      });
    }

    res.json({
      message: 'Kategori berhasil diperbarui.',
      id,
      label
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal memperbarui kategori.'
    });
  }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Kategori tidak ditemukan.'
      });
    }

    res.json({
      message: 'Kategori berhasil dihapus.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal menghapus kategori.'
    });
  }
});

module.exports = router;