import type { OrderStatus } from '../entities/types';

/**
 * Aturan stok dipisah dari UI supaya bisa dites tanpa React.
 * Stok baru dikunci saat pesanan dibuat, bukan saat masuk keranjang.
 */
export const nextStock = (stock: number, ordered: number, currentQty: number): number =>
  Math.max(0, stock - ordered - currentQty);

export const cartQuantity = (lines: { qty: number }[]): number =>
  lines.reduce((sum, line) => sum + line.qty, 0);

export const isSoldOut = (stock: number): boolean => stock <= 0;

export const canCheckout = (stock: number, qty: number): boolean =>
  stock > 0 && qty > 0 && qty <= stock;

export const statusAfterSellerAccepts = (): OrderStatus => 'diproses';
export const statusAfterSellerRejects = (): OrderStatus => 'dibatalkan';
