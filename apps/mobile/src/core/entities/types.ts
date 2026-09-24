export type Role = 'buyer' | 'seller';

export type OrderStatus =
  | 'menunggu_bayar'
  | 'dibayar'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export type PaymentMethod = 'qris' | 'transfer_bank' | 'emoney';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
}

export interface Seller {
  id: string;
  name: string;
  city: string;
  avatar?: string;
  rating: number;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  weightGram: number;
  organic: boolean;
  image: string;
  description: string;
  sold: number;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line: string;
  note?: string;
}

/** Satu keranjang bisa berisi banyak penjual; bayar sekali, order pecah per penjual. */
export interface CheckoutLine {
  productId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
  image: string;
}

export interface SubOrder {
  id: string;
  groupId: string;
  invoice: string;
  sellerId: string;
  sellerName: string;
  sellerCity: string;
  items: CheckoutLine[];
  subtotal: number;
  shipping: number;
  discount: number;
}

export interface Order extends SubOrder {
  buyerId: string;
  status: OrderStatus;
  payment: PaymentMethod;
  address: Address;
  createdAt: string;
}

export interface CheckoutResult {
  groupId: string;
  orders: Order[];
  paidAt: string;
}

export interface TrackStep {
  label: string;
  note: string;
  at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  note: string;
  at: string;
  tone: 'success' | 'amber' | 'info';
}
