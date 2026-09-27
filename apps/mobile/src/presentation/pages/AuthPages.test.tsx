import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { ForgotPassword, Login, Onboarding, Register, Splash } from './AuthPages';

/**
 * Seam: halaman alur masuk seperti yang dilihat dan dioperasikan pengguna.
 */

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/tabs/home" element={<div>halaman beranda</div>} />
            <Route path="/seller/*" element={<div>halaman penjual</div>} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe('Splash', () => {
  it('menampilkan identitas aplikasi dan lanjut ke onboarding', async () => {
    const user = userEvent.setup();
    renderAt('/');

    expect(await screen.findByText('Farmor')).toBeTruthy();
    expect(screen.getByText('Pasar Tani Langsung')).toBeTruthy();
    expect(screen.getByText(/Segar dari Ladang ke Meja Anda/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Mulai' }));

    expect(await screen.findByText('Langsung dari Petani ke Anda')).toBeTruthy();
  });
});

describe('Onboarding', () => {
  it('berpindah slide sampai slide terakhir', async () => {
    const user = userEvent.setup();
    renderAt('/onboarding');

    expect(await screen.findByText('Langsung dari Petani ke Anda')).toBeTruthy();
    expect(
      screen.getByText(/Dapatkan hasil panen segar langsung dari petani lokal terpercaya/),
    ).toBeTruthy();

    await user.click(screen.getByText('Selanjutnya'));
    expect(screen.getByText('Harga Langsung dari Petani')).toBeTruthy();

    await user.click(screen.getByText('Selanjutnya'));
    expect(screen.getByText('Bayar Aman, Lacak Mudah')).toBeTruthy();
    expect(screen.getByText('Daftar Sekarang')).toBeTruthy();
  });

  it('slide terakhir membawa ke pendaftaran', async () => {
    const user = userEvent.setup();
    renderAt('/onboarding');

    await screen.findByText('Langsung dari Petani ke Anda');
    await user.click(screen.getByText('Selanjutnya'));
    await user.click(screen.getByText('Selanjutnya'));
    await user.click(screen.getByText('Daftar Sekarang'));

    expect(await screen.findByText('Daftar Akun Baru')).toBeTruthy();
  });

  it('tombol lewati membawa ke halaman masuk', async () => {
    const user = userEvent.setup();
    renderAt('/onboarding');

    await user.click(await screen.findByText('Lewati'));

    expect(await screen.findByText('Selamat Datang')).toBeTruthy();
  });
});

describe('Masuk', () => {
  // Email tidak valid sudah ditahan validasi bawaan input type="email",
  // jadi aturan milik aplikasi yang diuji di sini adalah panjang kata sandi.
  it('menolak kata sandi yang kurang dari 6 karakter', async () => {
    const user = userEvent.setup();
    renderAt('/login');

    await user.type(await screen.findByLabelText('Email'), 'ridwan@farmor.id');
    await user.type(screen.getByLabelText('Kata Sandi'), '123');
    await user.click(screen.getByText('Masuk Sekarang'));

    expect(screen.getByText('Kata sandi minimal 6 karakter.')).toBeTruthy();
    expect(screen.queryByText('halaman beranda')).toBeNull();
  });

  it('masuk dengan data valid menuju beranda', async () => {
    const user = userEvent.setup();
    renderAt('/login');

    await user.type(await screen.findByLabelText('Email'), 'ridwan@farmor.id');
    await user.type(screen.getByLabelText('Kata Sandi'), 'rahasia123');
    await user.click(screen.getByText('Masuk Sekarang'));

    expect(await screen.findByText('halaman beranda')).toBeTruthy();
  });

  it('membuka lupa kata sandi', async () => {
    const user = userEvent.setup();
    renderAt('/login');

    await user.click(await screen.findByText('Lupa Kata Sandi?'));

    expect(await screen.findByText('Lupa Kata Sandi')).toBeTruthy();
  });
});

describe('Daftar', () => {
  it('memilih peran penjual atau pembeli', async () => {
    const user = userEvent.setup();
    renderAt('/register');

    expect(await screen.findByText('Saya Petani')).toBeTruthy();
    expect(screen.getByText('Saya Pembeli')).toBeTruthy();

    await user.click(screen.getByText('Saya Pembeli'));

    expect(screen.getByText('Saya Pembeli').closest('button')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('menolak data yang belum lengkap', async () => {
    const user = userEvent.setup();
    renderAt('/register');

    await user.type(await screen.findByLabelText('Email'), 'baru@farmor.id');
    await user.click(screen.getByText('Daftar Sekarang'));

    expect(
      screen.getByText('Isi nama lengkap. Masukkan nomor HP yang valid. Kata sandi minimal 6 karakter.'),
    ).toBeTruthy();
  });

  it('menolak nomor HP yang tidak valid', async () => {
    const user = userEvent.setup();
    renderAt('/register');

    await user.type(await screen.findByLabelText('Nama Lengkap'), 'Siti Aminah');
    await user.type(screen.getByLabelText('Nomor Telepon'), '12');
    await user.type(screen.getByLabelText('Email'), 'siti@farmor.id');
    await user.type(screen.getByLabelText('Kata Sandi'), 'rahasia123');
    await user.click(screen.getByText('Daftar Sekarang'));

    expect(screen.getByText('Masukkan nomor HP yang valid.')).toBeTruthy();
    expect(screen.queryByText('halaman beranda')).toBeNull();
  });

  it('mewajibkan syarat dan ketentuan disetujui', async () => {
    const user = userEvent.setup();
    renderAt('/register');

    await user.type(await screen.findByLabelText('Nama Lengkap'), 'Siti Aminah');
    await user.type(screen.getByLabelText('Nomor Telepon'), '081234567890');
    await user.type(screen.getByLabelText('Email'), 'siti@farmor.id');
    await user.type(screen.getByLabelText('Kata Sandi'), 'rahasia123');
    await user.click(screen.getByText('Daftar Sekarang'));

    expect(screen.getByText('Centang kotak persetujuan untuk melanjutkan.')).toBeTruthy();
  });

  it('mendaftar sebagai pembeli menuju beranda', async () => {
    const user = userEvent.setup();
    renderAt('/register');

    await user.click(await screen.findByText('Saya Pembeli'));
    await user.type(screen.getByLabelText('Nama Lengkap'), 'Siti Aminah');
    await user.type(screen.getByLabelText('Nomor Telepon'), '081234567890');
    await user.type(screen.getByLabelText('Email'), 'siti@farmor.id');
    await user.type(screen.getByLabelText('Kata Sandi'), 'rahasia123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Daftar Sekarang'));

    expect(await screen.findByText('halaman beranda')).toBeTruthy();
  });

  it('mendaftar sebagai penjual menuju dasbor penjual', async () => {
    const user = userEvent.setup();
    renderAt('/register');

    await screen.findByText('Saya Petani');
    await user.type(screen.getByLabelText('Nama Lengkap'), 'Tani Baru');
    await user.type(screen.getByLabelText('Nomor Telepon'), '081234567890');
    await user.type(screen.getByLabelText('Email'), 'tani@farmor.id');
    await user.type(screen.getByLabelText('Kata Sandi'), 'rahasia123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Daftar Sekarang'));

    expect(await screen.findByText('halaman penjual')).toBeTruthy();
  });
});

describe('Lupa kata sandi', () => {
  it('mengunci tombol kirim sampai email valid', async () => {
    const user = userEvent.setup();
    renderAt('/forgot');

    const submit = (await screen.findByText('Kirim Tautan')).closest('button');
    expect(submit?.disabled).toBe(true);

    await user.type(screen.getByLabelText('Email'), 'ridwan@farmor.id');

    expect((screen.getByText('Kirim Tautan').closest('button') as HTMLButtonElement).disabled).toBe(false);
  });

  it('mengonfirmasi tautan terkirim dan bisa kembali masuk', async () => {
    const user = userEvent.setup();
    renderAt('/forgot');

    await user.type(await screen.findByLabelText('Email'), 'ridwan@farmor.id');
    await user.click(screen.getByText('Kirim Tautan'));

    expect(await screen.findByText('Tautan terkirim')).toBeTruthy();
    expect(screen.getByText(/Cek kotak masuk ridwan@farmor\.id/)).toBeTruthy();

    await user.click(screen.getByText('Kembali ke Masuk'));

    expect(await screen.findByText('Selamat Datang')).toBeTruthy();
  });
});
