import { IonContent, IonPage } from '@ionic/react';
import { useRef, useState } from 'react';
import { useHistory } from '../router';
import { rupiah } from '../../core/entities/format';
import { productRepo } from '../../data/repositories';
import { useShop } from '../components/ShopProvider';
import { buildCheckoutPreview } from '../components/selectors';
import { canCheckout } from '../../core/services/inventory';
import { Btn, Confirm, Empty, QtyStepper, Thumb } from '../components/ui';

export const Cart = () => {
  const history = useHistory();
  const { cart, setQty, removeFromCart, clearCart, discount, applyPromo, promo } = useShop();
  const [confirmClear, setConfirmClear] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);

  const preview = buildCheckoutPreview(cart, productRepo.all(), discount);
  const empty = preview.orders.length === 0;
  // Checkout hanya boleh kalau tiap baris masih dalam stok (stok bisa berubah setelah masuk keranjang).
  const stockOk = cart.every((item) => canCheckout(productRepo.byId(item.productId)?.stock ?? 0, item.qty));

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <h1 className="ff-title">Keranjang Saya</h1>
            {!empty ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, minHeight: 44 }}
              >
                Hapus Semua
              </button>
            ) : null}
          </div>

          <Confirm
            open={confirmClear}
            title="Hapus semua item?"
            note="Semua produk di keranjang akan hilang."
            confirmLabel="Ya, Hapus"
            onClose={() => setConfirmClear(false)}
            onConfirm={() => {
              clearCart();
              setConfirmClear(false);
            }}
          />

          {empty ? (
            <Empty title="Keranjang masih kosong" note="Yuk cari hasil tani segar di katalog." />
          ) : (
            <>
              {preview.orders.map((group) => (
                <div key={group.sellerId} className="ff-card" style={{ marginTop: 12 }}>
                  <div className="ff-row">
                    <span style={{ fontWeight: 700 }}>{group.sellerName}</span>
                    <span className="ff-muted" style={{ fontSize: 12 }}>{group.sellerCity}</span>
                  </div>
                  <div className="ff-divider" />
                  {group.items.map((item) => {
                    const product = productRepo.byId(item.productId);
                    const stock = product?.stock ?? item.qty;
                    return (
                      <div key={item.productId} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                        <Thumb src={item.image} size={64} />
                        <div style={{ flex: 1 }}>
                          <button
                            type="button"
                            onClick={() => history.push(`/product/${item.productId}`)}
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
                            {item.name}
                          </button>
                          <p className="ff-muted" style={{ margin: '2px 0 8px', fontSize: 13 }}>
                            {rupiah(item.price)}/{item.unit} · stok {stock}
                          </p>
                          <div className="ff-row">
                            <QtyStepper qty={item.qty} max={stock} onChange={(n) => setQty(item.productId, n)} />
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              aria-label={`Hapus ${item.name}`}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--ff-primary-text)',
                                fontWeight: 600,
                                minHeight: 44,
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="ff-card" style={{ marginTop: 12 }}>
                <div className="ff-row" style={{ marginBottom: 12, gap: 8 }}>
                  <input
                    className="ff-input"
                    ref={codeRef}
                    style={{ flex: 1 }}
                    placeholder="Punya kode promo tani?"
                    aria-label="Kode promo"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeError('');
                    }}
                    aria-invalid={Boolean(codeError)}
                    aria-describedby={codeError ? 'cart-code-error' : undefined}
                  />
                  <button
                    type="button"
                    className="ff-btn"
                    style={{ width: 'auto', padding: '0 18px', minHeight: 44 }}
                    onClick={() => {
                      if (applyPromo(code)) {
                        setCode('');
                        setCodeError('');
                      } else {
                        setCodeError('Kode promo tidak dikenal.');
                        codeRef.current?.focus();
                      }
                    }}
                  >
                    Terapkan
                  </button>
                </div>
                {codeError ? (
                  <p id="cart-code-error" role="alert" style={{ color: 'var(--ff-danger)', fontSize: 12, margin: '0 0 8px' }}>
                    {codeError}
                  </p>
                ) : null}
                {promo ? (
                  <p role="status" style={{ color: 'var(--ff-success)', fontSize: 12, margin: '0 0 8px' }}>
                    Kode {promo} dipakai.
                  </p>
                ) : null}
                <div className="ff-row">
                  <span className="ff-muted">Subtotal ({preview.qty} item)</span>
                  <span style={{ fontWeight: 600 }}>{rupiah(preview.subtotal)}</span>
                </div>
                <div className="ff-row" style={{ marginTop: 8 }}>
                  <span className="ff-muted">Ongkos kirim ({preview.orders.length} penjual)</span>
                  <span style={{ fontWeight: 600 }}>{rupiah(preview.shipping)}</span>
                </div>
                {preview.discount > 0 ? (
                  <div className="ff-row" style={{ marginTop: 8 }}>
                    <span className="ff-muted">Diskon</span>
                    <span style={{ fontWeight: 600, color: 'var(--ff-success)' }}>-{rupiah(preview.discount)}</span>
                  </div>
                ) : null}
                <div className="ff-divider" />
                <div className="ff-row">
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)' }}>{rupiah(preview.total)}</span>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <Btn disabled={!stockOk} onClick={() => history.push('/checkout')}>
                  Lanjut Bayar
                </Btn>
              </div>
              <p className="ff-muted" style={{ fontSize: 12, textAlign: 'center' }}>
                {stockOk
                  ? 'Dibayar sekali, pesanan dipisah per penjual.'
                  : 'Ada produk yang melebihi stok. Kurangi jumlahnya dulu.'}
              </p>
            </>
          )}
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
