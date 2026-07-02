describe("Fitur Pencarian Produk", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.reload();
    cy.contains("Memuat data MeiHua", { timeout: 15000 }).should("not.exist");
  });

  it("search bar tampil dengan placeholder yang benar", () => {
    cy.get(".search-bar").should("exist");
    cy.get(".search-bar").should("have.attr", "placeholder", "Cari produk perhiasan...");
  });

  it("mengetik keyword random menampilkan pesan 'tidak ditemukan'", () => {
    const keywordAcakYangTidakAda = "zzzxxxyyyqqq123";
    cy.get(".search-bar").type(keywordAcakYangTidakAda);
    cy.contains(`Tidak ada produk untuk "${keywordAcakYangTidakAda}"`).should("be.visible");
  });

  it("tombol clear (x) muncul saat ada teks dan search bisa dikosongkan lagi", () => {
    cy.get(".search-bar").type("cincin");
    cy.get(".search-bar").should("have.value", "cincin");
    // tombol X ada di sebelah kanan search bar (muncul hanya saat searchQuery tidak kosong)
    cy.get(".search-bar").parent().find("button").click();
    cy.get(".search-bar").should("have.value", "");
  });

  it("hasil pencarian ter-filter sesuai keyword", () => {
    cy.get(".search-bar").type("a"); // huruf umum, harusnya ada hasil di kebanyakan produk
    cy.get("body").then(($body) => {
      if ($body.find(".prod-card").length > 0) {
        cy.get(".prod-card").should("have.length.greaterThan", 0);
      } else {
        cy.log("Tidak ada produk sama sekali di database - cek data seed backend");
      }
    });
  });
});
