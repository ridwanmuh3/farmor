import { useHistory } from '../router';
import type { Product } from '../../core/entities/types';
import { rupiah } from '../../core/entities/format';
import { useShop } from './ShopProvider';
import { Badge } from './ui';

export const ProductCard = ({ product, onOpen }: { product: Product; onOpen?: () => void }) => {
  const { addToCart } = useShop();
  const history = useHistory();
  const soldOut = product.stock <= 0;

  return (
    <div className="ff-card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <img
        src={product.image}
        alt={product.name}
        style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 14, background: 'var(--ff-line)' }}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {product.organic ? <Badge>Organik</Badge> : null}
        {soldOut ? <Badge tone="amber">Stok habis</Badge> : null}
      </div>
      <button
        type="button"
        onClick={onOpen ?? (() => history.push(`/product/${product.id}`))}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {product.name}
      </button>
      <span className="ff-muted" style={{ fontSize: 12 }}>{product.sold} terjual</span>
      <div className="ff-row">
        <span style={{ fontWeight: 700 }}>
          {rupiah(product.price)}
          <span className="ff-muted" style={{ fontSize: 12, fontWeight: 500 }}>/{product.unit}</span>
        </span>
        <button
          type="button"
          aria-label={`Tambah ${product.name} ke keranjang`}
          className="ff-touch"
          disabled={soldOut}
          onClick={() => addToCart(product.id)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: 'none',
            background: soldOut ? 'var(--ff-line)' : 'var(--ff-primary)',
            color: '#fff',
            fontSize: 18,
            cursor: soldOut ? 'not-allowed' : 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export const ProductRow = ({ product }: { product: Product }) => {
  const history = useHistory();
  return (
    <div className="ff-card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <img
        src={product.image}
        alt=""
        width={64}
        height={64}
        style={{ borderRadius: 16, objectFit: 'cover', background: 'var(--ff-line)' }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
        <p className="ff-muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
          {rupiah(product.price)}/{product.unit} · stok {product.stock}
        </p>
      </div>
      <button type="button" className="ff-chip" onClick={() => history.push(`/product/${product.id}`)}>
        Lihat
      </button>
    </div>
  );
};
