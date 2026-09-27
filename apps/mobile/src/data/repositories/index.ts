import type {
  Address,
  CartItem,
  ChatBubble,
  CheckoutResult,
  Order,
  PaymentMethod,
  Product,
  User,
} from '../../core/entities/types';
import { buildOrders } from '../../core/services/order';
import { nextStock } from '../../core/services/inventory';
import { jam } from '../../core/entities/format';
import {
  ADDRESSES,
  DEMO_SELLER_USER,
  DEMO_USER,
  PRODUCTS,
  SEED_CHAT,
  SELLERS,
} from '../dto/catalog';

const CART_KEY = 'farmor.cart';
const ORDERS_KEY = 'farmor.orders';
const USER_KEY = 'farmor.user';
const ADDR_KEY = 'farmor.addresses';
const CUSTOM_KEY = 'farmor.products.custom';
const STOCK_KEY = 'farmor.stock';
const WISH_KEY = 'farmor.wishlist';
const CHAT_KEY = 'farmor.chat';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // penyimpanan penuh atau mode privat: data hilang, layar tetap jalan
  }
};

const stockOverrides = (): Record<string, number> => read<Record<string, number>>(STOCK_KEY, {});
const customProducts = (): Product[] => read<Product[]>(CUSTOM_KEY, []);

export const productRepo = {
  all: (): Product[] => {
    const overrides = stockOverrides();
    return [...customProducts(), ...PRODUCTS].map((p) =>
      overrides[p.id] === undefined ? p : { ...p, stock: overrides[p.id] },
    );
  },
  byId: (id: string): Product | undefined => productRepo.all().find((p) => p.id === id),
  bySeller: (sellerId: string): Product[] => productRepo.all().filter((p) => p.sellerId === sellerId),
  sellers: () => SELLERS,
  seller: (id: string) => SELLERS.find((s) => s.id === id),
  setStock(id: string, stock: number): void {
    write(STOCK_KEY, { ...stockOverrides(), [id]: Math.max(0, stock) });
  },
  add(product: Product): void {
    write(CUSTOM_KEY, [product, ...customProducts()]);
  },
};

export const cartRepo = {
  get: (): CartItem[] => read<CartItem[]>(CART_KEY, []),
  save: (items: CartItem[]): void => write(CART_KEY, items),
  clear: (): void => write(CART_KEY, []),
  setQty(productId: string, qty: number): CartItem[] {
    const items = cartRepo.get();
    const next = qty <= 0
      ? items.filter((i) => i.productId !== productId)
      : [...items.filter((i) => i.productId !== productId), { productId, qty }];
    cartRepo.save(next);
    return next;
  },
};

export const orderRepo = {
  get: (): Order[] => read<Order[]>(ORDERS_KEY, []),
  save: (orders: Order[]): void => write(ORDERS_KEY, orders),
  byId: (id: string): Order | undefined => orderRepo.get().find((o) => o.id === id),
  setStatus(id: string, status: Order['status']): Order[] {
    const next = orderRepo.get().map((o) => (o.id === id ? { ...o, status } : o));
    orderRepo.save(next);
    return next;
  },
  checkout(
    items: CartItem[],
    address: Address,
    payment: PaymentMethod,
    discountOverride = 0,
  ): CheckoutResult {
    const products = productRepo.all();
    const groupId = `G${Date.now()}`;
    const orders = buildOrders({
      groupId,
      items,
      products,
      sellers: SELLERS,
      address,
      buyerId: userRepo.get().id,
      payment,
      discount: discountOverride,
    });

    // Tidak ada pesanan yang terbentuk (produk hilang dari katalog, misalnya):
    // jangan sentuh stok, jangan kosongkan keranjang, dan kembalikan daftar kosong
    // supaya pemanggil bisa memberi tahu pembeli tanpa kehilangan isiannya.
    if (orders.length === 0) return { groupId, orders, paidAt: new Date().toISOString() };

    // Stok dikunci saat pesanan dibuat, bukan saat masuk keranjang.
    for (const order of orders) {
      for (const line of order.items) {
        const current = productRepo.byId(line.productId);
        if (current) productRepo.setStock(current.id, nextStock(current.stock, 0, line.qty));
      }
    }

    orderRepo.save([...orders, ...orderRepo.get()]);
    cartRepo.clear();
    return { groupId, orders, paidAt: new Date().toISOString() };
  },
};

export const userRepo = {
  get: (): User => read<User>(USER_KEY, DEMO_USER),
  save: (user: User): void => write(USER_KEY, user),
  getByRole: (role: User['role']): User => (role === 'seller' ? DEMO_SELLER_USER : DEMO_USER),
  signOut: (): void => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CART_KEY);
  },
};

export const addressRepo = {
  get: (): Address[] => read<Address[]>(ADDR_KEY, ADDRESSES),
  save: (list: Address[]): void => write(ADDR_KEY, list),
};

export const wishlistRepo = {
  get: (): string[] => read<string[]>(WISH_KEY, []),
  has: (productId: string): boolean => wishlistRepo.get().includes(productId),
  toggle(productId: string): string[] {
    const current = wishlistRepo.get();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [productId, ...current];
    write(WISH_KEY, next);
    return next;
  },
};

/**
 * Riwayat chat disimpan di perangkat supaya pesan yang sudah dikirim tidak
 * hilang saat aplikasi ditutup. Ganti dengan API saat backend siap.
 */
export const chatRepo = {
  get: (): ChatBubble[] => read<ChatBubble[]>(CHAT_KEY, SEED_CHAT),
  append(current: ChatBubble[], message: Omit<ChatBubble, 'id' | 'at'>): ChatBubble[] {
    const next = [...current, { ...message, id: `c${current.length + 1}`, at: jam() }];
    write(CHAT_KEY, next);
    return next;
  },
};

