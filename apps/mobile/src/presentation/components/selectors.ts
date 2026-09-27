import type { CartItem, Order, OrderStatus, Product, SubOrder } from '../../core/entities/types';
import { DEFAULT_SHIPPING, groupBySeller, subtotal } from '../../core/services/order';
import { SELLERS } from '../../data/dto/catalog';

export interface CheckoutPreview {
  orders: PreviewGroup[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  qty: number;
}

/** Pratinjau sebelum pesanan dibuat: groupId belum ada sampai checkout. */
export type PreviewGroup = Omit<SubOrder, 'groupId'>;

export const buildCheckoutPreview = (
  cart: CartItem[],
  products: Product[],
  discount = 0,
): CheckoutPreview => {
  const groups = groupBySeller(cart, products);
  const orders: PreviewGroup[] = [...groups.entries()].map(([sellerId, items]) => {
    const seller = SELLERS.find((s) => s.id === sellerId);
    return {
      id: sellerId,
      invoice: '',
      sellerId,
      sellerName: seller?.name ?? 'Petani',
      sellerCity: seller?.city ?? '-',
      items,
      subtotal: subtotal(items),
      shipping: DEFAULT_SHIPPING,
      discount: 0,
    };
  });

  const sub = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const shipping = orders.length * DEFAULT_SHIPPING;
  const capped = Math.min(discount, sub);

  // Dihitung dari baris yang benar-benar ikut dipesan, bukan dari keranjang mentah,
  // supaya label "(n item)" tidak menghitung produk yang sudah tidak ada.
  const qty = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);

  return {
    orders,
    subtotal: sub,
    shipping,
    discount: capped,
    total: sub + shipping - capped,
    qty,
  };
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_bayar: 'Menunggu Bayar',
  dibayar: 'Diproses',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export const STATUS_STYLE: Record<OrderStatus, { bg: string; fg: string }> = {
  menunggu_bayar: { bg: 'var(--ff-amber-soft)', fg: 'var(--ff-amber)' },
  dibayar: { bg: 'var(--ff-info-soft)', fg: 'var(--ff-info)' },
  diproses: { bg: 'var(--ff-info-soft)', fg: 'var(--ff-info)' },
  dikirim: { bg: 'var(--ff-info-soft)', fg: 'var(--ff-info)' },
  selesai: { bg: 'var(--ff-success-soft)', fg: 'var(--ff-success)' },
  dibatalkan: { bg: 'var(--ff-line)', fg: 'var(--ff-muted)' },
};

export const PAYMENT_LABEL: Record<Order['payment'], string> = {
  qris: 'QRIS',
  transfer_bank: 'Transfer Bank',
  emoney: 'E-Money',
};
