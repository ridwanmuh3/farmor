import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../router';
import { rupiah, berat } from '../../core/entities/format';
import { productRepo } from '../../data/repositories';
import { useShop } from '../components/ShopProvider';
import { Badge, Btn, QtyStepper, Thumb } from '../components/ui';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const history = useHistory();
  const { addToCart, cart, wishlist, toggleWish } = useShop();
  // Jumlah yang dipilih diingat per produk supaya pilihan pembeli tidak hilang
  // saat sempat membuka halaman lain lalu kembali ke produk yang sama.
  const [qty, setQty] = useState(() => {
    const saved = Number(sessionStorage.getItem(`ff.qty.${id}`));
    return Number.isFinite(saved) && saved > 0 ? saved : 1;
  });
  const [added, setAdded] = useState(false);

  const changeQty = (next: number) => {
    setQty(next);
    sessionStorage.setItem(`ff.qty.${id}`, String(next));
  };

  const product = productRepo.byId(id);

  if (!product) {
    return (
      <IonPage>
        <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
          <div className="ff-screen" style={{ paddingTop: 24 }}>
            <p>Produk tidak ditemukan.</p>
            <Btn variant="ghost" onClick={() => history.replace('/tabs/explore')}>Kembali ke katalog</Btn>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const seller = productRepo.seller(product.sellerId);
  const soldOut = product.stock <= 0;
  const inCart = cart.find((i) => i.productId === product.id)?.qty ?? 0;
  const remaining = Math.max(0, product.stock - inCart);
  const related = productRepo.all().filter((p) => p.category === product.category && p.id !== product.id).slice(0, 2);
  const saved = wishlist.includes(product.id);

  const add = () => {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: 320, objectFit: 'cover' }}
          />
          <button
            type="button"
            className="ff-touch"
            aria-label="Kembali"
            onClick={() => history.goBack()}
            style={{
              position: 'absolute',
              top: 52,
              left: 20,
              width: 44,
              height: 44,
              borderRadius: 22,
              border: 'none',
              background: 'rgba(0,0,0,0.65)',
              color: 'var(--ff-on-primary)',
              fontSize: 20,
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="ff-touch"
            aria-label={saved ? 'Hapus dari favorit' : 'Simpan ke favorit'}
            aria-pressed={saved}
            onClick={() => toggleWish(product.id)}
            style={{
              position: 'absolute',
              top: 52,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: 22,
              border: 'none',
              background: 'rgba(0,0,0,0.65)',
              color: saved ? 'var(--ff-heart-on-dark)' : 'var(--ff-on-primary)',
              fontSize: 18,
            }}
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>

        <div className="ff-screen" style={{ marginTop: -24, position: 'relative' }}>
          <div className="ff-card">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {product.organic ? <Badge>Organik</Badge> : null}
              <Badge tone={soldOut ? 'amber' : 'soft'}>{soldOut ? 'Stok habis' : `Stok ${product.stock} ${product.unit}`}</Badge>
            </div>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-hero)', marginTop: 10 }}>{product.name}</h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ff-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={12} fill="var(--ff-amber)" aria-hidden />
              {seller?.rating.toFixed(1)}
              <span className="ff-muted">({product.reviews} ulasan pembeli)</span>
            </p>
            <div className="ff-divider" />
            <div className="ff-row">
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ff-primary-text)' }}>
                {rupiah(product.price)}
                <span className="ff-muted" style={{ fontSize: 13, fontWeight: 500 }}>/{product.unit}</span>
              </span>
            </div>
          </div>

          <div className="ff-card" style={{ marginTop: 12 }}>
            <div className="ff-row" style={{ alignItems: 'flex-start' }}>
              <Thumb src={seller?.avatar ?? product.image} size={44} radius={22} />
              <div style={{ flex: 1 }}>
                <div className="ff-row">
                  <span style={{ fontWeight: 600 }}>{seller?.owner ?? seller?.name}</span>
                  <Badge>TERVERIFIKASI</Badge>
                </div>
                <p className="ff-muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
                  {seller?.name} · {seller?.city}
                </p>
              </div>
              <button
                type="button"
                aria-label="Chat penjual"
                onClick={() => history.push('/chat')}
                className="ff-touch"
                style={{ padding: 0, border: 'none', background: 'transparent' }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    border: '1px solid var(--ff-line)',
                    background: 'var(--ff-card)',
                    color: 'var(--ff-primary-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MessageCircle size={16} aria-hidden />
                </span>
              </button>
            </div>
          </div>

          <div className="ff-card" style={{ marginTop: 12 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Pilih Jumlah</p>
            <div className="ff-row" style={{ marginTop: 10 }}>
              <QtyStepper qty={qty} max={Math.max(1, remaining)} onChange={changeQty} />
              <span className="ff-muted" style={{ fontSize: 13 }}>
                Stok tersedia: {product.stock} {product.unit}
              </span>
            </div>
          </div>

          <div className="ff-card" style={{ marginTop: 12 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Deskripsi Produk</p>
            <p className="ff-muted" style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.6 }}>
              {product.description}
            </p>
            <p className="ff-muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
              {product.sold} terjual · berat {berat(product.weightGram)} per {product.unit}
            </p>
          </div>

          <div className="ff-row" style={{ marginTop: 16, gap: 12 }}>
            <Btn variant="ghost" onClick={() => history.push('/tabs/cart')} style={{ flex: 0.6 }}>
              Keranjang
            </Btn>
            <Btn onClick={add} disabled={soldOut || remaining <= 0} style={{ flex: 1 }}>
              {soldOut ? 'Stok Habis' : added ? 'Ditambahkan ✓' : '+ Keranjang'}
            </Btn>
          </div>
          <span className="ff-sr" role="status">{added ? 'Ditambahkan ke keranjang' : ''}</span>

          {related.length > 0 ? (
            <>
              <h2 className="ff-section">Produk Serupa</h2>
              <div className="ff-grid">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          ) : null}

          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
