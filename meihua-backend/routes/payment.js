const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');


const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

router.post('/create-token', verifyToken, async (req, res) => {
  const { order_id, payment_method } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: 'order_id wajib diisi.' });
  }

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    const order = orders[0];

    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order_id]
    );

    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = users[0];

    const itemDetails = items.map(item => ({
      id: String(item.id),
      price: Math.round(item.price),
      quantity: item.qty,
      name: item.product_name.substring(0, 50),
    }));

    const enabledPayments = {
        bank_transfer: ["bca_va", "bni_va", "bri_va", "mandiri_bill", "permata_va"],
        gopay:         ["gopay"],
        ovo:           ["ovo"],
        dana:          ["dana"],
        shopeepay:     ["shopeepay"],
        qris:          ["qris"],
        credit_card:   ["credit_card"],
        alfamart:      ["alfamart"],
        indomaret:     ["indomaret"],
        };

        const parameter = {
        transaction_details: {
            order_id: order_id,
            gross_amount: Math.round(order.total),
        },
        item_details: itemDetails,
        customer_details: {
            first_name: order.customer,
            phone: order.phone,
            email: user?.email || 'customer@meihua.com',
            shipping_address: {
            first_name: order.customer,
            phone: order.phone,
            address: order.address,
            },
        },
        enabled_payments: enabledPayments[payment_method] || undefined,
        callbacks: {
            finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=success`,
            error: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=error`,
            pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=pending`,
        },
        };

    const snapResponse = await snap.createTransaction(parameter);

    await db.query(
      'UPDATE orders SET payment_token = ?, payment_url = ?, payment_status = ? WHERE id = ?',
      [snapResponse.token, snapResponse.redirect_url, 'pending', order_id]
    );

    res.json({
      token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
      order_id,
    });

  } catch (err) {
    console.error('[POST /payment/create-token]', err);
    res.status(500).json({ message: 'Gagal membuat token pembayaran: ' + err.message });
  }
});

router.post('/notification', async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      gross_amount,
    } = notification;

    console.log('[Midtrans Notification]', { order_id, transaction_status, fraud_status });

    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        orderStatus = 'processing';
        paymentStatus = 'paid';
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = 'processing';
      paymentStatus = 'paid';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
    } else if (transaction_status === 'pending') {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    }

    await db.query(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      [orderStatus, paymentStatus, order_id]
    );

    await db.query(
      `INSERT INTO payments (order_id, transaction_id, payment_type, amount, status, midtrans_response)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
      [order_id, transaction_id, payment_type, gross_amount, paymentStatus, JSON.stringify(notification), paymentStatus]
    );

    res.status(200).json({ message: 'Notifikasi diterima.' });

  } catch (err) {
    console.error('[Midtrans Notification Error]', err);
    res.status(500).json({ message: 'Gagal memproses notifikasi.' });
  }
});

router.get('/status/:order_id', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT id, status, payment_status, payment_url, total FROM orders WHERE id = ?',
      [req.params.order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.json(orders[0]);
  } catch (err) {
    console.error('[GET /payment/status]', err);
    res.status(500).json({ message: 'Gagal mengecek status.' });
  }
});

module.exports = router;