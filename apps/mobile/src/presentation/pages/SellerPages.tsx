import { IonContent, IonPage } from '@ionic/react';
import { useRef, useState } from 'react';
import { Bell, Box, PlusCircle, TrendingUp } from 'lucide-react';
import { useHistory } from '../router';
import { rupiah } from '../../core/entities/format';
import type { Product } from '../../core/entities/types';
import { CATEGORIES, SELLERS } from '../../data/dto/catalog';
import { productRepo } from '../../data/repositories';
import { useShop } from '../components/ShopProvider';
import { STATUS_LABEL, STATUS_STYLE } from '../components/selectors';
import { statusAfterSellerAccepts, statusAfterSellerRejects } from '../../core/services/inventory';
import { Badge, Btn, Card, ConfirmBtn, Empty, Field, Row, Thumb } from '../components/ui';

/**
 * Halaman penjual milik seller yang sedang masuk. Akun demo belum punya
 * relasi ke Seller, jadi dicocokkan lewat id akun dan jatuh ke s1 sebagai
 * default — goutkan ini begitu backend keyed by seller id tersedia.
 */
const useSeller = () => {
  const { user } = useShop();
  const id = SELLERS.some((s) => s.id === user.id) ? user.id : 's1';
  return { sellerId: id, seller: SELLERS.find((s) => s.id === id)! };
};

export const SellerDashboard = () => {
  const history = useHistory();
  const { orders, user, setOrderStatus } = useShop();
  const { sellerId, seller } = useSeller();
  const mine = orders.filter((o) => o.sellerId === sellerId);
  const revenue = mine
    .filter((o) => o.status !== 'dibatalkan')
    .reduce((sum, o) => sum + o.subtotal, 0);
  const products = productRepo.bySeller(sellerId);

  const stats = [
    { label: 'Pendapatan Bulan Ini', value: rupiah(revenue), tone: 'soft' as const },
    { label: 'Total Pesanan', value: String(mine.length), tone: 'plain' as const },
    { label: 'Produk Aktif', value: String(products.length), tone: 'plain' as const },
    { label: 'Rating', value: `${seller.rating.toFixed(1)} ★`, tone: 'amber' as const },
  ];

  const actions = [
    { label: 'Tambah Produk', to: '/seller/add', Icon: PlusCircle },
    { label: 'Kelola Stok', to: '/seller/products', Icon: Box },
    { label: 'Lihat Laporan', to: '/seller/orders', Icon: TrendingUp },
  ];

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div
          style={{
            background: 'var(--ff-primary-strong)',
            color: 'var(--ff-on-primary)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Thumb src={seller.avatar ?? user.avatar ?? ''} size={40} radius={20} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 var(--ff-space-1)', fontSize: 12, opacity: 0.9 }}>Selamat Bekerja,</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{seller.owner} ({seller.name})</p>
          </div>
          <button
            type="button"
            aria-label="Notifikasi"
            onClick={() => history.push('/notifications')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'transparent',
              color: 'var(--ff-on-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={18} aria-hidden />
          </button>
        </div>

        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)' }}>Dashboard Petani</h1>

          <div className="ff-grid" style={{ marginTop: 16 }}>
            {stats.map((s) => (
              <Card
                key={s.label}
                style={
                  s.tone === 'soft'
                    ? { background: 'var(--ff-primary-soft)', borderColor: 'var(--ff-primary-soft)' }
                    : s.tone === 'amber'
                      ? { background: 'var(--ff-amber-soft)', borderColor: 'var(--ff-amber-soft)' }
                      : undefined
                }
              >
                <p className="ff-muted" style={{ margin: 0, fontSize: 12 }}>{s.label}</p>
                <p style={{ margin: '6px 0 0', fontWeight: 700, fontSize: 20 }}>{s.value}</p>
              </Card>
            ))}
          </div>

          <h2 className="ff-section">Aksi Cepat</h2>
          <div className="ff-grid">
            {actions.map(({ label, to, Icon }) => (
              <Card key={label}>
                <button
                  type="button"
                  onClick={() => history.push(to)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    minHeight: 44,
                    color: 'var(--ff-text)',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: 'var(--ff-primary-soft)',
                      color: 'var(--ff-primary-dark)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                </button>
              </Card>
            ))}
          </div>

          <div className="ff-row" style={{ marginTop: 24 }}>
            <h2 className="ff-section" style={{ margin: 0 }}>Pesanan Terbaru</h2>
            <button
              type="button"
              onClick={() => history.push('/seller/orders')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, minHeight: 44 }}
            >
              Lihat Semua
            </button>
          </div>

          {mine.length === 0 ? (
            <Empty title="Belum ada pesanan" note="Pesanan pembeli akan muncul di sini." />
          ) : (
            mine.slice(0, 3).map((order) => {
              const style = STATUS_STYLE[order.status];
              return (
                <Card key={order.id} style={{ marginTop: 12 }}>
                  <Row>
                    <div>
                      <span style={{ fontWeight: 600 }}>{order.address.recipient}</span>
                      <p className="ff-muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
                        {order.items.map((i) => i.name).join(', ')} × {order.items.reduce((s, i) => s + i.qty, 0)} {order.items[0]?.unit}
                      </p>
                    </div>
                    <span className="ff-badge" style={{ background: style.bg, color: style.fg }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </Row>
                  <div className="ff-divider" />
                  <Row>
                    <span className="ff-muted" style={{ fontSize: 12 }}>Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)' }}>{rupiah(order.subtotal)}</span>
                  </Row>
                  {order.status === 'dibayar' ? (
                    <div className="ff-row" style={{ marginTop: 12, gap: 8 }}>
                      <ConfirmBtn
                        variant="ghost"
                        title="Tolak pesanan ini?"
                        note="Pesanan dibatalkan dan pembeli diberi tahu. Tindakan ini tidak bisa dibatalkan."
                        confirmLabel="Ya, Tolak"
                        onConfirm={() => setOrderStatus(order.id, statusAfterSellerRejects())}
                      >
                        Tolak
                      </ConfirmBtn>
                      <Btn onClick={() => setOrderStatus(order.id, statusAfterSellerAccepts())}>Proses</Btn>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12 }}>
                      <Btn onClick={() => history.push('/seller/orders')}>Kelola</Btn>
                    </div>
                  )}
                </Card>
              );
            })
          )}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const SellerOrders = () => {
  const { orders, setOrderStatus } = useShop();
  const { sellerId } = useSeller();
  const [tab, setTab] = useState<'baru' | 'diproses' | 'dikirim' | 'selesai'>('baru');
  const mine = orders.filter((o) => o.sellerId === sellerId);

  const tabs = [
    { id: 'baru' as const, label: 'Baru', match: ['dibayar'] },
    { id: 'diproses' as const, label: 'Diproses', match: ['diproses'] },
    { id: 'dikirim' as const, label: 'Dikirim', match: ['dikirim'] },
    { id: 'selesai' as const, label: 'Selesai', match: ['selesai', 'dibatalkan'] },
  ];
  const current = tabs.find((t) => t.id === tab)!;
  const filtered = mine.filter((o) => current.match.includes(o.status));

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-hero)' }}>Kelola Pesanan</h1>
          </div>

          <div className="ff-chip-row" style={{ marginTop: 12 }}>
            {tabs.map((t) => {
              const count = mine.filter((o) => t.match.includes(o.status)).length;
              return (
                <button key={t.id} type="button" className="ff-chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                  {t.label}
                  {t.id === 'baru' && count > 0 ? ` ${count}` : ''}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <Empty title="Tidak ada pesanan" note="Pesanan pada tahap ini masih kosong." />
          ) : (
            filtered.map((order) => (
              <Card key={order.id} style={{ marginTop: 12 }}>
                <Row>
                  <span style={{ fontWeight: 600 }}>{order.address.recipient}</span>
                  <span className="ff-muted" style={{ fontSize: 12 }}>{order.invoice}</span>
                </Row>
                <div className="ff-divider" />
                {order.items.map((item) => (
                  <p key={item.productId} style={{ margin: '0 0 6px', fontSize: 13 }}>
                    {item.name} × {item.qty} {item.unit}
                  </p>
                ))}
                <Row>
                  <span className="ff-muted" style={{ fontSize: 13 }}>Total</span>
                  <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)' }}>{rupiah(order.subtotal)}</span>
                </Row>
                <p className="ff-muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
                  Kirim ke: {order.address.line}
                </p>

                <div className="ff-row" style={{ marginTop: 12, gap: 8 }}>
                  {order.status === 'dibayar' ? (
                    <>
                      <ConfirmBtn
                        variant="ghost"
                        title="Tolak pesanan ini?"
                        note="Pesanan dibatalkan dan pembeli diberi tahu. Tindakan ini tidak bisa dibatalkan."
                        confirmLabel="Ya, Tolak"
                        onConfirm={() => setOrderStatus(order.id, statusAfterSellerRejects())}
                      >
                        Tolak
                      </ConfirmBtn>
                      <Btn onClick={() => setOrderStatus(order.id, statusAfterSellerAccepts())}>Terima &amp; Proses</Btn>
                    </>
                  ) : null}
                  {order.status === 'diproses' ? (
                    <Btn onClick={() => setOrderStatus(order.id, 'dikirim')}>Kirim Pesanan</Btn>
                  ) : null}
                  {order.status === 'dikirim' ? <Badge tone="info">Menunggu konfirmasi pembeli</Badge> : null}
                  {order.status === 'selesai' ? <Badge>Pesanan selesai</Badge> : null}
                  {order.status === 'dibatalkan' ? <Badge tone="amber">Ditolak penjual</Badge> : null}
                </div>
              </Card>
            ))
          )}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const SellerProducts = () => {
  const history = useHistory();
  const { sellerId } = useSeller();
  const [products, setProducts] = useState<Product[]>(() => productRepo.bySeller(sellerId));

  const changeStock = (id: string, next: number) => {
    productRepo.setStock(id, next);
    setProducts(productRepo.bySeller(sellerId));
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Kelola Produk</h1>
            <button
              type="button"
              onClick={() => history.push('/seller/add')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 700, minHeight: 44 }}
            >
              Tambah
            </button>
          </div>

          {products.length === 0 ? (
            <Empty title="Belum ada produk" note="Tambah produk pertamamu." />
          ) : (
            products.map((p) => (
              <Card key={p.id} style={{ marginTop: 12 }}>
                <Row>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={p.image} alt="" width={48} height={48} style={{ borderRadius: 12, objectFit: 'cover' }} loading="lazy" decoding="async" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{p.name}</p>
                      <p className="ff-muted" style={{ margin: 0, fontSize: 12 }}>
                        {rupiah(p.price)}/{p.unit} · {p.sold} terjual
                      </p>
                    </div>
                  </div>
                  {p.stock <= 0 ? <Badge tone="amber">Habis</Badge> : <Badge>Stok {p.stock}</Badge>}
                </Row>
                <div className="ff-row" style={{ marginTop: 12, gap: 8 }}>
                  <button type="button" className="ff-chip" onClick={() => changeStock(p.id, p.stock - 5)}>− 5</button>
                  <button type="button" className="ff-chip" onClick={() => changeStock(p.id, p.stock + 5)}>+ 5</button>
                  <button
                    type="button"
                    className="ff-chip"
                    onClick={() => history.push(`/product/${p.id}`)}
                  >
                    Lihat Halaman
                  </button>
                </div>
              </Card>
            ))
          )}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const SellerAddProduct = () => {
  const history = useHistory();
  const { user } = useShop();
  const { sellerId } = useSeller();
  const [form, setForm] = useState({
    name: '',
    category: 'Sayuran',
    price: '',
    unit: 'kg',
    stock: '',
    weight: '1000',
    organic: true,
  });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const stockRef = useRef<HTMLInputElement>(null);

  const nameInvalid = Boolean(error) && !form.name.trim();
  const priceInvalid = Boolean(error) && Number(form.price) <= 0;
  const stockInvalid = Boolean(error) && Number(form.stock) <= 0;

  const submit = () => {
    const firstInvalid = !form.name.trim() ? nameRef : Number(form.price) <= 0 ? priceRef : Number(form.stock) <= 0 ? stockRef : null;
    if (firstInvalid) {
      setError('Nama, harga di atas 0, dan stok wajib diisi.');
      // Fokus ke kolom bermasalah pertama supaya pengguna keyboard tidak tersesat.
      firstInvalid.current?.focus();
      return;
    }
    setError('');
    productRepo.add({
      id: `c${Date.now()}`,
      sellerId,
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock),
      weightGram: Number(form.weight) || 1000,
      organic: form.organic,
      image: '/product-1.jpg',
      description: 'Produk baru dari ' + user.name + '.',
      sold: 0,
      reviews: 0,
    });
    setSaved(true);
    setTimeout(() => history.replace('/seller/products'), 700);
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Tambah Produk</h1>
          </div>

          <div
            className="ff-card"
            style={{
              marginTop: 16,
              borderStyle: 'dashed',
              borderColor: 'var(--ff-primary)',
              textAlign: 'center',
              color: 'var(--ff-muted)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--ff-primary-text)' }}>Tambah Foto Produk</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>
              Unggah foto menyusul. Sampai itu siap, produk memakai foto bawaan.
            </p>
          </div>

          <div className="ff-stack" style={{ marginTop: 16 }}>
            <Field label="Nama Produk">
              <input
                className="ff-input"
                ref={nameRef}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Tomat Ceri"
                aria-invalid={nameInvalid}
                aria-describedby={nameInvalid ? 'add-product-error' : undefined}
              />
            </Field>
            <Field label="Kategori">
              <select className="ff-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div className="ff-grid">
              <Field label="Harga per Satuan">
                <input
                  className="ff-input"
                  inputMode="numeric"
                  ref={priceRef}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="30000"
                  aria-invalid={priceInvalid}
                  aria-describedby={priceInvalid ? 'add-product-error' : undefined}
                />
              </Field>
              <Field label="Satuan">
                <select className="ff-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {['kg', 'ikat', 'pack', 'botol', 'butir'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="ff-grid">
              <Field label="Stok Tersedia">
                <input
                  className="ff-input"
                  inputMode="numeric"
                  ref={stockRef}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="80"
                  aria-invalid={stockInvalid}
                  aria-describedby={stockInvalid ? 'add-product-error' : undefined}
                />
              </Field>
              <Field label="Berat Pengiriman (g)">
                <input className="ff-input" inputMode="numeric" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </Field>
            </div>

            <Card>
              <Row>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>Produk Organik</p>
                  <p className="ff-muted" style={{ margin: 0, fontSize: 12 }}>Apakah bebas pestisida kimia?</p>
                </div>
                {/* Target sentuh 44px: track 48×28 digambar di dalam tombol yang lebih tinggi. */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.organic}
                  onClick={() => setForm({ ...form, organic: !form.organic })}
                  style={{
                    width: 52,
                    height: 44,
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 2,
                      width: 48,
                      height: 28,
                      borderRadius: 14,
                      background: form.organic ? 'var(--ff-primary-strong)' : 'var(--ff-line)',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: form.organic ? 23 : 3,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: 'var(--ff-card)',
                        transition: 'left 0.15s',
                      }}
                    />
                  </span>
                </button>
              </Row>
            </Card>

            {error ? (
              <p id="add-product-error" role="alert" style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>
                {error}
              </p>
            ) : null}
            <Btn onClick={submit} disabled={saved}>{saved ? 'Tersimpan ✓' : 'Simpan Produk'}</Btn>
            <span className="ff-sr" role="status">{saved ? 'Produk tersimpan' : ''}</span>
          </div>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
