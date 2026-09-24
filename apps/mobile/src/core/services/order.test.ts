import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SHIPPING,
  buildOrders,
  clampQty,
  grandTotal,
  groupBySeller,
  maxQty,
  splitDiscount,
  subtotal,
} from './order';
import type { Address, CartItem, Product } from '../entities/types';

const makeProduct = (id: string, sellerId: string, price: number, stock = 10): Product => ({
  id,
  sellerId,
  name: `Produk ${id}`,
  category: 'Sayuran',
  price,
  unit: 'kg',
  stock,
  weightGram: 1000,
  organic: false,
  image: `/p-${id}.jpg`,
  description: 'deskripsi',
  sold: 0,
});

const PRODUCTS: Product[] = [
  makeProduct('p1', 's1', 10_000),
  makeProduct('p2', 's1', 5_000),
  makeProduct('p3', 's2', 20_000),
];

const SELLERS = [
  { id: 's1', name: 'Tani Makmur', city: 'Lembang' },
  { id: 's2', name: 'Sayur Berkah', city: 'Cianjur' },
];

const ADDRESS: Address = {
  id: 'a1',
  label: 'Rumah',
  recipient: 'Ridwan',
  phone: '0812',
  line: 'Jl. Test 1',
};

const cart: CartItem[] = [
  { productId: 'p1', qty: 2 },
  { productId: 'p2', qty: 1 },
  { productId: 'p3', qty: 3 },
];

describe('groupBySeller', () => {
  it('mengelompokkan item per penjual', () => {
    const groups = groupBySeller(cart, PRODUCTS);
    expect([...groups.keys()]).toEqual(['s1', 's2']);
    expect(groups.get('s1')).toHaveLength(2);
    expect(groups.get('s2')).toHaveLength(1);
  });

  it('mengabaikan produk tidak dikenal dan qty <= 0', () => {
    const groups = groupBySeller(
      [
        { productId: 'p1', qty: 1 },
        { productId: 'hilang', qty: 5 },
        { productId: 'p2', qty: 0 },
      ],
      PRODUCTS,
    );
    expect([...groups.keys()]).toEqual(['s1']);
    expect(groups.get('s1')).toHaveLength(1);
  });
});

describe('clampQty', () => {
  it('menahan qty minimal 1', () => {
    expect(clampQty(0, 10)).toBe(1);
    expect(clampQty(-4, 10)).toBe(1);
  });

  it('tidak boleh melebihi stok', () => {
    expect(clampQty(99, 5)).toBe(5);
  });

  it('membulatkan pecahan dan menangani NaN', () => {
    expect(clampQty(2.9, 10)).toBe(2);
    expect(clampQty(Number.NaN, 10)).toBe(1);
  });
});

describe('maxQty', () => {
  it('membatasi jumlah pada stok dan tidak negatif', () => {
    expect(maxQty(5, 3)).toBe(3);
    expect(maxQty(5, 9)).toBe(5);
    expect(maxQty(5, -2)).toBe(0);
  });
});

describe('subtotal', () => {
  it('menghitung harga dikali qty', () => {
    expect(
      subtotal([
        { productId: 'p1', name: 'A', unit: 'kg', price: 10_000, qty: 2, image: '' },
        { productId: 'p2', name: 'B', unit: 'kg', price: 5_000, qty: 3, image: '' },
      ]),
    ).toBe(35_000);
  });
});

describe('splitDiscount', () => {
  it('membagi diskon proporsional ke subtotal', () => {
    const parts = splitDiscount(10_000, [30_000, 10_000]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(10_000);
    expect(parts[0]).toBe(7_500);
    expect(parts[1]).toBe(2_500);
  });

  it('sisa pembulatan dibebankan ke penjual terakhir supaya total pas', () => {
    const parts = splitDiscount(2, [1, 1, 1]);
    expect(parts).toEqual([1, 1, 0]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(2);
  });

  it('mengembalikan nol saat diskon atau subtotal nol', () => {
    expect(splitDiscount(0, [10_000])).toEqual([0]);
    expect(splitDiscount(5_000, [0, 0])).toEqual([0, 0]);
  });

  it('tidak memotong melebihi total belanja', () => {
    const parts = splitDiscount(999_999, [10_000, 10_000]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(20_000);
  });
});

describe('buildOrders', () => {
  const args = {
    groupId: 'G1',
    items: cart,
    products: PRODUCTS,
    sellers: SELLERS,
    address: ADDRESS,
    buyerId: 'u1',
    payment: 'qris' as const,
    now: '2026-01-15T03:00:00.000Z',
  };

  it('membuat satu pesanan per penjual', () => {
    const orders = buildOrders(args);
    expect(orders).toHaveLength(2);
    expect(orders.map((o) => o.sellerId)).toEqual(['s1', 's2']);
  });

  it('mengisi subtotal, ongkir, dan status awal dibayar', () => {
    const [first] = buildOrders(args);
    expect(first.subtotal).toBe(25_000);
    expect(first.shipping).toBe(DEFAULT_SHIPPING);
    expect(first.status).toBe('dibayar');
    expect(first.discount).toBe(0);
  });

  it('memakai id dan invoice yang unik dan deterministik', () => {
    const orders = buildOrders(args);
    expect(orders.map((o) => o.id)).toEqual(['G1-1', 'G1-2']);
    expect(orders.map((o) => o.invoice)).toEqual(['INV/20260115/FF01', 'INV/20260115/FF02']);
    expect(orders.every((o) => o.groupId === 'G1')).toBe(true);
  });

  it('membagi diskon dan menaruhnya di pesanan penjual yang tepat', () => {
    const orders = buildOrders({ ...args, discount: 5_000 });
    // subtotal s1 25.000, s2 60.000 dari total 85.000
    expect(orders.reduce((sum, o) => sum + o.discount, 0)).toBe(5_000);
    expect(orders[0].discount).toBe(1_471);
    expect(orders[1].discount).toBe(3_529);
  });

  it('memakai nama penjual cadangan kalau seller tidak ditemukan', () => {
    const [order] = buildOrders({ ...args, sellers: [], items: [{ productId: 'p1', qty: 1 }] });
    expect(order.sellerName).toBe('Petani');
    expect(order.sellerCity).toBe('-');
  });

  it('mengembalikan daftar kosong saat keranjang kosong', () => {
    expect(buildOrders({ ...args, items: [] })).toEqual([]);
  });
});

describe('grandTotal', () => {
  it('menjumlahkan subtotal + ongkir - diskon semua penjual', () => {
    const orders = buildOrders({
      groupId: 'G1',
      items: cart,
      products: PRODUCTS,
      sellers: SELLERS,
      address: ADDRESS,
      buyerId: 'u1',
      payment: 'qris',
      discount: 5_000,
    });
    // 25.000 + 60.000 subtotal + 2 x 15.000 ongkir - 5.000 diskon
    expect(grandTotal(orders)).toBe(110_000);
  });
});
