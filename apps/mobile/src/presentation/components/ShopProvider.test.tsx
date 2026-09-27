import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import type { Order } from '../../core/entities/types';
import { ShopProvider, useShop } from './ShopProvider';

/**
 * Seam: useShop(), the interface every page talks to.
 * Diuji lewat provider asli, bukan dengan menembus state internal.
 */
const wrapper = ({ children }: { children: ReactNode }) => <ShopProvider>{children}</ShopProvider>;

const setup = () => renderHook(() => useShop(), { wrapper });

beforeEach(() => {
  localStorage.clear();
});

describe('keranjang di useShop', () => {
  it('menambah item dan menghitung cartCount', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 2));
    act(() => result.current.addToCart('p2', 1));

    expect(result.current.cart).toHaveLength(2);
    expect(result.current.cartCount).toBe(3);
  });

  it('addToCart menambah qty kalau produk sudah ada di keranjang', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 2));
    act(() => result.current.addToCart('p1', 3));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cartCount).toBe(5);
  });

  it('setQty 0 menghapus item dari keranjang', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 2));
    act(() => result.current.setQty('p1', 0));

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
  });

  it('removeFromCart menghapus item tanpa menyentuh item lain', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 2));
    act(() => result.current.addToCart('p2', 1));
    act(() => result.current.removeFromCart('p1'));

    expect(result.current.cart.map((i) => i.productId)).toEqual(['p2']);
  });
});

describe('promo di useShop', () => {
  it('diskon mengikuti subtotal keranjang saat keranjang bertambah', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 1)); // 12.000
    act(() => {
      expect(result.current.applyPromo('PANEN10')).toBe(true);
    });
    expect(result.current.discount).toBe(1_200);

    act(() => result.current.addToCart('p1', 4)); // 60.000

    expect(result.current.promo).toBe('PANEN10');
    expect(result.current.discount).toBe(6_000);
  });

  it('diskon mengikuti subtotal keranjang saat keranjang menyusut', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 5)); // 60.000
    act(() => {
      result.current.applyPromo('PANEN10');
    });
    expect(result.current.discount).toBe(6_000);

    act(() => result.current.setQty('p1', 1)); // 12.000

    expect(result.current.discount).toBe(1_200);
  });

  it('kode tidak dikenal ditolak dan tidak memberi diskon', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 1));
    let accepted = true;
    act(() => {
      accepted = result.current.applyPromo('bukan-kode');
    });

    expect(accepted).toBe(false);
    expect(result.current.promo).toBe('');
    expect(result.current.discount).toBe(0);
  });

  it('kode promo tidak peka huruf besar-kecil dan spasi tepi', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 1));
    act(() => {
      expect(result.current.applyPromo('  panen10 ')).toBe(true);
    });

    expect(result.current.promo).toBe('PANEN10');
    expect(result.current.discount).toBe(1_200);
  });

  it('removePromo menghapus diskon', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 1));
    act(() => {
      result.current.applyPromo('PANEN10');
    });
    expect(result.current.discount).toBeGreaterThan(0);

    act(() => result.current.removePromo());

    expect(result.current.promo).toBe('');
    expect(result.current.discount).toBe(0);
  });

  it('tanpa promo diskon selalu nol', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 5));

    expect(result.current.discount).toBe(0);
  });
});

describe('checkout di useShop', () => {
  it('membuat pesanan, mengosongkan keranjang, dan mereset promo', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 2)); // s1
    act(() => result.current.addToCart('p9', 1)); // s3
    act(() => {
      result.current.applyPromo('PANEN10');
    });

    let created: Order[] = [];
    act(() => {
      created = result.current.checkout('qris');
    });

    expect(created).toHaveLength(2);
    expect(result.current.orders).toHaveLength(2);
    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.promo).toBe('');
    expect(result.current.discount).toBe(0);
  });

  it('membebankan diskon promo ke pesanan yang dibuat', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 5)); // 60.000, satu penjual
    act(() => {
      result.current.applyPromo('PANEN10');
    });

    let created: Order[] = [];
    act(() => {
      created = result.current.checkout('qris');
    });

    expect(created[0].subtotal).toBe(60_000);
    expect(created[0].discount).toBe(6_000);
  });

  it('diskon tidak pernah menutupi seluruh belanja walau keranjang menyusut setelah promo dipakai', () => {
    const { result } = setup();

    act(() => result.current.addToCart('p1', 5)); // 60.000
    act(() => {
      result.current.applyPromo('PANEN10'); // diskon lama 6.000
    });
    act(() => result.current.removeFromCart('p1'));
    act(() => result.current.addToCart('p6', 1)); // 5.000, lebih kecil dari diskon lama

    let created: Order[] = [];
    act(() => {
      created = result.current.checkout('qris');
    });

    expect(created[0].subtotal).toBe(5_000);
    expect(created[0].discount).toBe(500);
    expect(created[0].discount).toBeLessThan(created[0].subtotal);
  });
});
