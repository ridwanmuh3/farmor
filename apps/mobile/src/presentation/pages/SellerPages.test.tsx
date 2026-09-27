import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import {
  SellerAddProduct,
  SellerDashboard,
  SellerOrders,
  SellerProducts,
} from './SellerPages';
import { cartRepo, orderRepo, productRepo } from '../../data/repositories';
import { ADDRESSES } from '../../data/dto/catalog';

/**
 * Seam: halaman penjual seperti yang dilihat dan dioperasikan pengguna.
 * Penjual tetap halaman ini adalah s1 (Tani Makmur) dengan produk p1..p4.
 * p1 x2 -> subtotal 24.000.
 */

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/add" element={<SellerAddProduct />} />
            <Route path="/product/:id" element={<div>halaman produk</div>} />
            <Route path="/tabs/home" element={<div>halaman beranda</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

/** Pesanan nyata untuk penjual s1 lewat jalur publik. */
const seedSellerOrder = (qty = 2) => {
  cartRepo.setQty('p1', qty);
  return orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'qris').orders[0];
};

beforeEach(() => {
  localStorage.clear();
});

describe('Dasbor penjual', () => {
  it('menyapa penjual dan menghitung statistik awal', async () => {
    renderAt('/seller/dashboard');

    expect(await screen.findByText('Pak Harto (Tani Makmur)')).toBeTruthy();
    expect(screen.getByText('Selamat Bekerja,')).toBeTruthy();
    expect(screen.getByText('Pendapatan Bulan Ini')).toBeTruthy();
    expect(screen.getByText('Rp0')).toBeTruthy();
    expect(screen.getByText('Total Pesanan')).toBeTruthy();
    expect(screen.getByText('Produk Aktif')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('4.8 ★')).toBeTruthy();
  });

  it('menampilkan empty state tanpa pesanan', async () => {
    renderAt('/seller/dashboard');

    expect(await screen.findByText('Belum ada pesanan')).toBeTruthy();
  });

  it('menghitung pendapatan dan pesanan aktif dari pesanan nyata', async () => {
    seedSellerOrder(2);
    renderAt('/seller/dashboard');

    const revenueCard = (await screen.findByText('Pendapatan Bulan Ini')).closest('.ff-card');
    expect(revenueCard?.textContent).toContain('Rp24.000');
    // Total Pesanan = 1
    expect(screen.getAllByText('1')).toHaveLength(1);
  });

  it('menampilkan pesanan terbaru dengan nama penerima dan total', async () => {
    seedSellerOrder(2);
    renderAt('/seller/dashboard');

    expect(await screen.findByText('Ridwan Muh')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar × 2 kg')).toBeTruthy();
    // pendapatan penjual dan total pesanan kebetulan sama besarnya
    expect(screen.getAllByText('Rp24.000')).toHaveLength(2);
    expect(screen.getByText('Proses')).toBeTruthy();
  });

  it('aksi cepat membuka tambah produk', async () => {
    const user = userEvent.setup();
    renderAt('/seller/dashboard');

    await user.click(await screen.findByText('Tambah Produk'));
    expect(await screen.findByText('Tambah Foto Produk')).toBeTruthy();
    expect(screen.getByText(/Unggah foto menyusul/)).toBeTruthy();
  });

  it('kelola stok membuka daftar produk', async () => {
    const user = userEvent.setup();
    renderAt('/seller/dashboard');

    await user.click(await screen.findByText('Kelola Stok'));

    expect(await screen.findByText('Kelola Produk')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
  });
});

describe('Kelola pesanan penjual', () => {
  it('menampilkan jumlah pesanan baru pada tab', async () => {
    seedSellerOrder(2);
    renderAt('/seller/orders');

    expect(await screen.findByText('Kelola Pesanan')).toBeTruthy();
    expect(screen.getByText('Baru 1')).toBeTruthy();
    expect(screen.getByText('Ridwan Muh')).toBeTruthy();
    expect(screen.getByText('Kirim ke: Jl. Cihampelas No. 12, Sukajadi, Bandung 40162')).toBeTruthy();
  });

  it('menampilkan empty state saat tahap ini kosong', async () => {
    renderAt('/seller/orders');

    expect(await screen.findByText('Tidak ada pesanan')).toBeTruthy();
  });

  it('menerima pesanan memindahkannya ke tahap diproses', async () => {
    const user = userEvent.setup();
    seedSellerOrder(2);
    renderAt('/seller/orders');

    await user.click(await screen.findByText('Terima & Proses'));

    expect(screen.getByText('Tidak ada pesanan')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Diproses' }));

    expect(screen.getByText('Kirim Pesanan')).toBeTruthy();
  });

  it('mengirim pesanan menandainya menunggu konfirmasi pembeli', async () => {
    const user = userEvent.setup();
    const order = seedSellerOrder(2);
    orderRepo.setStatus(order.id, 'diproses');
    renderAt('/seller/orders');

    await user.click(screen.getByRole('button', { name: 'Diproses' }));
    await user.click(await screen.findByText('Kirim Pesanan'));

    await user.click(screen.getByRole('button', { name: 'Dikirim' }));
    expect(screen.getByText('Menunggu konfirmasi pembeli')).toBeTruthy();
  });

  it('menolak pesanan memindahkannya ke tahap selesai setelah konfirmasi', async () => {
    const user = userEvent.setup();
    seedSellerOrder(2);
    renderAt('/seller/orders');

    await user.click(await screen.findByText('Tolak'));

    expect(await screen.findByText('Tolak pesanan ini?')).toBeTruthy();
    expect(screen.getByText('Terima & Proses')).toBeTruthy();

    await user.click(screen.getByText('Ya, Tolak'));

    await user.click(screen.getByRole('button', { name: 'Selesai' }));
    expect(screen.getByText('Ditolak penjual')).toBeTruthy();
  });

  it('batal pada konfirmasi tolak tidak mengubah status pesanan', async () => {
    const user = userEvent.setup();
    seedSellerOrder(2);
    renderAt('/seller/orders');

    await user.click(await screen.findByText('Tolak'));
    await user.click(await screen.findByText('Batal'));

    expect(screen.queryByText('Tolak pesanan ini?')).toBeNull();
    expect(screen.getByText('Terima & Proses')).toBeTruthy();
  });

  it('menandai pesanan selesai', async () => {
    const user = userEvent.setup();
    const order = seedSellerOrder(2);
    orderRepo.setStatus(order.id, 'selesai');
    renderAt('/seller/orders');

    await user.click(screen.getByRole('button', { name: 'Selesai' }));

    expect(screen.getByText('Pesanan selesai')).toBeTruthy();
  });
});

describe('Kelola produk penjual', () => {
  it('menampilkan produk milik penjual beserta stoknya', async () => {
    renderAt('/seller/products');

    expect(await screen.findByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Kentang Dieng')).toBeTruthy();
    expect(screen.getByText('Stok 40')).toBeTruthy();
    // produk penjual lain tidak ikut tampil
    expect(screen.queryByText('Telur Ayam Kampung')).toBeNull();
  });

  it('menambah dan mengurangi stok', async () => {
    const user = userEvent.setup();
    renderAt('/seller/products');

    await screen.findByText('Stok 40');
    await user.click(screen.getAllByText('+ 5')[0]);

    expect(screen.getByText('Stok 45')).toBeTruthy();

    await user.click(screen.getAllByText('− 5')[0]);

    expect(screen.getByText('Stok 40')).toBeTruthy();
  });

  it('menandai produk yang stoknya habis', async () => {
    productRepo.setStock('p1', 0);
    renderAt('/seller/products');

    expect(await screen.findByText('Habis')).toBeTruthy();
  });

  it('tambah dan lihat halaman produk berfungsi', async () => {
    const user = userEvent.setup();
    renderAt('/seller/products');

    await user.click(await screen.findByText('Tambah'));
    expect(await screen.findByText('Tambah Foto Produk')).toBeTruthy();
  });

  it('membuka halaman produk pembeli dari daftar', async () => {
    const user = userEvent.setup();
    renderAt('/seller/products');

    await user.click((await screen.findAllByText('Lihat Halaman'))[0]);

    expect(await screen.findByText('halaman produk')).toBeTruthy();
  });
});

describe('Tambah produk penjual', () => {
  it('menolak form yang belum lengkap', async () => {
    const user = userEvent.setup();
    renderAt('/seller/add');

    await user.click(await screen.findByText('Simpan Produk'));

    expect(screen.getByText('Nama, harga di atas 0, dan stok wajib diisi.')).toBeTruthy();
  });

  it('membalik sakelar produk organik', async () => {
    const user = userEvent.setup();
    renderAt('/seller/add');

    const toggle = await screen.findByRole('switch');
    expect(toggle.getAttribute('aria-checked')).toBe('true');

    await user.click(toggle);

    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('menyimpan produk baru lalu kembali ke daftar produk', async () => {
    const user = userEvent.setup();
    renderAt('/seller/add');

    await user.type(await screen.findByLabelText('Nama Produk'), 'Tomat Ceri');
    await user.type(screen.getByLabelText('Harga per Satuan'), '30000');
    await user.type(screen.getByLabelText('Stok Tersedia'), '80');
    await user.click(screen.getByText('Simpan Produk'));

    expect(await screen.findByText('Tersimpan ✓')).toBeTruthy();
    expect(productRepo.bySeller('s1').some((p) => p.name === 'Tomat Ceri')).toBe(true);
    expect(await screen.findByText('Kelola Produk', {}, { timeout: 3_000 })).toBeTruthy();
    expect(screen.getByText('Tomat Ceri')).toBeTruthy();
  });
});
