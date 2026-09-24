import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from '../router';
import { CATEGORIES, PRODUCTS } from '../../data/dto/catalog';
import { greetingOf } from '../../core/entities/format';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../components/ShopProvider';
import { Chip, Empty } from '../components/ui';

export const Home = () => {
  const history = useHistory();
  const { user, cartCount } = useShop();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === 'Semua' || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 4);

  const categories = PRODUCTS.slice(0, 5).map((p) => p.category).filter((c, i, arr) => arr.indexOf(c) === i);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <div>
              <p className="ff-muted" style={{ margin: 0, fontSize: 14 }}>{greetingOf()},</p>
              <h1 className="ff-title" style={{ fontSize: 20 }}>{user.name}</h1>
            </div>
            <button
              type="button"
              className="ff-chip"
              onClick={() => history.push('/notifications')}
              aria-label="Notifikasi"
              style={{ width: 44, padding: 0, borderRadius: 22 }}
            >
              🔔
            </button>
          </div>

          <div style={{ position: 'relative', marginTop: 16 }}>
            <input
              className="ff-input"
              placeholder="Cari wortel, telur, kopi…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari produk"
            />
          </div>

          <div
            className="ff-card"
            style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, #5b8c2a, #3b5c14)',
              border: 'none',
              color: '#fff',
            }}
          >
            <span className="ff-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              Panen hari ini
            </span>
            <p style={{ margin: '10px 0 4px', fontWeight: 700, fontSize: 18 }}>
              Diskon 10% pakai kode PANEN10
            </p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>Berlaku untuk semua penjual.</p>
          </div>

          <div className="ff-chip-row" style={{ marginTop: 20 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <div className="ff-row" style={{ marginTop: 20 }}>
            <h2 className="ff-section" style={{ margin: 0 }}>Produk Populer</h2>
            <button
              type="button"
              onClick={() => history.push('/explore')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontWeight: 600, minHeight: 44 }}
            >
              Lihat Semua
            </button>
          </div>

          {filtered.length === 0 ? (
            <Empty title="Tidak ada produk" note="Coba kata kunci atau kategori lain." />
          ) : (
            <div className="ff-grid" style={{ marginTop: 12 }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <h2 className="ff-section">Kategori</h2>
          <div className="ff-chip-row">
            {categories.map((c) => (
              <Chip
                key={c}
                onClick={() => {
                  setCategory(c);
                  history.push('/explore');
                }}
              >
                {c}
              </Chip>
            ))}
          </div>

          {cartCount > 0 ? (
            <div
              style={{
                position: 'fixed',
                left: 20,
                right: 20,
                bottom: 'calc(72px + env(safe-area-inset-bottom))',
                background: 'var(--ff-primary)',
                color: '#fff',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--ff-shadow)',
                zIndex: 20,
              }}
            >
              <span style={{ fontWeight: 600 }}>{cartCount} item di keranjang</span>
              <button
                type="button"
                onClick={() => history.push('/tabs/cart')}
                style={{ background: '#fff', color: 'var(--ff-primary)', border: 'none', borderRadius: 12, padding: '8px 14px', fontWeight: 700 }}
              >
                Lihat
              </button>
            </div>
          ) : null}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Explore = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === 'Semua' || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <input
            className="ff-input"
            placeholder="Cari produk"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari produk"
          />
          <div className="ff-chip-row" style={{ marginTop: 16 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <p className="ff-muted" style={{ fontSize: 13, marginTop: 12 }}>
            {filtered.length} produk ditemukan
          </p>

          {filtered.length === 0 ? (
            <Empty title="Produk tidak ditemukan" note="Coba ubah kata kunci atau kategori." />
          ) : (
            <div className="ff-grid" style={{ marginTop: 8 }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
