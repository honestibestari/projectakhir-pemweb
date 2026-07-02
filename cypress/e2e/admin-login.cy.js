describe("Login Admin & Akses Admin Panel", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.reload();
    cy.contains("Memuat data MeiHua", { timeout: 15000 }).should("not.exist");
  });

  it("login dengan akun admin berhasil dan langsung masuk ke Admin Dashboard", () => {
    cy.contains("button", "Masuk").click();
    cy.get('input[placeholder="Alamat email"]').type("admin@nn.com");
    cy.get('input[placeholder="Password (min. 6 karakter)"]').type("123456");
    cy.contains("button", "Masuk ke Akun").click();

    cy.contains("Ringkasan performa toko Anda", { timeout: 10000 }).should("be.visible");
    cy.contains("Selamat datang").should("be.visible");
    cy.get(".topbar").should("not.exist");
  });

  it("menu sidebar admin (Dashboard, Produk, Pesanan, Kategori, Laporan) bisa diklik semua", () => {
    cy.contains("button", "Masuk").click();
    cy.get('input[placeholder="Alamat email"]').type("admin@nn.com");
    cy.get('input[placeholder="Password (min. 6 karakter)"]').type("123456");
    cy.contains("button", "Masuk ke Akun").click();
    cy.contains("Ringkasan performa toko Anda", { timeout: 10000 }).should("be.visible");

    cy.get(".admin-nav").contains("Produk").click();
    cy.contains("Manajemen Produk").should("be.visible");

    cy.get(".admin-nav").contains("Pesanan").click();
    cy.contains("Pesanan Masuk").should("be.visible");

    cy.get(".admin-nav").contains("Kategori").click();
    cy.get(".admin-nav").contains("Kategori").should("have.class", "active");

    cy.get(".admin-nav").contains("Laporan").click();
    cy.get(".admin-nav").contains("Laporan").should("have.class", "active");
  });

  it("logout dari admin panel mengembalikan ke tampilan awal (belum login)", () => {
    cy.contains("button", "Masuk").click();
    cy.get('input[placeholder="Alamat email"]').type("admin@nn.com");
    cy.get('input[placeholder="Password (min. 6 karakter)"]').type("123456");
    cy.contains("button", "Masuk ke Akun").click();
    cy.contains("Ringkasan performa toko Anda", { timeout: 10000 }).should("be.visible");

    cy.contains("button", "Lihat Toko").click();
    cy.contains("Keluar").click();
    cy.contains("Yakin ingin keluar?").should("be.visible");
    cy.contains("button", "Konfirmasi").click();

    cy.contains("button", "Masuk").should("be.visible");
  });
});