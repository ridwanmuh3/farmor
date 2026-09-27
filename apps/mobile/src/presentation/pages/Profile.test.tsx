import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { Profile, SimpleInfo } from './Profile';

/**
 * Seam: halaman Profil dan halaman info statis seperti yang dilihat pengguna.
 * environment.demoMode aktif, jadi pemilih peran ikut teruji.
 */

const renderAt = (path: string, element = <Profile />) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path={path} element={element} />
            <Route path="/seller/*" element={<div>halaman penjual</div>} />
            <Route path="/orders" element={<div>halaman riwayat</div>} />
            <Route path="/addresses" element={<div>halaman alamat</div>} />
            <Route path="/login" element={<div>halaman masuk</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe('Profil', () => {
  it('menampilkan identitas dengan inisial nama', async () => {
    renderAt('/tabs/profile');

    expect(await screen.findByText('Ridwan Muh')).toBeTruthy();
    expect(screen.getByText('ridwan@farmor.id')).toBeTruthy();
    expect(screen.getByText('RM')).toBeTruthy();
    expect(screen.getByText('Pembeli ▾')).toBeTruthy();
  });

  it('membuka halaman dari menu', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/profile');

    await user.click(await screen.findByText('Riwayat Pesanan'));

    expect(await screen.findByText('halaman riwayat')).toBeTruthy();
  });

  it('membuka buku alamat dari menu', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/profile');

    await user.click(await screen.findByText('Alamat Pengiriman'));

    expect(await screen.findByText('halaman alamat')).toBeTruthy();
  });

  it('berpindah peran ke penjual lewat pemilih mode demo', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/profile');

    await user.click(await screen.findByLabelText('Ganti peran'));
    expect(screen.getByText('Mode demo: berpindah peran memuat akun contoh.')).toBeTruthy();

    await user.click(screen.getByText('Penjual'));

    expect(await screen.findByText('halaman penjual')).toBeTruthy();
  });

  it('keluar meminta konfirmasi lalu membawa ke halaman masuk', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/profile');

    await user.click(await screen.findByText('Keluar'));

    expect(await screen.findByText('Keluar dari akun?')).toBeTruthy();
    expect(screen.queryByText('halaman masuk')).toBeNull();

    await user.click(screen.getByText('Ya, Keluar'));

    expect(await screen.findByText('halaman masuk')).toBeTruthy();
  });

  it('batal pada konfirmasi keluar tetap di halaman profil', async () => {
    const user = userEvent.setup();
    renderAt('/tabs/profile');

    await user.click(await screen.findByText('Keluar'));
    await user.click(await screen.findByText('Batal'));

    expect(screen.queryByText('Keluar dari akun?')).toBeNull();
    expect(screen.getByText('ridwan@farmor.id')).toBeTruthy();
  });
});

describe('Halaman info statis', () => {
  it('menampilkan isi sesuai judul', async () => {
    renderAt('/help', <SimpleInfo title="Pusat Bantuan" />);

    expect(await screen.findByText('Pusat Bantuan')).toBeTruthy();
    expect(screen.getByText(/bantuan@farmor\.id/)).toBeTruthy();
  });

  it('menampilkan isi tentang aplikasi', async () => {
    renderAt('/about', <SimpleInfo title="Tentang Farmor" />);

    expect(await screen.findByText('Tentang Farmor')).toBeTruthy();
    expect(screen.getByText(/Farmor menghubungkan petani/)).toBeTruthy();
  });
});
