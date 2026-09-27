/**
 * Daftar layar yang diaudit: rute aplikasi <-> berkas mockup.
 *
 * Ini satu-satunya berkas yang perlu diubah kalau ada layar atau mockup baru.
 * `world` menentukan keadaan localStorage sebelum layar dipotret, supaya
 * tampilan berisi (keranjang, pesanan) bisa dibandingkan dengan mockup-nya.
 */

/** Kunci localStorage milik aplikasi (lihat src/data/repositories/index.ts). */
export const KEYS = {
  cart: 'farmor.cart',
  orders: 'farmor.orders',
  user: 'farmor.user',
  addresses: 'farmor.addresses',
  wishlist: 'farmor.wishlist',
};

const DEMO_BUYER = {
  id: 'u1',
  name: 'Ridwan Muh',
  email: 'ridwan@farmor.id',
  phone: '08123456789',
  role: 'buyer',
};

const DEMO_SELLER = {
  id: 's1',
  name: 'Tani Makmur',
  email: 'tani@farmor.id',
  phone: '08129876543',
  role: 'seller',
  avatar: '/seller-1.jpg',
};

/** Isi keranjang: dua penjual berbeda, supaya pemecahan pesanan ikut terlihat. */
const CART = [
  { productId: 'p1', qty: 2 },
  { productId: 'p9', qty: 1 },
];

/**
 * `world` = langkah penyiapan sebelum rute dibuka.
 * Urutannya penting: localStorage hanya bisa ditulis setelah origin terbuka.
 */
export const WORLDS = {
  blank: async () => {},
  cart: async (page) => {
    await page.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(KEYS.cart)}, ${JSON.stringify(JSON.stringify(CART))});
    })()`);
  },
  order: async (page, { baseUrl }) => {
    await page.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(KEYS.cart)}, ${JSON.stringify(JSON.stringify(CART))});
    })()`);

    // Buat pesanan lewat alur aslinya, bukan dengan menulis objek Order buatan
    // tangan — supaya bentuknya selalu ikut logika domain yang sebenarnya.
    await page.goto(`${baseUrl}/checkout`);
    await page.evaluate(`
      [...document.querySelectorAll('button')]
        .find((b) => b.textContent.trim().startsWith('Bayar'))?.click()
    `);
    await page.waitForReady(1400);
  },
  seller: async (page) => {
    await page.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(KEYS.user)}, ${JSON.stringify(JSON.stringify(DEMO_SELLER))});
    })()`);
  },
  sellerOrders: async (page, ctx) => {
    await WORLDS.order(page, ctx);
    await page.evaluate(`localStorage.setItem(${JSON.stringify(KEYS.user)}, ${JSON.stringify(JSON.stringify(DEMO_SELLER))})`);
  },
  wishlist: async (page) => {
    await page.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(KEYS.wishlist)}, ${JSON.stringify(JSON.stringify(['p1', 'p2', 'p5']))});
    })()`);
  },
};

/** Ambil id pesanan/groupId pertama yang dibuat world `order`. */
export const readFirstOrder = async (page) => {
  const raw = await page.evaluate(`localStorage.getItem(${JSON.stringify(KEYS.orders)})`);
  const orders = raw ? JSON.parse(raw) : [];
  return { groupId: orders[0]?.groupId ?? '', orderId: orders[0]?.id ?? '' };
};

/**
 * `route` boleh fungsi supaya id yang baru dibuat setelah checkout bisa dipakai.
 * 18 dari 19 mockup punya pasangan layar; sisanya belum ada mockup-nya.
 */
export const SCREENS = [
  { id: 'splash', label: 'Splash', mockup: 'SplashScreen.svg', route: '/', world: 'blank' },
  { id: 'onboarding', label: 'Onboarding', mockup: 'OnboardingWelcomeScreen.svg', route: '/onboarding', world: 'blank' },
  { id: 'login', label: 'Login', mockup: 'LoginScreen.svg', route: '/login', world: 'blank' },
  { id: 'register', label: 'Register', mockup: 'RegisterScreen.svg', route: '/register', world: 'blank' },
  { id: 'home', label: 'Home Buyer', mockup: 'HomeBuyerScreen.svg', route: '/tabs/home', world: 'blank' },
  { id: 'explore', label: 'Explore Products', mockup: 'ExploreProductsScreen.svg', route: '/tabs/explore', world: 'blank' },
  { id: 'product-detail', label: 'Product Detail', mockup: 'ProductDetailScreen.svg', route: '/product/p1', world: 'blank' },
  { id: 'cart', label: 'Cart', mockup: 'CartScreen.svg', route: '/tabs/cart', world: 'cart' },
  {
    id: 'receipt',
    label: 'Order Receipt',
    mockup: 'OrderReceiptScreen.svg',
    route: (ctx) => `/receipt/${ctx.groupId}`,
    world: 'order',
  },
  { id: 'order-history', label: 'Order History', mockup: 'OrderHistoryScreen.svg', route: '/orders', world: 'order' },
  { id: 'profile', label: 'Profile Settings', mockup: 'ProfileSettingsScreen.svg', route: '/tabs/profile', world: 'blank' },
  {
    id: 'seller-dashboard',
    label: 'Seller Dashboard',
    mockup: 'SellerDashboardScreen.svg',
    route: '/seller/dashboard',
    world: 'sellerOrders',
  },
  {
    id: 'seller-orders',
    label: 'Seller Orders',
    mockup: 'SellerOrdersScreen.svg',
    route: '/seller/orders',
    world: 'sellerOrders',
  },
  {
    id: 'seller-add-product',
    label: 'Seller Add Product',
    mockup: 'SellerAddProductScreen.svg',
    route: '/seller/add',
    world: 'seller',
  },
  { id: 'wishlist', label: 'Wishlist', mockup: 'WishlistScreen.svg', route: '/wishlist', world: 'wishlist' },
  { id: 'notifications', label: 'Notifications', mockup: 'NotificationsScreen.svg', route: '/notifications', world: 'blank' },
  { id: 'chat', label: 'Chat', mockup: 'ChatScreen.svg', route: '/chat', world: 'blank' },
  {
    id: 'tracking',
    label: 'Delivery Tracking',
    mockup: 'DeliveryTrackingScreen.svg',
    route: (ctx) => `/tracking/${ctx.orderId}`,
    world: 'order',
  },
];

/**
 * Layar yang sudah dibangun tapi belum punya mockup. Dicatat supaya
 * ketidakhadirannya sengaja, bukan terlewat.
 */
export const WITHOUT_MOCKUP = [
  'Checkout',
  'Order Detail',
  'Address Book',
  'Forgot Password',
  'Seller Products',
  'Help / Terms / About',
];

/**
 * Layar tanpa mockup tetap difoto (tanpa gerbang RMSE) supaya pola seperti
 * state kosong, layout shift, dan teks meluber tetap terlihat di laporan.
 */
export const EXTRA_SCREENS = [
  { id: 'checkout', label: 'Checkout', route: '/checkout', world: 'cart' },
  { id: 'forgot', label: 'Forgot Password', route: '/forgot', world: 'blank' },
  { id: 'seller-products', label: 'Seller Products', route: '/seller/products', world: 'seller' },
  { id: 'addresses', label: 'Address Book', route: '/addresses', world: 'order' },
  { id: 'about', label: 'About', route: '/about', world: 'blank' },
  { id: 'terms', label: 'Terms', route: '/terms', world: 'blank' },
];

/**
 * Batas RMSE per layar (0..1): makin kecil, makin ketat. Angka ditetapkan dari
 * selisih nyata yang tersisa setelah layar disetarakan dengan mockup, dengan
 * ruang untuk anti-aliasing teks dan foto asli vs raster SVG.
 *
 * `visual-diff` gagal (exit 1) kalau ada layar melewati batasnya, jadi
 * penyimpangan tata letak tidak bisa lolos tanpa disadari.
 */
export const DEFAULT_LIMIT = 0.3;

export const LIMITS = {
  // Teks mockup berupa outline <path>, sedangkan implementasi memakai font asli,
  // jadi selisih kecil pada label selalu ada. Layar berfoto punya lantai lebih tinggi.
  chat: 0.21,
  notifications: 0.18,
  profile: 0.21,
  tracking: 0.23,
  'seller-orders': 0.2,
  'seller-add-product': 0.26,
  'order-history': 0.24,
  cart: 0.27,
  register: 0.27,
  login: 0.28,
  wishlist: 0.29,
  onboarding: 0.29,
  explore: 0.32,
  home: 0.32,
  'seller-dashboard': 0.29,
  'product-detail': 0.29,
  receipt: 0.29,
  splash: 0.18,
  // Splash sengaja menambah CTA "Mulai" yang tidak ada di mockup (diperlukan
  // supaya layar tidak buntu). Div deregulasi: brand & tengah tetap 14,8%-
  // 14,9%; seluruh selisih terukur terkonsentrasi di zona CTA bawah (21,3%).
};
