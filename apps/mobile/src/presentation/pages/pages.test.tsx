import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IonApp } from '@ionic/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from '../components/ShopProvider';
import { Splash, Login, Register, ForgotPassword } from './AuthPages';
import { Cart } from './Cart';

const renderAt = (path: string) =>
  render(
    <IonApp>
      <MemoryRouter initialEntries={[path]}>
        <ShopProvider>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/tabs/cart" element={<Cart />} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    </IonApp>,
  );

describe('render halaman dasar', () => {
  it('splash menampilkan nama aplikasi', async () => {
    renderAt('/');
    expect(await screen.findByText('Farmor')).toBeTruthy();
  });

  it('login menampilkan tautan lupa kata sandi', async () => {
    renderAt('/login');
    expect(await screen.findByText('Lupa kata sandi?')).toBeTruthy();
  });

  it('keranjang kosong menampilkan empty state', async () => {
    localStorage.clear();
    renderAt('/tabs/cart');
    expect(await screen.findByText('Keranjang masih kosong')).toBeTruthy();
  });
});
