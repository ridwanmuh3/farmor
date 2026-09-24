import type { Address, Product, Role, Seller, User } from '../../core/entities/types';

const product = (
  id: string,
  sellerId: string,
  name: string,
  category: string,
  price: number,
  unit: string,
  stock: number,
  weightGram: number,
  image: string,
  description: string,
  sold: number,
  organic = false,
): Product => ({
  id,
  sellerId,
  name,
  category,
  price,
  unit,
  stock,
  weightGram,
  organic,
  image,
  description,
  sold,
});

export const SELLERS: Seller[] = [
  { id: 's1', name: 'Tani Makmur', city: 'Lembang', rating: 4.8, avatar: '/seller-1.jpg' },
  { id: 's2', name: 'Sayur Berkah', city: 'Cianjur', rating: 4.6, avatar: '/seller-2.jpg' },
  { id: 's3', name: 'Ternak Jaya', city: 'Bogor', rating: 4.9, avatar: '/seller-3.jpg' },
];

export const PRODUCTS: Product[] = [
  product('p1', 's1', 'Wortel Organik Segar', 'Sayuran', 12000, 'kg', 40, 1000, '/product-1.jpg', 'Wortel manis tanpa pestisida, dipanen pagi hari lalu langsung dikemas.', 412, true),
  product('p2', 's1', 'Kentang Dieng', 'Sayuran', 16000, 'kg', 25, 1000, '/product-2.jpg', 'Kentang kualitas ekspor dari dataran tinggi Dieng.', 286),
  product('p3', 's1', 'Tomat Merah', 'Sayuran', 9000, 'kg', 30, 1000, '/product-3.jpg', 'Tomat matang pohon, cocok untuk sambal dan jus.', 331),
  product('p4', 's1', 'Bawang Merah', 'Bumbu', 28000, 'kg', 18, 1000, '/product-4.jpg', 'Bawang merah kering, aroma tajam, tahan simpan.', 155, true),
  product('p5', 's2', 'Bayam Hijau', 'Sayuran', 6000, 'ikat', 50, 250, '/product-5.jpg', 'Bayam segar satu ikat, dipetik sore sebelumnya.', 520),
  product('p6', 's2', 'Kangkung', 'Sayuran', 5000, 'ikat', 45, 250, '/product-6.jpg', 'Kangkung darat, batang renyah.', 610),
  product('p7', 's2', 'Cabai Rawit Merah', 'Bumbu', 45000, 'kg', 12, 1000, '/product-7.jpg', 'Rawit merah pedas, sortir manual.', 233),
  product('p8', 's2', 'Mangga Harum Manis', 'Buah', 22000, 'kg', 20, 1000, '/product-8.jpg', 'Mangga harum manis matang pohon, wangi kuat.', 178),
  product('p9', 's3', 'Telur Ayam Kampung', 'Ternak', 32000, 'kg', 22, 1000, '/product-9.jpg', 'Telur ayam kampung dari kandang bebas rangkak.', 349, true),
  product('p10', 's3', 'Daging Sapi Sapi Lokal', 'Ternak', 145000, 'kg', 8, 1000, '/product-10.jpg', 'Daging sapi segar bagian sengkel, dipotong hari yang sama.', 96),
  product('p11', 's3', 'Madu Hutan Murni', 'Olahan', 95000, 'botol', 15, 500, '/product-11.jpg', 'Madu hutan tanpa campuran gula.', 204, true),
  product('p12', 's3', 'Kopi Robusta Bubuk', 'Olahan', 58000, 'pack', 26, 500, '/product-12.jpg', 'Robusta giling halus, sangrai medium.', 267),
];

export const ADDRESSES: Address[] = [
  {
    id: 'a1',
    label: 'Rumah',
    recipient: 'Ridwan Muh',
    phone: '08123456789',
    line: 'Jl. Cihampelas No. 12, Sukajadi, Bandung 40162',
    note: 'Pagar hijau sebelah warung',
  },
  {
    id: 'a2',
    label: 'Kantor',
    recipient: 'Ridwan Muh',
    phone: '08123456789',
    line: 'Jl. Asia Afrika No. 8, Sumur Bandung, Bandung 40111',
  },
];

export const DEMO_USER: User = {
  id: 'u1',
  name: 'Ridwan Muh',
  email: 'ridwan@farmor.id',
  phone: '08123456789',
  role: 'buyer',
};

export const DEMO_SELLER_USER: User = {
  id: 's1',
  name: 'Tani Makmur',
  email: 'tani@farmor.id',
  phone: '08129876543',
  role: 'seller',
  avatar: '/seller-1.jpg',
};

export const CATEGORIES = ['Semua', 'Sayuran', 'Buah', 'Bumbu', 'Ternak', 'Olahan'];

export const roleLabel = (role: Role): string => (role === 'seller' ? 'Penjual' : 'Pembeli');
