import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { Explore, Home } from './BuyerHome';

/**
 * Seam: halaman Beranda dan Jelajah seperti yang dilihat dan dioperasikan pengguna.
 * Katalog punya 12 produk.
 */

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/tabs/home" element={<Home />} />
            <Route path="/tabs/explore" element={<Explore />} />
            <Route path="/notifications" element={<div>halaman notifikasi</div>} />
            <Route path="/tabs/cart" element={<div>halaman keranjang</div>} />
            <Route path="/product/:id" element={<div>halaman produk</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe('Beranda', () => {
  it('menyapa pengguna dan menampilkan promo', async () => {
    renderAt('/tabs/home');

    expect(await screen.findByText('Ridwan Muh')).toBeTruthy();
    expect(screen.getByText(/Selamat (pagi|siang|sore|malam),/)).toBeTruthy();
    expect(screen.getByText('Diskon 10% Semua Produk')).toBeTruthy();
    expect(screen.getByText('PANEN10')).toBeTruthy();
  });

  it('menampilkan produk populer terbatas', async () => {
    renderAt('/tabs/home');

    expect(await screen.findByText('Produk Populer')).toBeTruthy();
    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getByText('Tomat Merah')).toBeTruthy();
    // katalog punya 12 produk, beranda hanya menampilkan 4
    expect(screen.queryByText('Telur Ayam Kampung')).toBeNull();
  });

  it('mencari produk lewat kata kunci', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/home');

    await user.type(await screen.findByLabelText('Cari produk'), 'telur');

    expect(screen.getByText('Telur Ayam Kampung')).toBeTruthy();
    expect(screen.queryByText('Wortel Organik Segar')).toBeNull();
  });

  it('menampilkan empty state saat kata kunci tidak cocok', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/home');

    await user.type(await screen.findByLabelText('Cari produk'), 'zzz');

    expect(screen.getByText('Tidak ada produk')).toBeTruthy();
  });

  it('menyaring produk lewat chip kategori', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/home');

    await user.click(await screen.findByText('Buah'));

    expect(screen.getByText('Mangga Harum Manis')).toBeTruthy();
    expect(screen.queryByText('Wortel Organik Segar')).toBeNull();
  });

  it('membuka notifikasi', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/home');

    await user.click(await screen.findByLabelText('Notifikasi'));
    expect(await screen.findByText('halaman notifikasi')).toBeTruthy();
  });

  it('menampilkan nama penjual dan rating pada kartu produk', async () => {
    renderAt('/tabs/home');

    expect(await screen.findByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.getAllByText('Pak Harto').length).toBeGreaterThan(0);
  });
});

describe('Jelajah', () => {
  it('menampilkan judul kategori dan urutan sortir', async () => {
    renderAt('/tabs/explore');

    expect(await screen.findByText('Sayuran Segar')).toBeTruthy();
    expect(screen.getByText('Terlaris')).toBeTruthy();
    expect(screen.getByText('Harga Terendah')).toBeTruthy();
    expect(screen.getByText('Organik')).toBeTruthy();
    expect(screen.getByText('Telur Ayam Kampung')).toBeTruthy();
  });

  it('mengurutkan produk dari yang terlaris secara bawaan', async () => {
    renderAt('/tabs/explore');

    const names = await screen.findAllByRole('button');
    const labels = names.map((b) => b.textContent ?? '');
    expect(labels.findIndex((t) => t.includes('Kangkung'))).toBeLessThan(
      labels.findIndex((t) => t.includes('Kentang Dieng')),
    );
  });

  it('mengurutkan produk dari harga terendah', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/explore');

    await user.click(await screen.findByText('Harga Terendah'));

    const labels = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    expect(labels.findIndex((t) => t.includes('Kangkung'))).toBeLessThan(
      labels.findIndex((t) => t.includes('Daging Sapi')),
    );
  });

  it('menyaring hanya produk organik', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/explore');

    await user.click(await screen.findByText('Organik'));

    expect(screen.getByText('Wortel Organik Segar')).toBeTruthy();
    expect(screen.queryByText('Kentang Dieng')).toBeNull();
  });

  it('membuka detail produk dari kartu', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/explore');

    await user.click(await screen.findByText('Kentang Dieng'));

    expect(await screen.findByText('halaman produk')).toBeTruthy();
  });
});
