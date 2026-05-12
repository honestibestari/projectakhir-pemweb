const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    let orders, items;

    if (req.user.role === 'admin') {
      [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    } else {
      [orders] = await db.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    }

    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      [items] = await db.query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
    } else {
      items = [];
    }

    const result = orders.map(o => ({
      ...o,
      items: items.filter(i => i.order_id === o.id).map(i => ({
        name: i.product_name,
        qty: i.qty,
        price: i.price
      }))
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data pesanan.' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { customer, phone, address, items, total } = req.body;

  if (!customer || !items || items.length === 0 || !total) {
    return res.status(400).json({ message: 'Data pesanan tidak lengkap.' });
  }

  const orderId = 'MH-' + String(Date.now()).slice(-5);
  const today = new Date().toISOString().slice(0, 10);

  const conn = await (await import('../config/db')).default.getConnection
    ? null : null; 

  try {
    await db.query(
      `INSERT INTO orders (id, customer, phone, address, total, status, date, user_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [orderId, customer, phone || '', address || '', total, today, req.user.id]
    );

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_name, qty, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.name, item.qty, item.price]
      );
    }

    res.status(201).json({ message: 'Pesanan berhasil dibuat.', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal membuat pesanan.' });
  }
});

router.patch('/:id/status', verifyToken, adminOnly, async (req, res) => {
  const { status } = req.body;
  const validStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.json({ message: 'Status pesanan diperbarui.', status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui status.' });
  }
});

module.exports = router;