import type { CSSProperties } from 'react';
import { MapPin, Plus, ShoppingCart, Star } from 'lucide-react';
import { useHistory } from '../router';
import type { Product } from '../../core/entities/types';
import { rupiah, berat } from '../../core/entities/format';
import { productRepo } from '../../data/repositories';
import { useShop } from './ShopProvider';
import { Badge } from './ui';

/**
 * Kartu produk dipakai di Beranda, Jelajah, dan Favorit.
 *
 * Mockup memakai dua bentuk yang berbeda, jadi variannya:
 * - `seller` (Beranda, Favorit): baris penjual + rating bintang.
 * - `location` (Jelajah): berat + kota penjual, tombol keranjang bulat.
 *
 * Peran tipe (lihat --ff-type-* di tokens.css): nama produk 15px/600, harga
 * 15px/700 hijau + angka tabular, metadata 12px.
 *
 * Ritme vertikal memakai kontras rapat/renggang, bukan satu jarak seragam:
 * 4px di dalam grup, 8px antar elemen sekawan, 12px antar grup.
 */
const identityGroup: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ff-space-1)',
  minWidth: 0,
};

const dataGroup: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ff-space-2)',
  minWidth: 0,
};

const price: CSSProperties = {
  fontSize: 'var(--ff-type-body)',
  fontWeight: 700,
  lineHeight: 'var(--ff-leading-tight)',
  color: 'var(--ff-primary-text)',
  minWidth: 0,
};

const unit: CSSProperties = {
  fontSize: 'var(--ff-type-meta)',
  fontWeight: 500,
};

const cartButton: CSSProperties = {
  padding: 0,
  border: 'none',
  background: 'transparent',
};

const cartCircle = (size: number, soldOut: boolean): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: soldOut ? 'var(--ff-line)' : 'var(--ff-primary-strong)',
  color: soldOut ? 'var(--ff-muted)' : 'var(--ff-on-primary)',
});

const nameStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  textAlign: 'left',
  fontFamily: 'inherit',
  fontSize: 'var(--ff-type-body)',
  fontWeight: 600,
  lineHeight: 'var(--ff-leading-tight)',
  /* Sedikit dirapatkan supaya nama panjang dapat ruang sebelum membungkus. */
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  /* Dua baris: nama panjang membungkus, bukan terpotong di satu baris. */
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  overflowWrap: 'break-word',
};

export const ProductCard = ({
  product,
  variant = 'seller',
  onOpen,
}: {
  product: Product;
  variant?: 'seller' | 'location';
  onOpen?: () => void;
}) => {
  const { addToCart } = useShop();
  const history = useHistory();
  const soldOut = product.stock <= 0;
  const seller = productRepo.seller(product.sellerId);
  const open = onOpen ?? (() => history.push(`/product/${product.id}`));

  return (
    <div
      className="ff-card"
      style={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ff-space-3)',
        minWidth: 0,
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        decoding="async"
        loading="lazy"
        style={{
          width: '100%',
          height: 116,
          objectFit: 'cover',
          borderRadius: 14,
          background: 'var(--ff-line)',
          display: 'block',
        }}
      />

      {variant === 'location' ? (
        <>
          <div style={identityGroup}>
            <button type="button" onClick={open} style={nameStyle}>
              {product.name}
            </button>
            <span className="ff-muted" style={{ fontSize: 'var(--ff-type-meta)' }}>
              {berat(product.weightGram)} / {product.unit}
            </span>
          </div>

          <div style={dataGroup}>
            <span className="ff-num" style={price}>
              {rupiah(product.price)}
            </span>
            <div className="ff-row">
              <span
                className="ff-muted"
                style={{
                  fontSize: 'var(--ff-type-meta)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ff-space-1)',
                  minWidth: 0,
                }}
              >
                <MapPin size={12} aria-hidden />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {seller?.city}
                </span>
              </span>
              {/* Hit area 44px (.ff-touch); lingkaran visual 36px di dalamnya. */}
              <button
                type="button"
                aria-label={`Tambah ${product.name} ke keranjang`}
                className="ff-touch"
                disabled={soldOut}
                onClick={() => addToCart(product.id)}
                style={{ ...cartButton, cursor: soldOut ? 'not-allowed' : 'pointer' }}
              >
                <span aria-hidden style={cartCircle(36, soldOut)}>
                  <ShoppingCart size={16} aria-hidden />
                </span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={identityGroup}>
            {product.organic ? <Badge>Organik</Badge> : null}
            <button type="button" onClick={open} style={nameStyle}>
              {product.name}
            </button>
            <span
              className="ff-muted"
              style={{
                fontSize: 'var(--ff-type-meta)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ff-space-1)',
                minWidth: 0,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: 'var(--ff-lime)',
                  display: 'inline-block',
                  flex: '0 0 auto',
                }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {seller?.owner ?? seller?.name}
              </span>
            </span>
          </div>

          <div style={dataGroup}>
            <div className="ff-row">
              <span className="ff-num" style={price}>
                {rupiah(product.price)}
                <span className="ff-muted" style={unit}>
                  /{product.unit}
                </span>
              </span>
              {/* Hit area 44px (.ff-touch); lingkaran visual 34px di dalamnya. */}
              <button
                type="button"
                aria-label={`Tambah ${product.name} ke keranjang`}
                className="ff-touch"
                disabled={soldOut}
                onClick={() => addToCart(product.id)}
                style={{ ...cartButton, cursor: soldOut ? 'not-allowed' : 'pointer' }}
              >
                <span aria-hidden style={cartCircle(34, soldOut)}>
                  <Plus size={18} aria-hidden />
                </span>
              </button>
            </div>
            <span
              className="ff-num"
              style={{
                fontSize: 'var(--ff-type-meta)',
                lineHeight: 'var(--ff-leading-meta)',
                color: 'var(--ff-amber)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ff-space-1)',
              }}
            >
              <Star size={12} fill="var(--ff-amber)" aria-hidden />
              {seller?.rating.toFixed(1)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
