describe("Alur Lengkap: Admin Panel + Checkout Customer", () => {
  it("login admin → dashboard → produk → tambah produk → edit produk → pesanan → kategori → laporan → logout → login customer → checkout QRIS → sukses", () => {

    // ================== 1. LOGIN SEBAGAI ADMIN ==================
    cy.visit("/");
    cy.contains("Memuat data MeiHua", { timeout: 15000 }).should("not.exist");

    cy.contains("button", "Masuk").click();
    cy.get('input[placeholder="Alamat email"]').type(Cypress.env("adminEmail"));
    cy.get('input[placeholder="Password (min. 6 karakter)"]').type(Cypress.env("adminPassword"));
    cy.contains("button", "Masuk ke Akun").click();
    cy.contains("Ringkasan performa toko Anda", { timeout: 10000 }).should("be.visible");

    // ================== 2. LIHAT DASHBOARD ==================
    cy.contains("Ringkasan performa toko Anda").should("be.visible");
    cy.contains("Total Produk").should("be.visible");
    cy.contains("Pesanan Masuk").should("be.visible");
    cy.contains("Pesanan Terbaru").should("be.visible");

    // ================== 3. LIHAT PRODUK ==================
    cy.get(".admin-nav").contains("Produk").click();
    cy.contains("Manajemen Produk").should("be.visible");

    // ================== 4. LIHAT TAMPILAN TAMBAH PRODUK ==================
    cy.contains("button", "Tambah Produk").click();
    cy.contains("Tambah Produk Baru").should("be.visible");
    cy.get('input[placeholder="Isi nama produk"]').should("be.visible");
    cy.get('input[placeholder="0"]').should("exist"); // field harga
    // kembali ke list tanpa menyimpan (cuma lihat tampilannya)
    cy.contains("button", "Batal").click();
    cy.contains("Manajemen Produk").should("be.visible");

    // ================== 5. EDIT PRODUK ==================
    cy.get("body").then(($body) => {
      if ($body.find(".tbl tbody tr").length > 0 && $body.find('button:contains("Edit")').length > 0) {
        cy.contains("button", "Edit").first().click();
        cy.contains("Edit Produk").should("be.visible");
        cy.get('input[placeholder="Isi nama produk"]').should("not.have.value", "");
        // kembali tanpa menyimpan perubahan (cuma lihat tampilan edit)
        cy.contains("button", "Batal").click();
      } else {
        cy.log("Belum ada produk untuk di-edit, skip langkah edit produk");
      }
    });

    // ================== 6. LIHAT PESANAN DAN DETAILNYA ==================
    cy.get(".admin-nav").contains("Pesanan").click();
    cy.contains("Pesanan Masuk").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find('button:contains("Detail")').length > 0) {
        cy.contains("button", "Detail").first().click();
        cy.contains("Detail Pesanan").should("be.visible");
        cy.contains("Informasi Pelanggan").should("be.visible");
        cy.contains("Item Pesanan").should("be.visible");
        cy.get(".btn-icon").click(); // tombol X untuk menutup modal detail
      } else {
        cy.log("Belum ada pesanan sama sekali, skip lihat detail pesanan");
      }
    });

    // ================== 7. LIHAT KATEGORI ==================
    cy.get(".admin-nav").contains("Kategori").click();
    cy.url().should("include", "/"); // tetap di app yang sama (SPA, tidak reload)
    cy.get(".admin-nav").contains("Kategori").should("have.class", "active");

    // ================== 8. LIHAT LAPORAN ==================
    cy.get(".admin-nav").contains("Laporan").click();
    cy.get(".admin-nav").contains("Laporan").should("have.class", "active");

    // ================== 9. LOGOUT ==================
    cy.contains("button", "Lihat Toko").click(); // keluar dari admin panel, balik ke tampilan toko
    cy.contains("Keluar").click();
    cy.contains("Yakin ingin keluar?").should("be.visible");
    cy.contains("button", "Konfirmasi").click();
    cy.contains("button", "Masuk").should("be.visible"); // kembali ke kondisi belum login

    // ================== 10. LOGIN SEBAGAI CUSTOMER ==================
    cy.contains("button", "Masuk").click();
    cy.get('input[placeholder="Alamat email"]').type(Cypress.env("customerEmail"));
    cy.get('input[placeholder="Password (min. 6 karakter)"]').type(Cypress.env("customerPassword"));
    cy.contains("button", "Masuk ke Akun").click();
    cy.contains("nana", { matchCase: false, timeout: 10000 }).should("be.visible");

    // ================== 11. TAMBAH PRODUK KE KERANJANG ==================
    cy.get(".prod-card", { timeout: 10000 }).should("have.length.greaterThan", 0);
    cy.get(".prod-card").first().within(() => {
      cy.contains("button", "+ Keranjang").click();
    });

    // ================== 12. BUKA KERANJANG & CHECKOUT ==================
    // stub window.open supaya tidak benar-benar membuka tab baru ke Midtrans sandbox
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    cy.get(".topbar button").eq(0).click({ force: true }); // ikon keranjang
    cy.contains("Keranjang Belanja").should("be.visible");
    cy.contains("button", "Checkout Sekarang").click();

    // ================== 13. ISI DATA PENGIRIMAN (STEP 1) ==================
    cy.contains("Data Pengiriman").should("be.visible");
    cy.get('input[placeholder="Nama lengkap penerima"]').clear().type("Nana");
    cy.get('input[placeholder="08xxxxxxxxxx"]').clear().type("08123456789");
    cy.get('textarea[placeholder*="Jalan, nomor rumah"]').clear().type("Jl. Duri");
    cy.contains("button", "Pilih Metode Pembayaran").click();

    // ================== 14. PILIH METODE PEMBAYARAN QRIS (STEP 2) ==================
    cy.contains("Metode Pembayaran").should("be.visible");
    cy.contains("QRIS").click();
    cy.contains("button", "Lanjut ke Konfirmasi").click();

    // ================== 15. KONFIRMASI PESANAN (STEP 3) ==================
    cy.contains("Konfirmasi Pesanan").should("be.visible");
    cy.contains("Dikirim ke").parent().within(() => {
      cy.contains("Nana").should("be.visible");
      cy.contains("08123456789").should("be.visible");
      cy.contains("Jl. Duri").should("be.visible");
    });
    cy.contains("QRIS").should("be.visible");
    cy.contains("button", /^Bayar/).click();

    // ================== 16. PEMBAYARAN BERHASIL (STEP 4) ==================
    cy.contains("Pembayaran Berhasil", { timeout: 15000 }).should("be.visible");
    cy.contains("Terima kasih").parent().within(() => {
      cy.contains("Nana").should("be.visible");
    });
    cy.contains("Order ID").should("be.visible");
    cy.contains("via").parent().within(() => {
      cy.contains("QRIS").should("be.visible");
    });
    cy.contains("button", "Kembali Belanja").click();
  });
});
