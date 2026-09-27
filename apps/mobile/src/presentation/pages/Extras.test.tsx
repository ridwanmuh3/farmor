import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { ChatTeaser, Notifications, Wishlist } from './Extras';
import { cartRepo, chatRepo, wishlistRepo } from '../../data/repositories';

/**
 * Seam: halaman Notifikasi, Produk Favorit, dan Chat seperti yang dilihat pengguna.
 */

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/chat" element={<ChatTeaser />} />
            <Route path="/tabs/home" element={<div>halaman beranda</div>} />
            <Route path="/product/:id" element={<div>halaman produk</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe('Notifikasi', () => {
  it('menampilkan daftar kabar pesanan dan promo per hari', async () => {
    renderAt('/notifications');

    expect(await screen.findByText('Hari Ini')).toBeTruthy();
    expect(screen.getByText('Kemarin')).toBeTruthy();
    expect(screen.getByText('Status Pengiriman')).toBeTruthy();
    expect(screen.getByText('Promo Spesial')).toBeTruthy();
    expect(screen.getByText('Flash Sale! Diskon 30% sayuran organik hari ini saja.')).toBeTruthy();
  });

  it('menandai semua dibaca lalu menampilkan empty state', async () => {
    const user = userEvent.setup();
    renderAt('/notifications');

    await user.click(await screen.findByText('Tandai Dibaca'));

    expect(screen.getByText('Tidak ada notifikasi')).toBeTruthy();
    expect(screen.queryByText('Promo Spesial')).toBeNull();
    expect(screen.queryByText('Tandai Dibaca')).toBeNull();
  });
});

describe('Produk favorit', () => {
  it('menampilkan empty state saat belum ada favorit', async () => {
    renderAt('/wishlist');

    expect(await screen.findByText('Belum ada favorit')).toBeTruthy();
  });

  it('menampilkan produk yang disimpan beserta jumlah di keranjang', async () => {
    wishlistRepo.toggle('p1');
    cartRepo.setQty('p1', 2);
    renderAt('/wishlist');

    expect(await screen.findByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Pak Harto')).toBeTruthy();
    expect(screen.getByText('1 produk sudah di keranjang. Tekan hati untuk mengubah favorit.')).toBeTruthy();
  });

  it('melepas favorit dari daftar', async () => {
    const user = userEvent.setup();
    wishlistRepo.toggle('p1');
    renderAt('/wishlist');

    await user.click(await screen.findByLabelText('Hapus Wortel Organik Segar dari favorit'));

    expect(screen.getByText('Belum ada favorit')).toBeTruthy();
    expect(wishlistRepo.has('p1')).toBe(false);
  });

  it('tombol tambah pada kartu produk mengisi keranjang', async () => {
    const user = userEvent.setup();
    wishlistRepo.toggle('p1');
    renderAt('/wishlist');

    await user.click(await screen.findByLabelText('Tambah Wortel Organik Segar ke keranjang'));

    expect(cartRepo.get()).toEqual([{ productId: 'p1', qty: 1 }]);
  });
});

describe('Chat penjual', () => {
  it('menampilkan percakapan dan kartu tawaran', async () => {
    renderAt('/chat');

    expect(await screen.findByText('Pak Harto (Tani Makmur)')).toBeTruthy();
    expect(screen.getByText('● Online')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Tawarkan')).toBeTruthy();
    expect(screen.getByText(/Selamat pagi mas Budi/)).toBeTruthy();
    expect(screen.getByText('08:30')).toBeTruthy();
  });

  it('menampilkan pesan terkirim dari penyimpanan sebelumnya', () => {
    chatRepo.append(chatRepo.get(), { from: 'me', text: 'Pesan dari sesi sebelumnya.' });
    renderAt('/chat');

    expect(screen.getByText('Pesan dari sesi sebelumnya.')).toBeTruthy();
  });

  it('tombol tawar memasukkan produk ke keranjang', async () => {
    const user = userEvent.setup();
    renderAt('/chat');

    await user.click(await screen.findByText('Tawarkan'));

    expect(cartRepo.get()).toEqual([{ productId: 'p1', qty: 1 }]);
    expect(screen.getByText('Wortel Organik Segar masuk keranjang.')).toBeTruthy();
  });

  it('lampiran memberi tahu fitur belum tersedia', async () => {
    const user = userEvent.setup();
    renderAt('/chat');

    await user.click(await screen.findByLabelText('Lampirkan foto'));

    expect(screen.getByText('Lampiran foto belum tersedia. Tulis saja pesannya.')).toBeTruthy();
  });

  it('mengirim pesan baru ke percakapan', async () => {
    const user = userEvent.setup();
    renderAt('/chat');

    await user.type(await screen.findByLabelText('Ketik pesan'), 'Baik Pak, ditunggu ya.');
    await user.click(screen.getByLabelText('Kirim pesan'));

    expect(screen.getByText('Baik Pak, ditunggu ya.')).toBeTruthy();
    // stempel waktu pesan baru dihitung dari jam device, bukan angka tetap
    const now = new Date();
    const stamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    expect(screen.getByText(stamp)).toBeTruthy();
  });
});
