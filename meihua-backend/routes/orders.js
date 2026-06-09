const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// GET semua pesanan
router.get('/', verifyToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
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
      payment_method: o.payment_method || 'midtrans',
      payment_type: o.payment_type || null,
      notes: o.notes || '',
      status: o.status || 'pending',
      snap_token: o.snap_token || null,
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

// POST buat pesanan
router.post('/', verifyToken, async (req, res) => {
  const { customer, phone, address, payment_method, notes, items, total } = req.body;

  if (!customer || !items || items.length === 0 || !total) {
    return res.status(400).json({ message: 'Data pesanan tidak lengkap.' });
  }

  const orderId = 'MH-' + String(Date.now()).slice(-6);
  const today = new Date().toISOString().slice(0, 10);

  try {
    await db.query(
      `INSERT INTO orders 
      (id, customer, phone, address, payment_method, notes, total, status, date, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [orderId, customer, phone || '', address || '', payment_method || 'midtrans', notes || '', total, today, req.user.id]
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

// POST buat snap token
router.post('/create-token', verifyToken, async (req, res) => {
  const { order_id, payment_method } = req.body;

  try {
    const [[order]] = await db.query('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order_id]);

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: Number(order.total),
      },
      customer_details: {
        first_name: order.customer,
        phone: order.phone || '',
      },
      item_details: items.map(item => ({
        id: String(item.product_id || 'ITEM'),
        price: Number(item.price),
        quantity: Number(item.qty),
        name: (item.product_name || 'Produk').substring(0, 50),
      })),
    };

    const snapResponse = await snap.createTransaction(parameter);

    await db.query(
      'UPDATE orders SET snap_token = ? WHERE id = ?',
      [snapResponse.token, order_id]
    );

    res.json({ token: snapResponse.token });
  } catch (err) {
    console.error('[POST /orders/create-token]', err);
    res.status(500).json({ message: 'Gagal membuat token pembayaran: ' + err.message });
  }
});

router.patch('/:id/payment-type', verifyToken, async (req, res) => {
  const { payment_type } = req.body;
  try {
    await db.query(
      'UPDATE orders SET payment_type = ? WHERE id = ?',
      [payment_type, req.params.id]
    );
    res.json({ message: 'Payment type diperbarui.' });
  } catch (err) {
    console.error('[PATCH /orders/:id/payment-type]', err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH update status
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

// POST webhook Midtrans — update payment_type otomatis
router.post('/notification', async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status, payment_type } = notification;

    console.log('[Midtrans Webhook]', { order_id, transaction_status, payment_type });

    let newStatus = 'pending';
    if (transaction_status === 'capture' && fraud_status === 'accept') newStatus = 'processing';
    else if (transaction_status === 'settlement') newStatus = 'processing';
    else if (['cancel', 'deny', 'expire'].includes(transaction_status)) newStatus = 'cancelled';

    // Mapping payment_type ke label yang mudah dibaca
    const paymentLabel = {
      'credit_card':      'Kartu Kredit',
      'bank_transfer':    'Transfer Bank',
      'echannel':         'Mandiri Bill',
      'bca_klikpay':      'BCA KlikPay',
      'cimb_clicks':      'CIMB Clicks',
      'danamon_online':   'Danamon Online',
      'gopay':            'GoPay',
      'shopeepay':        'ShopeePay',
      'qris':             'QRIS',
      'akulaku':          'Akulaku',
      'cstore':           req.body.store === 'alfamart' ? 'Alfamart' : 'Indomaret',
      'ovo':              'OVO',
      'dana':             'DANA',
    };

    const readablePayment = paymentLabel[payment_type] || payment_type;

    await db.query(
      'UPDATE orders SET status = ?, payment_type = ? WHERE id = ?',
      [newStatus, readablePayment, order_id]
    );

    res.json({ message: 'Notifikasi diterima.' });
  } catch (err) {
    console.error('[POST /orders/notification]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;