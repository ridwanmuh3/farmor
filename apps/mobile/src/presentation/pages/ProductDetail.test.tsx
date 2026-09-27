import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { ProductDetail } from './ProductDetail';
import { cartRepo, productRepo, wishlistRepo } from '../../data/repositories';

/**
 * Seam: halaman Detail Produk seperti yang dilihat dan dioperasikan pengguna.
 * Produk uji p1: Wortel Organik Segar, 12.000/kg, stok 40, organik, penjual s1.
 */

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/tabs/cart" element={<div>halaman keranjang</div>} />
            <Route path="/tabs/explore" element={<div>halaman katalog</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

beforeEach(() => {
  localStorage.clear();
  // Jumlah yang dipilih disimpan per produk di sessionStorage.
  sessionStorage.clear();
});

describe('Detail produk tidak ditemukan', () => {
  it('menampilkan pesan dan jalan kembali ke katalog', () => {
    renderAt('/product/tidak-ada');

    expect(screen.getByText('Produk tidak ditemukan.')).toBeTruthy();
    expect(screen.getByText('Kembali ke katalog')).toBeTruthy();
  });
});

describe('Detail produk', () => {
  it('menampilkan harga, penjual, stok, dan deskripsi', async () => {
    renderAt('/product/p1');

    expect(await screen.findByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Rp12.000')).toBeTruthy();
    expect(screen.getByText('Stok tersedia: 40 kg')).toBeTruthy();
    expect(screen.getAllByText(/^4\.8/).length).toBeGreaterThan(0);
    expect(screen.getByText('(120 ulasan pembeli)')).toBeTruthy();
    expect(screen.getByText('412 terjual · berat 1 kg per kg')).toBeTruthy();
    expect(screen.getByText('Tani Makmur · Lembang')).toBeTruthy();
    expect(screen.getByText('TERVERIFIKASI')).toBeTruthy();
  });

  it('menampilkan produk serupa dari kategori yang sama', async () => {
    renderAt('/product/p1');

    expect(await screen.findByText('Produk Serupa')).toBeTruthy();
    expect(screen.getByText('Kentang Dieng')).toBeTruthy();
    expect(screen.getByText('Tomat Merah')).toBeTruthy();
  });

  it('menyimpan dan melepas favorit', async () => {
    const user = userEvent.setup();
    renderAt('/product/p1');

    const saveBtn = await screen.findByLabelText('Simpan ke favorit');
    expect(saveBtn.getAttribute('aria-pressed')).toBe('false');

    await user.click(saveBtn);

    const savedBtn = screen.getByLabelText('Hapus dari favorit');
    expect(savedBtn.getAttribute('aria-pressed')).toBe('true');
    expect(wishlistRepo.has('p1')).toBe(true);

    await user.click(savedBtn);

    expect(screen.getByLabelText('Simpan ke favorit').getAttribute('aria-pressed')).toBe('false');
    expect(wishlistRepo.has('p1')).toBe(false);
  });

  it('menambahkan ke keranjang sejumlah qty yang dipilih', async () => {
    const user = userEvent.setup();
    renderAt('/product/p1');

    await screen.findByText('Wortel Organik Segar');
    await user.click(screen.getByLabelText('Tambah jumlah')); // 1 -> 2
    await user.click(screen.getByText('+ Keranjang'));

    expect(await screen.findByText('Ditambahkan ✓')).toBeTruthy();
    expect(cartRepo.get()).toEqual([{ productId: 'p1', qty: 2 }]);
  });

  it('menahan qty pada sisa stok yang belum masuk keranjang', async () => {
    cartRepo.setQty('p1', 39); // sisa 1
    renderAt('/product/p1');

    await screen.findByText('Wortel Organik Segar');
    const plus = screen.getByLabelText('Tambah jumlah') as HTMLButtonElement;

    expect(plus.disabled).toBe(true);
  });

  it('mengunci pembelian saat stok habis', async () => {
    productRepo.setStock('p1', 0);
    renderAt('/product/p1');

    const buy = (await screen.findByText('Stok Habis')).closest('button');

    expect(buy).toHaveProperty('disabled', true);
    expect(screen.getByText('Stok habis')).toBeTruthy();
  });

  it('tombol Keranjang membawa ke halaman keranjang', async () => {
    const user = userEvent.setup();
    renderAt('/product/p1');

    await user.click(await screen.findByText('Keranjang'));

    expect(await screen.findByText('halaman keranjang')).toBeTruthy();
  });

  it('ingat jumlah yang dipilih saat produk dibuka lagi', async () => {
    const user = userEvent.setup();
    const first = renderAt('/product/p1');

    await user.click(await screen.findByLabelText('Tambah jumlah')); // 1 -> 2
    await user.click(screen.getByLabelText('Tambah jumlah')); // 2 -> 3
    first.unmount();

    renderAt('/product/p1');

    expect(await screen.findByText('3')).toBeTruthy();
  });
});
