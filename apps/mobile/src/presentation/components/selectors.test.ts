import { describe, expect, it } from 'vitest';
import { buildCheckoutPreview } from './selectors';
import { DEFAULT_SHIPPING, buildOrders, grandTotal } from '../../core/services/order';
import { SELLERS } from '../../data/dto/catalog';
import type { Address, CartItem, Product } from '../../core/entities/types';

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
  reviews: 0,
});

const PRODUCTS: Product[] = [
  makeProduct('p1', 's1', 10_000),
  makeProduct('p2', 's1', 5_000),
  makeProduct('p3', 's2', 20_000),
];

const ADDRESS: Address = {
  id: 'a1',
  label: 'Rumah',
  recipient: 'Ridwan',
  phone: '0812',
  line: 'Jl. Test 1',
};

// subtotal s1 = 2x10.000 + 5.000 = 25.000, subtotal s2 = 3x20.000 = 60.000
const cart: CartItem[] = [
  { productId: 'p1', qty: 2 },
  { productId: 'p2', qty: 1 },
  { productId: 'p3', qty: 3 },
];

describe('buildCheckoutPreview', () => {
  it('memecah pratinjau per penjual', () => {
    const preview = buildCheckoutPreview(cart, PRODUCTS);

    expect(preview.orders).toHaveLength(2);
    expect(preview.orders.map((o) => o.sellerId)).toEqual(['s1', 's2']);
    expect(preview.orders[0].subtotal).toBe(25_000);
    expect(preview.orders[1].subtotal).toBe(60_000);
  });

  it('menghitung subtotal, ongkir per penjual, dan total bayar', () => {
    const preview = buildCheckoutPreview(cart, PRODUCTS);

    expect(preview.subtotal).toBe(85_000);
    expect(preview.orders.every((o) => o.shipping === DEFAULT_SHIPPING)).toBe(true);
    expect(preview.shipping).toBe(2 * DEFAULT_SHIPPING);
    expect(preview.discount).toBe(0);
    expect(preview.total).toBe(115_000);
  });

  it('menjumlahkan qty seluruh keranjang', () => {
    expect(buildCheckoutPreview(cart, PRODUCTS).qty).toBe(6);
  });

  it('mengurangkan diskon dari total', () => {
    const preview = buildCheckoutPreview(cart, PRODUCTS, 5_000);

    expect(preview.discount).toBe(5_000);
    expect(preview.total).toBe(110_000);
  });

  it('memotong diskon tidak lebih dari subtotal', () => {
    const preview = buildCheckoutPreview(cart, PRODUCTS, 999_999);

    expect(preview.discount).toBe(85_000);
    expect(preview.total).toBe(2 * DEFAULT_SHIPPING);
  });

  it('mengabaikan produk tidak dikenal dan qty nol', () => {
    const preview = buildCheckoutPreview(
      [
        { productId: 'p1', qty: 1 },
        { productId: 'hilang', qty: 9 },
        { productId: 'p2', qty: 0 },
      ],
      PRODUCTS,
    );

    expect(preview.orders).toHaveLength(1);
    expect(preview.subtotal).toBe(10_000);
    expect(preview.qty).toBe(1);
  });

  it('keranjang kosong menghasilkan pratinjau nol tanpa ongkir', () => {
    const preview = buildCheckoutPreview([], PRODUCTS);

    expect(preview.orders).toEqual([]);
    expect(preview.subtotal).toBe(0);
    expect(preview.shipping).toBe(0);
    expect(preview.total).toBe(0);
  });

  it('memakai nama penjual cadangan kalau seller tidak dikenal', () => {
    const preview = buildCheckoutPreview([{ productId: 'p9', qty: 1 }], [
      makeProduct('p9', 'tidak-ada', 7_000),
    ]);

    expect(preview.orders[0].sellerName).toBe('Petani');
    expect(preview.orders[0].sellerCity).toBe('-');
  });

  /**
   * Penjaga penyimpangan: pratinjau dan pesanan yang benar-benar dibuat adalah
   * dua perhitungan uang yang terpisah. Kalau salah satu diubah, total yang
   * dilihat pembeli harus tetap sama dengan yang ditagih.
   */
  it('total pratinjau sama dengan total pesanan yang benar-benar dibuat', () => {
    for (const discount of [0, 5_000, 999_999]) {
      const preview = buildCheckoutPreview(cart, PRODUCTS, discount);
      const orders = buildOrders({
        groupId: 'G1',
        items: cart,
        products: PRODUCTS,
        sellers: SELLERS,
        address: ADDRESS,
        buyerId: 'u1',
        payment: 'qris',
        discount,
      });

      expect(preview.total).toBe(grandTotal(orders));
      expect(preview.discount).toBe(orders.reduce((sum, o) => sum + o.discount, 0));
    }
  });
});
