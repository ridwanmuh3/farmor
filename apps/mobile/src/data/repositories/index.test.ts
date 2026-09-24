import { beforeEach, describe, expect, it } from 'vitest';
import { cartRepo, orderRepo, productRepo, wishlistRepo } from './index';
import { ADDRESSES } from '../dto/catalog';

/** Uji alur uang + stok lewat repo, tanpa React. */
describe('checkout lewat orderRepo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('membuat satu pesanan per penjual dan mengosongkan keranjang', () => {
    cartRepo.setQty('p1', 2); // seller s1
    cartRepo.setQty('p9', 1); // seller s3

    const result = orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'qris');

    expect(result.orders).toHaveLength(2);
    expect(result.orders.every((o) => o.groupId === result.groupId)).toBe(true);
    expect(result.orders.every((o) => o.status === 'dibayar')).toBe(true);
    expect(orderRepo.get()).toHaveLength(2);
    expect(cartRepo.get()).toEqual([]);
  });

  it('mengurangi stok produk saat pesanan dibuat', () => {
    const before = productRepo.byId('p1')!.stock;
    cartRepo.setQty('p1', 3);

    orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'transfer_bank');

    expect(productRepo.byId('p1')!.stock).toBe(before - 3);
  });

  it('tidak pernah membuat stok negatif', () => {
    cartRepo.setQty('p1', 999);

    orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'emoney');

    expect(productRepo.byId('p1')!.stock).toBe(0);
  });

  it('menerapkan diskon ke total pesanan', () => {
    cartRepo.setQty('p1', 2);

    const result = orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'qris', 5_000);

    expect(result.orders[0].discount).toBe(5_000);
    expect(result.orders[0].subtotal).toBe(24_000);
  });

  it('status pesanan bisa diubah penjual', () => {
    cartRepo.setQty('p1', 1);
    const [order] = orderRepo.checkout(cartRepo.get(), ADDRESSES[0], 'qris').orders;

    orderRepo.setStatus(order.id, 'dikirim');

    expect(orderRepo.byId(order.id)!.status).toBe('dikirim');
  });
});

describe('wishlist lewat repo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('menambah lalu menghapus produk favorit', () => {
    expect(wishlistRepo.has('p1')).toBe(false);

    wishlistRepo.toggle('p1');
    expect(wishlistRepo.has('p1')).toBe(true);
    expect(wishlistRepo.get()).toEqual(['p1']);

    wishlistRepo.toggle('p1');
    expect(wishlistRepo.has('p1')).toBe(false);
    expect(wishlistRepo.get()).toEqual([]);
  });

  it('produk terbaru ditaruh di depan', () => {
    wishlistRepo.toggle('p1');
    wishlistRepo.toggle('p2');
    expect(wishlistRepo.get()).toEqual(['p2', 'p1']);
  });
});
