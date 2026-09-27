import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { Checkout } from './Checkout';
import { OrderReceipt } from './OrderReceipt';
import { cartRepo, orderRepo } from '../../data/repositories';

/**
 * Seam: halaman Checkout seperti yang dilihat dan dioperasikan pengguna.
 * Angka uang ditulis sebagai literal, bukan dihitung ulang lewat rupiah(),
 * supaya tes bisa benar-benar berbeda pendapat dengan kode.
 *
 * Keranjang uji: p1 x2 (12.000, penjual s1) + p9 x1 (32.000, penjual s3)
 *   subtotal 56.000 · ongkir 2 x 15.000 = 30.000 · total 86.000
 *   dengan PANEN10: diskon 5.600 · total 80.400
 */

const renderCheckout = () =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={['/checkout']}>
        <ShopProvider>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/tabs/cart" element={<div>halaman keranjang</div>} />
            <Route path="/receipt/:groupId" element={<OrderReceipt />} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

/** Dua penjual berbeda, supaya pemecahan pesanan ikut teruji. */
const seedCart = () => {
  cartRepo.setQty('p1', 2);
  cartRepo.setQty('p9', 1);
};

beforeEach(() => {
  localStorage.clear();
});

describe('Checkout dengan keranjang kosong', () => {
  it('menampilkan ajakan kembali ke keranjang', async () => {
    renderCheckout();

    expect(await screen.findByText('Tidak ada yang dibayar')).toBeTruthy();
    expect(screen.getByText('Ke Keranjang')).toBeTruthy();
  });

  it('tombol Ke Keranjang membawa ke halaman keranjang', async () => {
    const user = userEvent.setup();
    renderCheckout();

    await user.click(await screen.findByText('Ke Keranjang'));

    expect(await screen.findByText('halaman keranjang')).toBeTruthy();
  });
});

describe('Checkout menampilkan rincian', () => {
  it('menampilkan alamat pengiriman terpilih', async () => {
    seedCart();
    renderCheckout();

    expect(await screen.findByText('Alamat Pengiriman')).toBeTruthy();
    expect(screen.getByText('Ridwan Muh · 08123456789')).toBeTruthy();
    expect(screen.getByText('Jl. Cihampelas No. 12, Sukajadi, Bandung 40162')).toBeTruthy();
  });

  it('memecah ringkasan per penjual', async () => {
    seedCart();
    renderCheckout();

    expect(await screen.findByText('Tani Makmur')).toBeTruthy();
    expect(screen.getByText('Ternak Jaya')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Telur Ayam Kampung')).toBeTruthy();
  });

  it('menghitung subtotal, ongkir per penjual, dan total bayar', async () => {
    seedCart();
    renderCheckout();

    expect(await screen.findByText('Rp56.000')).toBeTruthy();
    expect(screen.getByText('Rp30.000')).toBeTruthy();
    expect(screen.getByText('Rp86.000')).toBeTruthy();
    // ongkir flat ditagih per penjual
    expect(screen.getAllByText('Rp15.000')).toHaveLength(2);
    expect(screen.getByText('Bayar Rp86.000')).toBeTruthy();
  });
});

describe('Checkout dan kode promo', () => {
  it('menerapkan PANEN10 dan menampilkan potongannya', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.type(await screen.findByLabelText('Kode promo'), 'PANEN10');
    await user.click(screen.getByText('Pakai'));

    expect(await screen.findByText('PANEN10 aktif')).toBeTruthy();
    expect(screen.getByText('-Rp5.600')).toBeTruthy();
    expect(screen.getByText('Rp80.400')).toBeTruthy();
  });

  it('menolak kode yang tidak dikenal tanpa mengubah total', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.type(await screen.findByLabelText('Kode promo'), 'KODE-SALAH');
    await user.click(screen.getByText('Pakai'));

    expect(await screen.findByText('Kode promo tidak dikenal.')).toBeTruthy();
    expect(screen.queryByText('-Rp5.600')).toBeNull();
    expect(screen.getByText('Rp86.000')).toBeTruthy();
  });

  it('menghapus promo mengembalikan total penuh', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.type(await screen.findByLabelText('Kode promo'), 'PANEN10');
    await user.click(screen.getByText('Pakai'));
    await screen.findByText('PANEN10 aktif');

    await user.click(screen.getByText('Hapus'));

    expect(screen.queryByText('PANEN10 aktif')).toBeNull();
    expect(screen.getByText('Rp86.000')).toBeTruthy();
  });
});

describe('Checkout dan metode pembayaran', () => {
  it('memindahkan pilihan metode dan menyesuaikan catatan kaki', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    const qris = (await screen.findByText('QRIS')).closest('button');
    const transfer = screen.getByText('Transfer Bank').closest('button');
    expect(qris?.getAttribute('aria-pressed')).toBe('true');

    await user.click(screen.getByText('Transfer Bank'));

    expect(transfer?.getAttribute('aria-pressed')).toBe('true');
    expect(qris?.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText(/Dibayar dengan Transfer Bank/)).toBeTruthy();
  });
});

describe('Checkout saat membayar', () => {
  it('menyimpan pesanan per penjual, mengosongkan keranjang, dan membuka struk', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.click(await screen.findByText('Bayar Rp86.000'));

    expect(await screen.findByText('Pembayaran Berhasil', {}, { timeout: 3_000 })).toBeTruthy();
    expect(orderRepo.get()).toHaveLength(2);
    expect(cartRepo.get()).toEqual([]);
    expect(screen.getByText('Rp86.000')).toBeTruthy();
  });
});
