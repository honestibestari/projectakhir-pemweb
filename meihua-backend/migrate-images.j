require('dotenv').config();
const db = require('./db');
const fs = require('fs');
const path = require('path');

async function migrateImages() {
  try {
    console.log('Mulai migrasi foto...');

    // Ambil semua produk yang punya foto
    const [products] = await db.query(
      "SELECT id, img FROM products WHERE img IS NOT NULL AND img != ''"
    );

    console.log(`Ditemukan ${products.length} produk dengan foto`);

    let success = 0;
    let failed = 0;

    for (const product of products) {
      const imgValue = product.img;

      // Skip kalau sudah Base64 atau URL
      if (imgValue.startsWith('data:') || imgValue.startsWith('http')) {
        console.log(`[SKIP] Produk ${product.id} — sudah Base64 atau URL`);
        continue;
      }

      // Cari file di folder uploads lokal
      const filePath = path.join(__dirname, 'uploads', imgValue);

      if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] Produk ${product.id} — file tidak ditemukan: ${imgValue}`);
        failed++;
        continue;
      }

      try {
        // Baca file dan konversi ke Base64
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(imgValue).toLowerCase().replace('.', '');
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
          : ext === 'png' ? 'image/png'
          : ext === 'webp' ? 'image/webp'
          : ext === 'gif' ? 'image/gif'
          : 'image/jpeg';

        const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        // Update database
        await db.query('UPDATE products SET img = ? WHERE id = ?', [base64, product.id]);
        console.log(`[OK] Produk ${product.id} — berhasil dimigrasi`);
        success++;
      } catch (err) {
        console.error(`[ERROR] Produk ${product.id}:`, err.message);
        failed++;
      }
    }

    console.log(`\nSelesai! Berhasil: ${success}, Gagal/Skip: ${failed}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

migrateImages();
