import { describe, expect, it } from 'vitest';
import {
  canCheckout,
  cartQuantity,
  isSoldOut,
  nextStock,
  statusAfterSellerAccepts,
  statusAfterSellerRejects,
} from './inventory';

describe('nextStock', () => {
  it('mengurangi stok dengan jumlah yang sudah dipesan', () => {
    expect(nextStock(10, 3, 2)).toBe(5);
  });

  it('tidak pernah negatif', () => {
    expect(nextStock(2, 5, 5)).toBe(0);
  });
});

describe('cartQuantity', () => {
  it('menjumlahkan qty semua baris', () => {
    expect(cartQuantity([{ qty: 2 }, { qty: 3 }])).toBe(5);
    expect(cartQuantity([])).toBe(0);
  });
});

describe('isSoldOut', () => {
  it('habis saat stok nol atau negatif', () => {
    expect(isSoldOut(0)).toBe(true);
    expect(isSoldOut(-1)).toBe(true);
    expect(isSoldOut(1)).toBe(false);
  });
});

describe('canCheckout', () => {
  it('boleh checkout hanya kalau stok cukup dan qty valid', () => {
    expect(canCheckout(5, 3)).toBe(true);
    expect(canCheckout(5, 5)).toBe(true);
    expect(canCheckout(5, 6)).toBe(false);
    expect(canCheckout(0, 1)).toBe(false);
    expect(canCheckout(5, 0)).toBe(false);
  });
});

describe('transisi status penjual', () => {
  it('terima jadi diproses, tolak jadi dibatalkan', () => {
    expect(statusAfterSellerAccepts()).toBe('diproses');
    expect(statusAfterSellerRejects()).toBe('dibatalkan');
  });
});
