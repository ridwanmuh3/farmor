import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../app/App';

/** Render seluruh App lewat router asli, untuk menangkap error wiring rute/tab. */
const renderAppAt = (path: string) => {
  localStorage.clear();
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('wiring aplikasi', () => {
  it('rute login merender form masuk', async () => {
    renderAppAt('/login');
    expect(await screen.findByText('Selamat Datang')).toBeTruthy();
  });

  it('rute /tabs/home merender tab pembeli tanpa error', async () => {
    renderAppAt('/tabs/home');
    expect(await screen.findByText(/Selamat (pagi|siang|sore|malam)/)).toBeTruthy();
  });

  it('rute /seller/dashboard merender dasbor penjual', async () => {
    renderAppAt('/seller/dashboard');
    expect(await screen.findByText('Aksi Cepat')).toBeTruthy();
  });
});
