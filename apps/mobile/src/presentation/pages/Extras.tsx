import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from '../router';
import type { NotificationItem } from '../../core/entities/types';
import { PRODUCTS } from '../../data/dto/catalog';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../components/ShopProvider';
import { Badge, Btn, Card, Empty, Row } from '../components/ui';

const SEED: NotificationItem[] = [
  { id: 'n1', title: 'Pesanan Dikirim', note: 'Paketmu sedang dalam perjalanan oleh kurir.', at: '10:30', tone: 'info' },
  { id: 'n2', title: 'Promo Spesial', note: 'Diskon 10% pakai kode PANEN10 sampai akhir pekan.', at: '08:15', tone: 'amber' },
  { id: 'n3', title: 'Produk Baru', note: 'Tani Makmur menambah produk: Wortel Organik Segar.', at: 'Kemarin', tone: 'success' },
];

export const Notifications = () => {
  const history = useHistory();
  const [items, setItems] = useState(SEED);
  const tones: Record<NotificationItem['tone'], [string, string]> = {
    info: ['var(--ff-info-soft)', 'var(--ff-info)'],
    amber: ['var(--ff-amber-soft)', 'var(--ff-amber)'],
    success: ['var(--ff-success-soft)', 'var(--ff-success)'],
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 20, flex: 1 }}>Notifikasi</h1>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => setItems([])}
                style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontWeight: 600, minHeight: 44 }}
              >
                Tandai Dibaca
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <Empty title="Tidak ada notifikasi" note="Kabar pesanan dan promo muncul di sini." />
          ) : (
            items.map((n) => {
              const [bg, fg] = tones[n.tone];
              return (
                <Card key={n.id} style={{ marginTop: 12 }}>
                  <Row style={{ alignItems: 'flex-start' }}>
                    <span className="ff-badge" style={{ background: bg, color: fg }}>•</span>
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
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 20, flex: 1 }}>Produk Favorit</h1>
          </div>

          {products.length === 0 ? (
            <Empty title="Belum ada favorit" note="Tekan hati di halaman produk untuk menyimpan." />
          ) : (
            <div className="ff-grid" style={{ marginTop: 16 }}>
              {products.map((p) => (
                <div key={p.id} style={{ position: 'relative' }}>
                  <ProductCard product={p} />
                  <button
                    type="button"
                    aria-label={`Hapus ${p.name} dari favorit`}
                    onClick={() => toggleWish(p.id)}
                    className="ff-touch"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      border: 'none',
                      background: '#fff',
                      color: 'var(--ff-danger)',
                    }}
                  >
                    ♥
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

export const ChatTeaser = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 20, flex: 1 }}>Chat Penjual</h1>
          </div>
          <Card style={{ marginTop: 16 }}>
            <Row>
              <span style={{ fontWeight: 600 }}>Pak Harto</span>
              <Badge tone="soft">Segera</Badge>
            </Row>
            <p className="ff-muted" style={{ margin: '8px 0 0', fontSize: 14 }}>
              Chat dan tawar harga belum tersedia di versi ini. Sementara itu, gunakan catatan di
              checkout untuk permintaan khusus.
            </p>
          </Card>
          <div style={{ marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => history.replace('/tabs/home')}>Kembali ke Beranda</Btn>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

