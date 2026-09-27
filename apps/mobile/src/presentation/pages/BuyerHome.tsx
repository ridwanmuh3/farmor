import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useHistory } from '../router';
import { CATEGORIES, PRODUCTS } from '../../data/dto/catalog';
import { greetingOf } from '../../core/entities/format';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../components/ShopProvider';
import { Chip, Empty } from '../components/ui';

/** Chip kategori seperti mockup: tanpa "Semua", default menyaring Sayuran. */
const HOME_CATEGORIES = CATEGORIES.filter((c) => c !== 'Semua');

/** Urutan sortir halaman Jelajah, sesuai mockup. */
const SORTS = ['Terlaris', 'Harga Terendah', 'Organik'] as const;
type Sort = (typeof SORTS)[number];

const sortProducts = (list: typeof PRODUCTS, sort: Sort) => {
  const copy = [...list];
  if (sort === 'Harga Terendah') return copy.sort((a, b) => a.price - b.price);
  if (sort === 'Organik') return copy.filter((p) => p.organic);
  return copy.sort((a, b) => b.sold - a.sold);
};

export const Home = () => {
  const history = useHistory();
  const { user } = useShop();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Sayuran');

  const q = query.trim().toLowerCase();
  const filtered = (
    q
      ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q))
      : PRODUCTS.filter((p) => p.category === category)
  ).slice(0, 4);

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <div>
              <p className="ff-muted" style={{ margin: '0 0 var(--ff-space-1)', fontSize: 14 }}>
                {greetingOf()},
              </p>
              <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)' }}>{user.name}</h1>
            </div>
            <button
              type="button"
              className="ff-touch"
              onClick={() => history.push('/notifications')}
              aria-label="Notifikasi"
              style={{
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 22,
                border: '1px solid var(--ff-line)',
                background: 'var(--ff-card)',
                color: 'var(--ff-text)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} aria-hidden />
            </button>
          </div>

          <input
            className="ff-input"
            style={{ marginTop: 16 }}
            placeholder="Cari sayur, buah, atau beras segar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari produk"
          />

          <div
            className="ff-card"
            style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, var(--ff-primary-strong), var(--ff-primary-deep))',
              border: 'none',
              color: 'var(--ff-on-primary)',
            }}
          >
            <span className="ff-badge" style={{ background: 'var(--ff-primary-soft)', color: 'var(--ff-primary-dark)' }}>
              Promo minggu ini
            </span>
            <p style={{ margin: '10px 0 4px', fontWeight: 700, fontSize: 18 }}>
              Diskon 10% Semua Produk
            </p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
              Pakai kode <strong>PANEN10</strong> di keranjang
            </p>
          </div>

          <div className="ff-chip-row" style={{ marginTop: 20 }}>
            {HOME_CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <div className="ff-row" style={{ marginTop: 20 }}>
            <h2 className="ff-section" style={{ margin: 0 }}>Produk Populer</h2>
            <button
              type="button"
              onClick={() => history.push('/tabs/explore')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, minHeight: 44 }}
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
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Explore = () => {
  const history = useHistory();
  const [sort, setSort] = useState<Sort>('Terlaris');

  const filtered = sortProducts(PRODUCTS, sort);

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button
              type="button"
              className="ff-touch"
              onClick={() => history.goBack()}
              aria-label="Kembali"
              style={{
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 14,
                border: '1px solid var(--ff-line)',
                background: 'var(--ff-card)',
                color: 'var(--ff-text)',
                fontSize: 20,
              }}
            >
              ←
            </button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-hero)', flex: 1 }}>Sayuran Segar</h1>
          </div>

          <div className="ff-chip-row" style={{ marginTop: 16 }}>
            {SORTS.map((s) => (
              <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
                {s}
              </Chip>
            ))}
          </div>

          <div className="ff-grid" style={{ marginTop: 16 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} variant="location" />
            ))}
          </div>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
