const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      [orders] = await db.query(
        'SELECT * FROM orders ORDER BY created_at DESC'
      );
    } else {
      [orders] = await db.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    }

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [items] = await db.query(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds
    );

    const result = orders.map(o => ({
      id: String(o.id),
      customer: o.customer || '',
      phone: o.phone || '',
      address: o.address || '',
      payment_method: o.payment_method || 'transfer',
      notes: o.notes || '',
      status: o.status || 'pending',
      date: o.date
        ? new Date(o.date).toISOString().slice(0, 10)
        : new Date(o.created_at).toISOString().slice(0, 10),
      total: Number(o.total) || 0,
      items: items
        .filter(i => String(i.order_id) === String(o.id))
        .map(i => ({
          id: i.product_id || null,
          name: i.product_name || '',  
          qty: Number(i.qty),
          price: Number(i.price),
        })),
    }));

    res.json(result);
  } catch (err) {
    console.error('[GET /orders]', err);
    res.status(500).json({ message: 'Gagal mengambil pesanan: ' + err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { customer, phone, address, notes, items, total } = req.body;

  if (!customer || !items || items.length === 0 || !total) {
    return res.status(400).json({ message: 'Data pesanan tidak lengkap.' });
  }

  const orderId = 'MH-' + String(Date.now()).slice(-6);
  const today = new Date().toISOString().slice(0, 10);

  try {
    await db.query(
      `INSERT INTO orders (id, customer, phone, address, notes, total, status, payment_status, date, user_id)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?)`,
      [orderId, customer, phone || '', address || '', notes || '', total, today, req.user.id]
    );

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, qty, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id || null, item.name, item.qty, item.price]
      );
    }

    res.status(201).json({ message: 'Pesanan berhasil dibuat.', id: orderId });
  } catch (err) {
    console.error('[POST /orders]', err);
    res.status(500).json({ message: 'Gagal membuat pesanan: ' + err.message });
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

    res.json({ message: 'Status diperbarui.', status });
  } catch (err) {
    console.error('[PATCH /orders/:id/status]', err);
    res.status(500).json({ message: 'Gagal memperbarui status: ' + err.message });
  }
});

module.exports = router;