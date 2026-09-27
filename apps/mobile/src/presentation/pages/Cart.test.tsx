import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { Cart } from './Cart';
import { cartRepo, productRepo } from '../../data/repositories';

/**
 * Seam: halaman Keranjang seperti yang dilihat dan dioperasikan pengguna.
 *
 * Keranjang uji: p1 x2 (12.000, penjual s1) + p9 x1 (32.000, penjual s3)
 *   subtotal 56.000 · ongkir 2 x 15.000 = 30.000 · total 86.000
 */

const renderCart = () =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={['/tabs/cart']}>
        <ShopProvider>
          <Routes>
            <Route path="/tabs/cart" element={<Cart />} />
            <Route path="/checkout" element={<div>halaman checkout</div>} />
            <Route path="/product/:id" element={<div>halaman produk</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

const seedCart = () => {
  cartRepo.setQty('p1', 2);
  cartRepo.setQty('p9', 1);
};

beforeEach(() => {
  localStorage.clear();
});

describe('Keranjang kosong', () => {
  it('menampilkan empty state tanpa tombol hapus', async () => {
    renderCart();

    expect(await screen.findByText('Keranjang masih kosong')).toBeTruthy();
    expect(screen.queryByText('Hapus Semua')).toBeNull();
    expect(screen.queryByText('Lanjut Bayar')).toBeNull();
  });
});

describe('Keranjang berisi', () => {
  it('mengelompokkan item per penjual', async () => {
    seedCart();
    renderCart();

    expect(await screen.findByText('Tani Makmur')).toBeTruthy();
    expect(screen.getByText('Ternak Jaya')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Telur Ayam Kampung')).toBeTruthy();
  });

  it('menampilkan harga satuan dan sisa stok tiap baris', async () => {
    seedCart();
    renderCart();

    expect(await screen.findByText('Rp12.000/kg · stok 40')).toBeTruthy();
    expect(screen.getByText('Rp32.000/kg · stok 22')).toBeTruthy();
  });

  it('menghitung jumlah item, jumlah penjual, dan total', async () => {
    seedCart();
    renderCart();

    expect(await screen.findByText('Subtotal (3 item)')).toBeTruthy();
    expect(screen.getByText('Ongkos kirim (2 penjual)')).toBeTruthy();
    expect(screen.getByText('Rp56.000')).toBeTruthy();
    expect(screen.getByText('Rp30.000')).toBeTruthy();
    expect(screen.getByText('Rp86.000')).toBeTruthy();
  });

  it('menaikkan qty memperbarui subtotal dan total', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await screen.findByText('Subtotal (3 item)');
    await user.click(screen.getAllByLabelText('Tambah jumlah')[0]); // p1: 2 -> 3

    expect(screen.getByText('Subtotal (4 item)')).toBeTruthy();
    expect(screen.getByText('Rp68.000')).toBeTruthy();
    expect(screen.getByText('Rp98.000')).toBeTruthy();
  });

  it('menghapus satu baris menyisakan penjual lain', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(await screen.findByLabelText('Hapus Wortel Organik Segar'));

    expect(screen.queryByText('Wortel Organik Segar')).toBeNull();
    expect(screen.getByText('Telur Ayam Kampung')).toBeTruthy();
    expect(screen.getByText('Subtotal (1 item)')).toBeTruthy();
  });

  it('nama produk membuka halaman produk', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(await screen.findByText('Wortel Organik Segar'));

    expect(await screen.findByText('halaman produk')).toBeTruthy();
  });

  it('tombol Lanjut Bayar membawa ke checkout', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(await screen.findByText('Lanjut Bayar'));

    expect(await screen.findByText('halaman checkout')).toBeTruthy();
  });
});

describe('Keranjang dan hapus semua', () => {
  it('meminta konfirmasi sebelum mengosongkan keranjang', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(await screen.findByText('Hapus Semua'));

    expect(await screen.findByText('Hapus semua item?')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
  });

  it('batal menutup konfirmasi tanpa menghapus', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(await screen.findByText('Hapus Semua'));
    await user.click(screen.getByText('Batal'));

    expect(screen.queryByText('Hapus semua item?')).toBeNull();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
  });

  it('konfirmasi mengosongkan keranjang', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(await screen.findByText('Hapus Semua'));
    await user.click(screen.getByText('Ya, Hapus'));

    expect(await screen.findByText('Keranjang masih kosong')).toBeTruthy();
    expect(cartRepo.get()).toEqual([]);
  });
});

describe('Keranjang dan stok', () => {
  it('mengunci checkout saat jumlah melebihi stok tersisa', async () => {
    seedCart();
    productRepo.setStock('p1', 1); // keranjang punya 2
    renderCart();

    const pay = (await screen.findByText('Lanjut Bayar')).closest('button');

    expect(pay).toHaveProperty('disabled', true);
    expect(screen.getByText('Ada produk yang melebihi stok. Kurangi jumlahnya dulu.')).toBeTruthy();
  });

  it('mengizinkan checkout saat stok masih cukup', async () => {
    seedCart();
    renderCart();

    const pay = (await screen.findByText('Lanjut Bayar')).closest('button');

    expect(pay).toHaveProperty('disabled', false);
    expect(screen.getByText('Dibayar sekali, pesanan dipisah per penjual.')).toBeTruthy();
  });
});
