import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from '../router';
import { rupiah, tanggal } from '../../core/entities/format';
import type { Product } from '../../core/entities/types';
import { CATEGORIES } from '../../data/dto/catalog';
import { productRepo } from '../../data/repositories';
import { useShop } from '../components/ShopProvider';
import { STATUS_LABEL, STATUS_STYLE } from '../components/selectors';
import { statusAfterSellerAccepts, statusAfterSellerRejects } from '../../core/services/inventory';
import { Badge, Btn, Card, Empty, Field, Row } from '../components/ui';

const SELLER_ID = 's1';

export const SellerDashboard = () => {
  const history = useHistory();
  const { orders, user } = useShop();
  const mine = orders.filter((o) => o.sellerId === SELLER_ID);
  const active = mine.filter((o) => o.status === 'dibayar' || o.status === 'diproses' || o.status === 'dikirim');
  const revenue = mine
    .filter((o) => o.status !== 'dibatalkan')
    .reduce((sum, o) => sum + o.subtotal, 0);
  const products = productRepo.bySeller(SELLER_ID);

  const stats = [
    { label: 'Pendapatan', value: rupiah(revenue), tone: 'soft' as const },
    { label: 'Pesanan Aktif', value: String(active.length), tone: 'plain' as const },
    { label: 'Produk Aktif', value: String(products.length), tone: 'plain' as const },
    { label: 'Perlu Diproses', value: String(mine.filter((o) => o.status === 'dibayar').length), tone: 'amber' as const },
  ];

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <div>
              <p className="ff-muted" style={{ margin: 0, fontSize: 13 }}>Selamat bertani,</p>
              <h1 className="ff-title" style={{ fontSize: 20 }}>{user.name}</h1>
            </div>
            <Badge>Penjual</Badge>
          </div>

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
          <div className="ff-row" style={{ gap: 8 }}>
            <Btn onClick={() => history.push('/seller/add')}>Tambah Produk</Btn>
            <Btn variant="ghost" onClick={() => history.push('/seller/products')}>Kelola Produk</Btn>
          </div>

          <div className="ff-row" style={{ marginTop: 24 }}>
            <h2 className="ff-section" style={{ margin: 0 }}>Pesanan Terbaru</h2>
            <button
              type="button"
              onClick={() => history.push('/seller/orders')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontWeight: 600, minHeight: 44 }}
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
                    <span style={{ fontWeight: 600 }}>{order.address.recipient}</span>
                    <span className="ff-badge" style={{ background: style.bg, color: style.fg }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </Row>
                  <p className="ff-muted" style={{ margin: '4px 0 8px', fontSize: 12 }}>
                    {order.invoice} · {tanggal(order.createdAt)}
                  </p>
                  {order.items.map((item) => (
                    <p key={item.productId} style={{ margin: 0, fontSize: 13 }}>
                      {item.name} × {item.qty} {item.unit}
                    </p>
                  ))}
                  <div className="ff-divider" />
                  <Row>
                    <span className="ff-muted" style={{ fontSize: 13 }}>Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>{rupiah(order.subtotal)}</span>
                  </Row>
                  <div style={{ marginTop: 12 }}>
                    <Btn onClick={() => history.push('/seller/orders')}>Kelola</Btn>
                  </div>
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
  const [tab, setTab] = useState<'baru' | 'diproses' | 'dikirim' | 'selesai'>('baru');
  const mine = orders.filter((o) => o.sellerId === SELLER_ID);

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
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <h1 className="ff-title" style={{ fontSize: 22 }}>Kelola Pesanan</h1>
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
                  <span style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>{rupiah(order.subtotal)}</span>
                </Row>
                <p className="ff-muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
                  Kirim ke: {order.address.line}
                </p>

                <div className="ff-row" style={{ marginTop: 12, gap: 8 }}>
                  {order.status === 'dibayar' ? (
                    <>
                      <Btn variant="ghost" onClick={() => setOrderStatus(order.id, statusAfterSellerRejects())}>Tolak</Btn>
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
  const [products, setProducts] = useState<Product[]>(() => productRepo.bySeller(SELLER_ID));

  const changeStock = (id: string, next: number) => {
    productRepo.setStock(id, next);
    setProducts(productRepo.bySeller(SELLER_ID));
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 20, flex: 1 }}>Kelola Produk</h1>
            <button
              type="button"
              onClick={() => history.push('/seller/add')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontWeight: 700, minHeight: 44 }}
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
                    <img src={p.image} alt="" width={48} height={48} style={{ borderRadius: 12, objectFit: 'cover' }} />
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

  const submit = () => {
    if (!form.name.trim() || Number(form.price) <= 0 || Number(form.stock) < 0) {
      setError('Nama, harga di atas 0, dan stok wajib diisi.');
      return;
    }
    productRepo.add({
      id: `c${Date.now()}`,
      sellerId: SELLER_ID,
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
    });
    setSaved(true);
    setTimeout(() => history.replace('/seller/products'), 700);
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 20, flex: 1 }}>Tambah Produk</h1>
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
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--ff-primary)' }}>Tambah Foto Produk</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Maksimal 5 foto (JPG, PNG)</p>
          </div>

          <div className="ff-stack" style={{ marginTop: 16 }}>
            <Field label="Nama Produk">
              <input className="ff-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Tomat Ceri" />
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
                <input className="ff-input" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="30000" />
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
                <input className="ff-input" inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="80" />
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
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.organic}
                  onClick={() => setForm({ ...form, organic: !form.organic })}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    border: 'none',
                    background: form.organic ? 'var(--ff-primary)' : 'var(--ff-line)',
                    position: 'relative',
                    cursor: 'pointer',
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
                      background: '#fff',
                      transition: 'left 0.15s',
                    }}
                  />
                </button>
              </Row>
            </Card>

            {error ? <p style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>{error}</p> : null}
            <Btn onClick={submit} disabled={saved}>{saved ? 'Tersimpan ✓' : 'Simpan Produk'}</Btn>
          </div>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
