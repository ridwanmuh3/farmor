# Visual diff — mockup vs implementasi

Memotret setiap layar pada **390×844** dan menaruhnya berdampingan dengan mockup SVG-nya,
supaya penyimpangan tata letak, jarak, dan teks bisa terlihat dan dicek ulang kapan saja.

Artboard mockup juga 390×844, jadi tangkapan layar sejajar **1:1** dengan mockup — tepi
dan celah bisa dibandingkan langsung tanpa penyetelan skala.

## Menjalankan

```bash
npm run visual-diff                 # semua layar
npm run visual-diff cart home       # layar tertentu saja
```

Vite dijalankan otomatis (kalau belum ada yang jalan di `:5173`), lalu Chrome headless
memotret tiap layar. Hasilnya:

```
tools/visual-diff/out/
├── index.html          # laporan, buka di browser
└── shots/*.png         # 780×1688 (390×844 @2x)
```

Buka `out/index.html`. Tiga mode tersedia lewat bilah atas:

| Mode | Gunanya |
|---|---|
| **Berdampingan** | Melihat mockup dan implementasi bersebelahan. |
| **Overlay** | Mockup ditumpuk di atas implementasi; geser opasitas untuk melihat pergeseran. |
| **Difference** | `mix-blend-mode: difference` — area yang sama jadi hitam, area yang bergeser menyala. |

Ada juga slider zoom untuk memeriksa teks lebih dekat.

## Gerbang kesetiaan (RMSE)

Tiap tangkapan juga diadu piksel-per-piksel dengan mockup-nya, dan hasilnya ditulis ke
`out/fidelity.json`. Harness **keluar dengan kode 1** kalau ada layar yang melewati batasnya,
jadi penyimpangan tata letak tidak bisa lolos tanpa disadari.

Batas per layar ada di `LIMITS` ([`screens.mjs`](./screens.mjs)); `DEFAULT_LIMIT` dipakai untuk
layar yang tidak didaftarkan. Angkanya ditetapkan sedikit di atas nilai nyata, lalu
dirapatkan setiap kali layar diperbaiki — jadi gerbang ini adalah ratchet, bukan target.

RMSE dihitung tanpa dependensi: PNG didekode sendiri pakai `zlib` bawaan Node
([`png.mjs`](./png.mjs)), lalu dibandingkan pada resolusi yang sama (780×1688). Mockup
dirasterkan di Chrome yang sama dengan meta viewport 390px supaya skalanya identik.

```bash
npm run visual-diff            # gagal (exit 1) kalau ada yang melewati batas
```

Skor RMSE muncul di stdout dan di tiap kartu laporan (`RMSE x% / batas y%`).

## Menambah layar

Ubah satu berkas: [`screens.mjs`](./screens.mjs).

```js
{ id: 'cart', label: 'Cart', mockup: 'CartScreen.svg', route: '/tabs/cart', world: 'cart' }
```

- `route` boleh fungsi kalau butuh id yang baru dibuat — mis. `/receipt/${ctx.groupId}`.
- `world` menentukan isi `localStorage` sebelum dipotret: `blank`, `cart`, `order`,
  `seller`, `sellerOrders`, atau `wishlist`.

Untuk layar yang butuh pesanan, world `order` **menjalankan alur checkout yang asli**
(kirim keranjang → tekan tombol bayar), bukan menulis objek `Order` buatan tangan.
Jadi bentuk data selalu ikut logika domain yang sebenarnya, tidak bisa menyimpang.

## Kenapa tanpa dependensi

Tidak ada paket npm yang ditambahkan. Node 24 sudah punya `fetch` dan `WebSocket` bawaan,
jadi harness ini bicara langsung ke Chrome lewat DevTools Protocol
([`cdp.mjs`](./cdp.mjs)). Chrome diambil dari cache Playwright yang sudah ada di mesin —
kalau lokasinya beda, set `CHROME_PATH`.

Cypress tidak dipakai karena binernya belum terpasang (~200 MB), dan render Electron-nya
beda dari Chromium sehingga perbandingan piksel jadi kurang bisa dipercaya.

## Batas yang perlu diketahui

- **Teks di mockup sudah jadi outline `<path>`.** SVG-nya tidak punya elemen `<text>`
  sama sekali, jadi perbedaan label **tidak bisa dideteksi otomatis** — hanya bisa dilihat
  mata lewat mode overlay/difference. Inilah alasan harness ini ada.
- **Perbedaan yang disengaja.** Tombol stepper (28px → 44px) dan chip kategori (38px → 44px)
  memang berbeda dari mockup demi target sentuh; lihat komentar di
  [`tokens.css`](../../src/presentation/theme/tokens.css). Jangan "perbaiki" ini.
- **Layar tanpa mockup** didaftarkan di `WITHOUT_MOCKUP` (`screens.mjs`) supaya
  ketidakhadirannya tercatat, bukan terlewat: Checkout, Order Detail, Address Book,
  Forgot Password, Seller Products, Help / Terms / About.
