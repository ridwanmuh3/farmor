import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { OrderDetail, OrderHistory } from './OrderHistory';
import { cartRepo, orderRepo } from '../../data/repositories';
import { ADDRESSES } from '../../data/dto/catalog';

/**
 * Seam: halaman Riwayat Pesanan dan Detail Pesanan seperti yang dilihat pengguna.
 * p1 x2 (12.000, penjual s1) -> subtotal 24.000 + ongkir 15.000 = 39.000
 * p9 x1 (32.000, penjual s3) -> subtotal 32.000 + ongkir 15.000 = 47.000
 */

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/tracking/:id" element={<div>halaman lacak</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

/** Buat pesanan nyata lewat jalur publik, bukan dengan menulis storage. */
const seedOrder = (productId: string, qty: number, discount = 0) => {
  cartRepo.setQty(productId, qty);
  return orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'qris', discount).orders[0];
};

beforeEach(() => {
  localStorage.clear();
});

describe('Riwayat pesanan kosong', () => {
  it('menampilkan empty state', async () => {
    renderAt('/orders');

    expect(await screen.findByText('Belum ada pesanan')).toBeTruthy();
  });
});

describe('Riwayat pesanan', () => {
  it('menampilkan penjual, nota, status, dan total', async () => {
    seedOrder('p1', 2);
    renderAt('/orders');

    const card = (await screen.findByText('Tani Makmur')).closest('.ff-card');
    expect(card?.textContent).toContain('INV/');
    expect(card?.textContent).toContain('Diproses');
    expect(screen.getByText('Wortel Organik Segar × 2 kg')).toBeTruthy();
    expect(screen.getByText('Rp39.000')).toBeTruthy();
  });

  it('menyaring daftar lewat tab status', async () => {
    const user = userEvent.setup();
    // groupId berasal dari Date.now(); dua checkout dalam milidetik yang sama
    // akan bertabrakan id-nya, jadi waktu digeser supaya tiap pesanan unik.
    let tick = 1_700_000_000_000;
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => (tick += 1_000));
    const paid = seedOrder('p1', 2); // s1
    const shipped = seedOrder('p9', 1); // s3
    clock.mockRestore();

    expect(paid.id).not.toBe(shipped.id);
    orderRepo.setStatus(shipped.id, 'dikirim');
    renderAt('/orders');

    expect(await screen.findByText('Tani Makmur')).toBeTruthy();
    expect(screen.getByText('Ternak Jaya')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Dikirim' }));

    expect(screen.queryByText('Tani Makmur')).toBeNull();
    expect(screen.getByText('Ternak Jaya')).toBeTruthy();
  });

  it('membuka halaman lacak pengiriman', async () => {
    const user = userEvent.setup();
    seedOrder('p1', 2);
    renderAt('/orders');

    await user.click(await screen.findByText('Lacak'));

    expect(await screen.findByText('halaman lacak')).toBeTruthy();
  });

  it('membuka detail pesanan yang belum dikirim', async () => {
    const user = userEvent.setup();
    seedOrder('p1', 2);
    renderAt('/orders');

    await user.click(await screen.findByText('Detail'));

    expect(await screen.findByText('Detail Pesanan')).toBeTruthy();
  });

  it('menandai pesanan dikirim sebagai selesai setelah konfirmasi', async () => {
    const user = userEvent.setup();
    const order = seedOrder('p1', 2);
    orderRepo.setStatus(order.id, 'dikirim');
    renderAt('/orders');

    const card = (await screen.findByText('Tani Makmur')).closest('.ff-card');
    expect(card?.textContent).toContain('Dikirim');

    await user.click(screen.getByText('Pesanan Diterima'));
    expect(await screen.findByText('Pesanan sudah diterima?')).toBeTruthy();

    await user.click(screen.getByText('Ya, Diterima'));

    expect(screen.getByText('Tani Makmur').closest('.ff-card')?.textContent).toContain('Selesai');
  });
});

describe('Detail pesanan', () => {
  it('menampilkan pesan saat pesanan tidak ada', () => {
    renderAt('/orders/tidak-ada');

    expect(screen.getByText('Pesanan tidak ditemukan')).toBeTruthy();
    expect(screen.getByText('Ke Riwayat')).toBeTruthy();
  });

  it('menampilkan produk, pengiriman, dan rincian pembayaran', async () => {
    const order = seedOrder('p1', 2);
    renderAt(`/orders/${order.id}`);

    expect(await screen.findByText('Detail Pesanan')).toBeTruthy();
    expect(screen.getByText('Produk')).toBeTruthy();
    expect(screen.getByText('Pengiriman')).toBeTruthy();
    expect(screen.getByText('Pembayaran')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar × 2 kg')).toBeTruthy();
    expect(screen.getByText('Ridwan Muh · 08123456789')).toBeTruthy();
    expect(screen.getByText(ADDRESSES[0].line)).toBeTruthy();
    expect(screen.getByText(`Catatan: ${ADDRESSES[0].note}`)).toBeTruthy();
    // baris produk dan baris subtotal sama-sama Rp24.000
    expect(screen.getAllByText('Rp24.000')).toHaveLength(2);
    expect(screen.getByText('Rp15.000')).toBeTruthy();
    expect(screen.getByText('Rp39.000')).toBeTruthy();
  });

  it('menampilkan baris diskon hanya kalau ada potongan', async () => {
    const order = seedOrder('p1', 2, 5_000);
    renderAt(`/orders/${order.id}`);

    expect(await screen.findByText('Diskon')).toBeTruthy();
    expect(screen.getByText('-Rp5.000')).toBeTruthy();
    expect(screen.getByText('Rp34.000')).toBeTruthy();
  });

  it('menawarkan penerimaan hanya saat pesanan dikirim', async () => {
    const order = seedOrder('p1', 2);
    orderRepo.setStatus(order.id, 'dikirim');
    renderAt(`/orders/${order.id}`);

    expect(await screen.findByText('Lacak Pengiriman')).toBeTruthy();
    expect(screen.getByText('Pesanan Diterima')).toBeTruthy();
  });
});
