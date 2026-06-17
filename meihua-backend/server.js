const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://meihua-frontend.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders/notification', require('./routes/orders'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment')); 

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MeiHua API berjalan normal.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
  }
  if (err.message && err.message.includes('Format file')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MeiHua API berjalan di http://localhost:${PORT}`);
});