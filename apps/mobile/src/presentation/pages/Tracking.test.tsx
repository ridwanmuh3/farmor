import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { AddressBook, DeliveryTracking } from './Tracking';
import { cartRepo, orderRepo } from '../../data/repositories';
import { ADDRESSES } from '../../data/dto/catalog';

/**
 * Seam: halaman Lacak Pengiriman dan Buku Alamat seperti yang dilihat pengguna.
 */

const renderTracking = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/tracking/:id" element={<DeliveryTracking />} />
            <Route path="/orders" element={<div>halaman riwayat</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

const renderAddresses = () =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={['/addresses']}>
        <ShopProvider>
          <Routes>
            <Route path="/addresses" element={<AddressBook />} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

/** Buat satu pesanan nyata lewat jalur publik, bukan dengan menulis storage. */
const seedOrder = () => {
  cartRepo.setQty('p1', 2);
  return orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'qris').orders[0];
};

beforeEach(() => {
  localStorage.clear();
});

describe('Lacak pengiriman tanpa pesanan', () => {
  it('menampilkan ajakan ke riwayat', () => {
    renderTracking('/tracking/tidak-ada');

    expect(screen.getByText('Belum ada pengiriman untuk dilacak.')).toBeTruthy();
    expect(screen.getByText('Ke Riwayat')).toBeTruthy();
  });
});

describe('Lacak pengiriman', () => {
  it('menampilkan status dan estimasi tiba dari order', async () => {
    const order = seedOrder();
    renderTracking(`/tracking/${order.id}`);

    expect(await screen.findByText('Lacak Pengiriman')).toBeTruthy();
    expect(screen.getByText('Peta rute pengiriman')).toBeTruthy();
    // Status diturunkan dari order.status, bukan hardcode. Order baru berstatus 'dibayar'.
    expect(screen.getByText('Diproses')).toBeTruthy();
    expect(screen.queryByText('Budi Santoso · B 1234 XYZ')).toBeNull();
    expect(screen.getByText('Menunggu dikirim')).toBeTruthy();
  });

  it('menampilkan seluruh langkah perjalanan', async () => {
    const order = seedOrder();
    renderTracking(`/tracking/${order.id}`);

    expect(await screen.findByText('Riwayat Perjalanan')).toBeTruthy();
    expect(screen.getByText('Pesanan Dibayar')).toBeTruthy();
    expect(screen.getByText('Sedang Diproses')).toBeTruthy();
    expect(screen.getByText('Dikirim Kurir')).toBeTruthy();
    expect(screen.getByText('Pesanan Tiba')).toBeTruthy();
  });

  it('menyebut penjual dan alamat tujuan pada catatan langkah', async () => {
    const order = seedOrder();
    renderTracking(`/tracking/${order.id}`);

    expect(await screen.findByText('Pembayaran terverifikasi')).toBeTruthy();
    expect(screen.getByText('Tani Makmur menyiapkan pesanan')).toBeTruthy();
    expect(screen.getByText(ADDRESSES[0].line)).toBeTruthy();
  });
});

describe('Buku alamat', () => {
  it('menandai alamat utama', async () => {
    renderAddresses();

    expect(await screen.findByText('Alamat Pengiriman')).toBeTruthy();
    expect(screen.getByText('Rumah')).toBeTruthy();
    expect(screen.getByText('Kantor')).toBeTruthy();
    expect(screen.getByText('Utama').closest('.ff-card')?.textContent).toContain('Rumah');
  });

  it('memindahkan alamat utama saat memilih alamat lain', async () => {
    const user = userEvent.setup();
    renderAddresses();

    await screen.findByText('Kantor');
    await user.click(screen.getAllByText('Kirim ke Alamat Ini')[1]);

    expect(screen.getByText('Utama').closest('.ff-card')?.textContent).toContain('Kantor');
  });

  it('mengunci simpan sampai label, penerima, nomor HP, dan alamat terisi', async () => {
    const user = userEvent.setup();
    renderAddresses();

    const save = (await screen.findByText('Simpan Alamat')).closest('button');
    expect(save?.disabled).toBe(true);

    await user.type(screen.getByLabelText('Label'), 'Rumah Baru');
    expect((screen.getByText('Simpan Alamat').closest('button') as HTMLButtonElement).disabled).toBe(true);

    await user.type(screen.getByLabelText('Nama Penerima'), 'Siti');
    await user.type(screen.getByLabelText('Alamat Lengkap'), 'Jl. Baru No. 1');
    // nomor HP belum diisi, jadi masih terkunci
    expect((screen.getByText('Simpan Alamat').closest('button') as HTMLButtonElement).disabled).toBe(true);

    await user.type(screen.getByLabelText('Nomor HP'), '081234567890');

    expect((screen.getByText('Simpan Alamat').closest('button') as HTMLButtonElement).disabled).toBe(false);
  });

  it('menolak nomor HP yang tidak valid', async () => {
    const user = userEvent.setup();
    renderAddresses();

    await screen.findByText('Simpan Alamat');
    await user.type(screen.getByLabelText('Nomor HP'), 'bukan-nomor');

    expect(screen.getByText('Nomor HP wajib diisi, contoh 081234567890.')).toBeTruthy();
    expect((screen.getByText('Simpan Alamat').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('menyimpan alamat baru ke daftar', async () => {
    const user = userEvent.setup();
    renderAddresses();

    await screen.findByText('Simpan Alamat');
    await user.type(screen.getByLabelText('Label'), 'Rumah Baru');
    await user.type(screen.getByLabelText('Nama Penerima'), 'Siti');
    await user.type(screen.getByLabelText('Nomor HP'), '0899000111');
    await user.type(screen.getByLabelText('Alamat Lengkap'), 'Jl. Baru No. 1');
    await user.click(screen.getByText('Simpan Alamat'));

    expect(await screen.findByText('Alamat Tersimpan ✓')).toBeTruthy();
    expect(screen.getByText('Rumah Baru')).toBeTruthy();
    expect(screen.getByText('Siti · 0899000111')).toBeTruthy();
  });
});
