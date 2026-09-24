import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Address, CartItem, Order, User } from '../../core/entities/types';
import { addressRepo, cartRepo, orderRepo, productRepo, userRepo, wishlistRepo } from '../../data/repositories';
import { buildCheckoutPreview } from '../components/selectors';

interface ShopState {
  user: User;
  role: User['role'];
  cart: CartItem[];
  orders: Order[];
  addresses: Address[];
  address: Address;
  discount: number;
  promo: string;
  cartCount: number;
  setRole: (role: User['role']) => void;
  signIn: (email: string, name: string, role: User['role']) => void;
  signOut: () => void;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  selectAddress: (id: string) => void;
  addAddress: (address: Address) => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  checkout: (method: Order['payment']) => Order[];
  setOrderStatus: (id: string, status: Order['status']) => void;
  wishlist: string[];
  toggleWish: (productId: string) => void;
}

const ShopContext = createContext<ShopState | null>(null);

export const PROMO_CODE = 'PANEN10';

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => userRepo.get());
  const [cart, setCart] = useState<CartItem[]>(() => cartRepo.get());
  const [orders, setOrders] = useState<Order[]>(() => orderRepo.get());
  const [addresses, setAddresses] = useState<Address[]>(() => addressRepo.get());
  const [addressId, setAddressId] = useState<string>(() => addressRepo.get()[0]?.id ?? '');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>(() => wishlistRepo.get());

  useEffect(() => {
    userRepo.save(user);
  }, [user]);

  const value = useMemo<ShopState>(() => {
    const address = addresses.find((a) => a.id === addressId) ?? addresses[0];

    return {
      user,
      role: user.role,
      cart,
      orders,
      addresses,
      address,
      discount,
      promo,
      cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
      setRole: (role) => setUser(userRepo.getByRole(role)),
      signIn: (email, name, role) =>
        setUser({ ...userRepo.getByRole(role), email, name: name || userRepo.getByRole(role).name, role }),
      signOut: () => {
        userRepo.signOut();
        setUser(userRepo.getByRole('buyer'));
        setCart([]);
        cartRepo.clear();
      },
      addToCart: (productId, qty = 1) => {
        const existing = cart.find((i) => i.productId === productId)?.qty ?? 0;
        setCart(cartRepo.setQty(productId, existing + qty));
      },
      setQty: (productId, qty) => setCart(cartRepo.setQty(productId, qty)),
      removeFromCart: (productId) => setCart(cartRepo.setQty(productId, 0)),
      clearCart: () => {
        cartRepo.clear();
        setCart([]);
      },
      selectAddress: setAddressId,
      addAddress: (address) => {
        const next = [...addresses, address];
        addressRepo.save(next);
        setAddresses(next);
        setAddressId(address.id);
      },
      applyPromo: (code) => {
        const valid = code.trim().toUpperCase() === PROMO_CODE;
        const sub = buildCheckoutPreview(cart, productRepo.all()).orders.reduce(
          (sum, o) => sum + o.subtotal,
          0,
        );
        setPromo(valid ? PROMO_CODE : '');
        setDiscount(valid ? Math.round(sub * 0.1) : 0);
        return valid;
      },
      removePromo: () => {
        setPromo('');
        setDiscount(0);
      },
      checkout: (method) => {
        const result = orderRepo.checkout(cart, address, method, discount);
        setOrders(orderRepo.get());
        setCart([]);
        setPromo('');
        setDiscount(0);
        return result.orders;
      },
      setOrderStatus: (id, status) => setOrders(orderRepo.setStatus(id, status)),
      wishlist,
      toggleWish: (productId) => setWishlist(wishlistRepo.toggle(productId)),
    };
  }, [user, cart, orders, addresses, addressId, promo, discount, wishlist]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = (): ShopState => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop harus dipakai di dalam ShopProvider');
  return ctx;
};
