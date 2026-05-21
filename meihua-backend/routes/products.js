const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const getImgUrl = (req, filename) => {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('data:')) return filename;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

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
      img: p.img ? getImgUrl(req, p.img) : null,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data produk.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    const p = rows[0];
    res.json({ ...p, oldPrice: p.old_price, img: getImgUrl(req, p.img) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil produk.' });
  }
});

router.post(
  '/upload-image',
  verifyToken,
  adminOnly,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
    }
    const imgUrl = getImgUrl(req, req.file.filename);
    res.json({
      message: 'Foto berhasil diupload.',
      filename: req.file.filename,
      url: imgUrl,
    });
  }
);

router.post(
  '/',
  verifyToken,
  adminOnly,
  upload.single('image'), 
  async (req, res) => {
    const { name, cat, price, old_price, discount, img, rating, sold, seller } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Nama dan harga produk wajib diisi.' });
    }

    let imgValue = null;
    if (req.file) {
      imgValue = req.file.filename; 
    } else if (img) {
      imgValue = img; 
    }

    try {
      const [result] = await db.query(
        `INSERT INTO products (name, cat, price, old_price, discount, img, rating, sold, seller)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          cat || null,
          price,
          old_price || null,
          discount || null,
          imgValue,
          rating || 5.0,
          sold || '',
          seller || 'MeiHua Official',
        ]
      );

      res.status(201).json({
        message: 'Produk berhasil ditambahkan.',
        id: result.insertId,
        name,
        cat,
        price,
        img: getImgUrl(req, imgValue),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menambahkan produk.' });
    }
  }
);

router.put(
  '/:id',
  verifyToken,
  adminOnly,
  upload.single('image'),
  async (req, res) => {
    const { name, cat, price, old_price, discount, img, rating, sold } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Nama dan harga produk wajib diisi.' });
    }

    let imgValue = null;
    if (req.file) {
      imgValue = req.file.filename;

      try {
        const [rows] = await db.query('SELECT img FROM products WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].img) {
          const oldFile = rows[0].img;
          if (!oldFile.startsWith('http') && !oldFile.startsWith('data:')) {
            const oldPath = path.join(uploadsDir, oldFile);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
        }
      } catch (_) {}
    } else if (img !== undefined) {
      imgValue = img;
    } else {
      const [rows] = await db.query('SELECT img FROM products WHERE id = ?', [req.params.id]);
      imgValue = rows[0]?.img || null;
    }

    try {
      const [result] = await db.query(
        `UPDATE products
         SET name=?, cat=?, price=?, old_price=?, discount=?, img=?, rating=?, sold=?
         WHERE id=?`,
        [
          name,
          cat || null,
          price,
          old_price || null,
          discount || null,
          imgValue,
          rating || 5.0,
          sold || '',
          req.params.id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Produk tidak ditemukan.' });
      }

      res.json({
        message: 'Produk berhasil diperbarui.',
        img: getImgUrl(req, imgValue),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memperbarui produk.' });
    }
  }
);

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT img FROM products WHERE id = ?', [req.params.id]);
    if (rows.length > 0 && rows[0].img) {
      const imgFile = rows[0].img;
      if (!imgFile.startsWith('http') && !imgFile.startsWith('data:')) {
        const filePath = path.join(uploadsDir, imgFile);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

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