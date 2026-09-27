import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { CheckCircle, Package, Tag, Truck } from 'lucide-react';
import { useHistory } from '../router';
import type { ChatBubble, NotificationItem } from '../../core/entities/types';
import { PRODUCTS, SELLERS } from '../../data/dto/catalog';
import { rupiah } from '../../core/entities/format';
import { chatRepo } from '../../data/repositories';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../components/ShopProvider';
import { Btn, Card, Empty, Row, Thumb } from '../components/ui';

type Icon = typeof Truck;

/** Notifikasi mockup: dua kelompok waktu, tiap baris punya ikon bertone. */
const SEED: (NotificationItem & { group: 'Hari Ini' | 'Kemarin'; icon: Icon })[] = [
  {
    id: 'n1',
    group: 'Hari Ini',
    icon: Truck,
    title: 'Status Pengiriman',
    note: 'Pesanan #INV/2026/09/001 sedang dikirim oleh kurir.',
    at: '10:30',
    tone: 'success',
  },
  {
    id: 'n2',
    group: 'Hari Ini',
    icon: Tag,
    title: 'Promo Spesial',
    note: 'Flash Sale! Diskon 30% sayuran organik hari ini saja.',
    at: '08:15',
    tone: 'amber',
  },
  {
    id: 'n3',
    group: 'Kemarin',
    icon: Package,
    title: 'Produk Baru Penjual',
    note: 'Pak Harto menambahkan produk baru: Tomat Ceri.',
    at: '16:20',
    tone: 'info',
  },
  {
    id: 'n4',
    group: 'Kemarin',
    icon: CheckCircle,
    title: 'Pesanan Selesai',
    note: 'Pesanan #INV/2026/08/098 telah diterima oleh pembeli.',
    at: '09:05',
    tone: 'success',
  },
];

export const Notifications = () => {
  const history = useHistory();
  const [items, setItems] = useState(SEED);
  const tones: Record<NotificationItem['tone'], [string, string]> = {
    info: ['var(--ff-info-soft)', 'var(--ff-info)'],
    amber: ['var(--ff-amber-soft)', 'var(--ff-amber)'],
    success: ['var(--ff-success-soft)', 'var(--ff-success)'],
  };
  const groups: ('Hari Ini' | 'Kemarin')[] = ['Hari Ini', 'Kemarin'];

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Notifikasi</h1>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => setItems([])}
                style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, minHeight: 44 }}
              >
                Tandai Dibaca
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <Empty title="Tidak ada notifikasi" note="Kabar pesanan dan promo muncul di sini." />
          ) : (
            groups.map((group) => {
              const rows = items.filter((n) => n.group === group);
              if (rows.length === 0) return null;
              return (
                <div key={group}>
                  <h2 className="ff-section" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {group}
                  </h2>
                  {rows.map((n) => {
                    const [bg, fg] = tones[n.tone];
                    const Glyph = n.icon;
                    return (
                      <Card key={n.id} style={{ marginTop: 12 }}>
                        <Row style={{ alignItems: 'flex-start' }}>
                          <span
                            className="ff-badge"
                            style={{ background: bg, color: fg, display: 'inline-flex', padding: 8 }}
                          >
                            <Glyph size={16} aria-hidden />
                          </span>
                          <div style={{ flex: 1 }}>
                            <Row>
                              <span style={{ fontWeight: 600 }}>{n.title}</span>
                              <span className="ff-muted" style={{ fontSize: 12 }}>{n.at}</span>
                            </Row>
                            <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{n.note}</p>
                          </div>
                        </Row>
                      </Card>
                    );
                  })}
                </div>
              );
            })
          )}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Wishlist = () => {
  const history = useHistory();
  const { cart, wishlist, toggleWish } = useShop();
  const products = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Produk Favorit</h1>
          </div>

          {products.length === 0 ? (
            <Empty title="Belum ada favorit" note="Tekan hati di halaman produk untuk menyimpan." />
          ) : (
            <div className="ff-grid" style={{ marginTop: 16 }}>
              {products.map((p) => (
                <div key={p.id} style={{ position: 'relative' }}>
                  <ProductCard product={p} />
                  {/* Hit area 44px di sudut; lingkaran visual 32px di tengahnya. */}
                  <button
                    type="button"
                    aria-label={`Hapus ${p.name} dari favorit`}
                    onClick={() => toggleWish(p.id)}
                    className="ff-touch"
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: 'var(--ff-card)',
                        color: 'var(--ff-danger)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ♥
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <Card style={{ marginTop: 16 }}>
            <p className="ff-muted" style={{ margin: 0, fontSize: 13 }}>
              {cart.length} produk sudah di keranjang. Tekan hati untuk mengubah favorit.
            </p>
          </Card>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

/** Chat penjual: header, kartu tawaran produk, gelembung pesan, dan kolom kirim. */
export const ChatTeaser = () => {
  const history = useHistory();
  const { addToCart, cart } = useShop();
  const [messages, setMessages] = useState<ChatBubble[]>(() => chatRepo.get());
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const seller = SELLERS.find((s) => s.id === 's1')!;
  const offer = PRODUCTS.find((p) => p.id === 'p1')!;
  const inCart = cart.some((i) => i.productId === offer.id);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages(chatRepo.append(messages, { from: 'me', text }));
    setDraft('');
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <Thumb src={seller.avatar ?? ''} size={36} radius={18} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{seller.owner} ({seller.name})</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ff-success)' }}>● Online</p>
            </div>
          </div>

          <div className="ff-card" style={{ marginTop: 16 }}>
            <Row>
              <Thumb src={offer.image} size={48} radius={12} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{offer.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ff-primary-text)', fontWeight: 700 }}>
                  {rupiah(offer.price)}/{offer.unit}
                </p>
              </div>
              <Btn
                variant="ghost"
                style={{ width: 'auto', padding: '0 14px', minHeight: 44 }}
                onClick={() => {
                  addToCart(offer.id);
                  setNote(`${offer.name} masuk keranjang.`);
                }}
              >
                {inCart ? 'Tambah Lagi' : 'Tawarkan'}
              </Btn>
            </Row>
          </div>

          {note ? (
            <p role="status" style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ff-success)' }}>
              {note}
            </p>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            {messages.map((m) => {
              const mine = m.from === 'me';
              return (
                <div
                  key={m.id}
                  style={{ display: 'flex', gap: 8, justifyContent: mine ? 'flex-end' : 'flex-start' }}
                >
                  {!mine ? <Thumb src={seller.avatar ?? ''} size={28} radius={14} /> : null}
                  <div style={{ maxWidth: '78%' }}>
                    <div
                      style={{
                        background: mine ? 'var(--ff-primary-strong)' : 'var(--ff-card)',
                        color: mine ? 'var(--ff-on-primary)' : 'var(--ff-text)',
                        border: mine ? 'none' : '1px solid var(--ff-line)',
                        borderRadius: 16,
                        padding: '10px 12px',
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {m.text}
                    </div>
                    <p
                      className="ff-muted"
                      style={{ margin: '4px 0 0', fontSize: 11, textAlign: mine ? 'right' : 'left' }}
                    >
                      {m.at}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={send} className="ff-row" style={{ gap: 8, marginTop: 20 }}>
            <button
              type="button"
              aria-label="Lampirkan foto"
              className="ff-touch"
              onClick={() => setNote('Lampiran foto belum tersedia. Tulis saja pesannya.')}
              style={{
                width: 44,
                height: 44,
                border: '1px solid var(--ff-line)',
                borderRadius: 22,
                background: 'var(--ff-card)',
                fontSize: 18,
              }}
            >
              <span aria-hidden>📎</span>
            </button>
            <input
              className="ff-input"
              style={{ flex: 1 }}
              placeholder="Ketik pesan..."
              aria-label="Ketik pesan"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Kirim pesan"
              className="ff-touch"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                border: 'none',
                background: 'var(--ff-primary-strong)',
                color: 'var(--ff-on-primary)',
                fontSize: 18,
              }}
            >
              ➤
            </button>
          </form>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

