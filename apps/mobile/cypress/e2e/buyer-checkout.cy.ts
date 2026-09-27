/**
 * Alur pembeli nyata: splash → onboarding → masuk → produk → keranjang → checkout → struk → riwayat.
 *
 * Seluruh negara aplikasi (keranjang, pesanan, sesi) disimpan di localStorage,
 * jadi Cypress yang membersihkannya di tiap tes.
 *
 * Ionic menyimpan banyak halaman dalam satu DOM dan menutupinya lewat
 * `.ion-page-hidden` (display: none), `.ion-page-invisible` (opacity: 0 saat
 * transisi), bahkan `ion-app` yang ikut punya class `ion-page`. Karena itu
 * `cy.contains` biasa bisa menangkap halaman lama yang sedang tersembunyi, jadi
 * pencarian teks di sini memakai `findText`: pilih elemen terdalam yang
 * benar-benar dirender, lalu biarkan `.should` mengulanginya sampai transisi selesai.
 */

/** Elemen yang dirender: berukuran, tidak display:none, tidak transisi opacity 0. */
const isRendered = (el: HTMLElement): boolean => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;

  let node: HTMLElement | null = el;
  while (node) {
    const cs = node.ownerDocument.defaultView!.getComputedStyle(node);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
    node = node.parentElement;
  }
  return true;
};

/** Elemen terdalam berisi teks yang sedang dirender; `tag` menyaring jenis elemen. */
const findText = (doc: Document, text: string | RegExp, tag?: string): HTMLElement | null => {
  const match = (el: Element) => {
    const content = el.textContent ?? '';
    return typeof text === 'string' ? content.includes(text) : text.test(content);
  };

  const candidates = Array.from(doc.querySelectorAll(tag ?? '*')).filter(match);
  const deepest = candidates.filter(
    (el) => !candidates.some((other) => other !== el && el.contains(other)),
  );
  return (deepest.find((el) => isRendered(el as HTMLElement)) as HTMLElement | null) ?? null;
};

/** Teks tampil di halaman yang sedang aktif (mengulang sampai transisi selesai). */
const see = (text: string | RegExp) =>
  cy.get('body').should(($body) => {
    expect(findText($body[0].ownerDocument!, text), `teks "${text}" tampak`).to.not.equal(null);
  });

/** Klik tombol yang sedang tampil berisi teks. */
const tap = (text: string) =>
  cy
    .get('body')
    .should(($body) => {
      expect(
        findText($body[0].ownerDocument!, text, 'button'),
        `tombol "${text}" tampak`,
      ).to.not.equal(null);
    })
    .then(($body) => cy.wrap(findText($body[0].ownerDocument!, text, 'button')).click());

const EMAIL = 'pembeli@farmor.id';
const PASSWORD = 'rahasia123';

/** Masuk lewat layar yang sebenarnya, bukan menyuntik sesi. */
const login = () => {
  cy.visit('/');
  cy.get('button[aria-label="Mulai"]').click();
  cy.location('pathname').should('eq', '/onboarding');

  tap('Lewati');
  cy.location('pathname').should('eq', '/login');

  cy.get('input[placeholder="budi.petani@gmail.com"]').type(EMAIL);
  cy.get('input[aria-label="Kata Sandi"]').type(PASSWORD);
  tap('Masuk Sekarang');
  cy.location('pathname').should('eq', '/tabs/home');
};

/** Tab bawah ada di luar ion-page; href-nya jalan di React Router. */
const openTab = (path: string) => cy.get(`ion-tab-button[href="${path}"]`).click({ force: true });

describe('pembeli: belanja sampai bayar', () => {
  it('membayar satu produk dan pesanan muncul di riwayat', () => {
    login();

    // Beranda → detail produk
    see('Ridwan Muh');
    tap('Wortel Organik Segar');
    cy.location('pathname').should('eq', '/product/p1');
    see('Wortel Organik Segar');

    // Dua kilo, masuk keranjang
    cy.get('button[aria-label="Tambah jumlah"]').click();
    tap('+ Keranjang');
    see('Ditambahkan ✓');
    tap('Keranjang');
    cy.location('pathname').should('eq', '/tabs/cart');

    // Keranjang: jumlah, promo, dan total
    see('Wortel Organik Segar');
    see('Subtotal (2 item)');
    cy.get('input[aria-label="Kode promo"]').type('PANEN10');
    tap('Terapkan');
    see('Kode PANEN10 dipakai.');
    see('Rp36.600'); // 24.000 + 15.000 ongkir − 2.400 diskon

    tap('Lanjut Bayar');
    cy.location('pathname').should('eq', '/checkout');

    // Checkout: alamat, metode bayar, total
    see('Ridwan Muh · 08123456789');
    tap('E-Money');
    cy.contains('button[aria-pressed="true"]', 'E-Money').should('exist');
    tap('Bayar Rp36.600');

    // Web masih simulasi: 600 ms lalu pindah ke struk
    cy.location('pathname', { timeout: 10_000 }).should('match', /^\/receipt\/.+/);
    see('Pembayaran Berhasil');
    see('E-Money');
    see('Ridwan Muh · 08123456789');

    // Struk → riwayat pesanan
    tap('Lihat Riwayat Pesanan');
    cy.location('pathname').should('eq', '/orders');
    see('Riwayat Pesanan');
    see('Tani Makmur');
    see('Wortel Organik Segar × 2 kg');
    see(/INV\/\d{8}\/FF01/);
    see('Rp36.600');

    // Keranjang dikosongkan setelah bayar
    cy.visit('/tabs/cart');
    see('Keranjang masih kosong');
  });

  it('memisah pesanan per penjual saat keranjang lintas penjual', () => {
    // Wortel (Tani Makmur, Lembang) + Bayam (Sayur Berkah, Cianjur)
    cy.visit('/tabs/explore');
    cy.get('button[aria-label="Tambah Wortel Organik Segar ke keranjang"]').click();
    cy.get('button[aria-label="Tambah Bayam Hijau ke keranjang"]').click();

    openTab('/tabs/cart');
    cy.location('pathname').should('eq', '/tabs/cart');
    see('Tani Makmur');
    see('Sayur Berkah');
    see('Ongkos kirim (2 penjual)');
    see('Rp48.000'); // 18.000 + 2 × 15.000 ongkir

    tap('Lanjut Bayar');
    cy.location('pathname').should('eq', '/checkout');
    tap('Transfer Bank');
    tap('Bayar Rp48.000');

    cy.location('pathname', { timeout: 10_000 }).should('match', /^\/receipt\/.+/);
    see('2 pesanan dibuat dari 2 penjual');
    see('Transfer Bank');
    see('Tani Makmur');
    see('Sayur Berkah');
    see('Rp48.000');
  });
});
