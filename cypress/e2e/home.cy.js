describe("Halaman Utama - meihuaofficial", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.reload();
    cy.contains("Memuat data MeiHua", { timeout: 15000 }).should("not.exist");
  });

  it("berhasil membuka halaman dan HTML ter-render", () => {
    cy.get("#root", { timeout: 10000 }).should("exist");
    cy.get("#root").should("not.be.empty");
  });

  it("judul halaman muncul", () => {
    cy.title().should("exist");
  });

  it("tidak ada error 404 / halaman kosong", () => {
    cy.get("body").should("not.contain.text", "Cannot GET");
  });

  it("mengecek elemen navigasi (navbar) tampil", () => {
    cy.get(".topbar").should("exist");
    cy.get(".topbar").should("be.visible");
  });

  it("tampil dengan baik di ukuran mobile", () => {
    cy.viewport("iphone-x");
    cy.get("#root").should("be.visible");
  });
});
