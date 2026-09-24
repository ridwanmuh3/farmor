import type { CartItem, CheckoutLine, Order, PaymentMethod, Product, SubOrder } from '../entities/types';

export const DEFAULT_SHIPPING = 15000;

/**
 * Aturan uang dipusatkan di sini supaya bisa dites tanpa React.
 * ponytail: ongkir flat per penjual; ganti ke tarif jarak saat API kurir ada.
 */
export const groupBySeller = (items: CartItem[], products: Product[]) => {
  const groups = new Map<string, CheckoutLine[]>();

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || item.qty <= 0) continue;

    const line: CheckoutLine = {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      price: product.price,
      qty: item.qty,
      image: product.image,
    };

    const lines = groups.get(product.sellerId) ?? [];
    lines.push(line);
    groups.set(product.sellerId, lines);
  }

  return groups;
};

export const maxQty = (stock: number, current: number): number =>
  Math.max(0, Math.min(stock, current));

export const clampQty = (qty: number, stock: number): number =>
  Math.max(1, Math.min(stock, Math.floor(qty) || 1));

export const subtotal = (items: CheckoutLine[]): number =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0);

export const grandTotal = (orders: SubOrder[]): number =>
  orders.reduce((sum, o) => sum + o.subtotal + o.shipping - o.discount, 0);

/** Diskon dibagi proporsional ke subtotal tiap penjual, biar jumlah potongan pas. */
export const splitDiscount = (discount: number, subs: number[]): number[] => {
  const total = subs.reduce((a, b) => a + b, 0);
  if (total <= 0 || discount <= 0) return subs.map(() => 0);

  const capped = Math.min(discount, total);
  const parts = subs.map((sub, i) =>
    i === subs.length - 1
      ? capped - subs.slice(0, -1).reduce((sum, s) => sum + Math.round((capped * s) / total), 0)
      : Math.round((capped * sub) / total),
  );
  return parts;
};

export interface BuildOrdersArgs {
  groupId: string;
  items: CartItem[];
  products: Product[];
  sellers: { id: string; name: string; city: string }[];
  address: Order['address'];
  buyerId: string;
  payment: PaymentMethod;
  discount?: number;
  shipping?: number;
  now?: string;
}

export const buildOrders = ({
  groupId,
  items,
  products,
  sellers,
  address,
  buyerId,
  payment,
  discount = 0,
  shipping = DEFAULT_SHIPPING,
  now = new Date().toISOString(),
}: BuildOrdersArgs): Order[] => {
  const groups = groupBySeller(items, products);
  const entries = [...groups.entries()];

  const subs = entries.map(([, lines]) => subtotal(lines));
  const discounts = splitDiscount(discount, subs);
  const stamp = new Date(now);
  const seq = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}`;

  return entries.map(([sellerId, lines], i) => {
    const seller = sellers.find((s) => s.id === sellerId);
    const invoice = `INV/${seq}/FF${String(i + 1).padStart(2, '0')}`;

    return {
      id: `${groupId}-${i + 1}`,
      invoice,
      groupId,
      buyerId,
      sellerId,
      sellerName: seller?.name ?? 'Petani',
      sellerCity: seller?.city ?? '-',
      items: lines,
      subtotal: subs[i],
      shipping,
      discount: discounts[i],
      status: 'dibayar',
      payment,
      address,
      createdAt: now,
    };
  });
};
