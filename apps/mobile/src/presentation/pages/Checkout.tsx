import { IonContent, IonPage } from '@ionic/react';
import { useRef, useState } from 'react';
import { useHistory } from '../router';
import type { PaymentMethod } from '../../core/entities/types';
import { rupiah } from '../../core/entities/format';
import { productRepo } from '../../data/repositories';
import { useShop } from '../components/ShopProvider';
import { buildCheckoutPreview, PAYMENT_LABEL } from '../components/selectors';
import { Badge, Btn, Card, Empty, Row } from '../components/ui';

const METHODS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: 'qris', label: 'QRIS', note: 'Scan sekali untuk semua pesanan' },
  { id: 'transfer_bank', label: 'Transfer Bank', note: 'Virtual account BCA, Mandiri, BNI' },
  { id: 'emoney', label: 'E-Money', note: 'GoPay, OVO, DANA, ShopeePay' },
];

export const Checkout = () => {
  const history = useHistory();
  const { cart, address, discount, promo, applyPromo, removePromo, checkout } = useShop();
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  const preview = buildCheckoutPreview(cart, productRepo.all(), discount);

  if (preview.orders.length === 0) {
    return (
      <IonPage>
        <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
          <div className="ff-screen" style={{ paddingTop: 24 }}>
            <Empty title="Tidak ada yang dibayar" note="Keranjang kosong. Tambahkan produk dulu." />
            <Btn variant="ghost" onClick={() => history.replace('/tabs/cart')}>Ke Keranjang</Btn>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const pay = () => {
    setBusy(true);
    setFailed(false);
    // ponytail: simulasi webhook Midtrans; ganti ke snap token saat gateway ada
    setTimeout(() => {
      const orders = checkout(method);
      setBusy(false);
      if (orders.length === 0) {
        setFailed(true);
        return;
      }
      history.replace(`/receipt/${orders[0].groupId}`);
    }, 600);
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Checkout</h1>
          </div>

          <Card style={{ marginTop: 16 }}>
            <Row>
              <span style={{ fontWeight: 700 }}>Alamat Pengiriman</span>
              <button
                type="button"
                onClick={() => history.push('/addresses')}
                style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, minHeight: 44 }}
              >
                Ubah
              </button>
            </Row>
            <p style={{ margin: '6px 0 0', fontWeight: 600 }}>
              {address.recipient} · {address.phone}
            </p>
            <p className="ff-muted" style={{ margin: 0, fontSize: 13 }}>{address.line}</p>
          </Card>

          <h2 className="ff-section">Ringkasan Pesanan</h2>
          {preview.orders.map((group) => (
            <Card key={group.sellerId} style={{ marginBottom: 12 }}>
              <Row>
                <span style={{ fontWeight: 600 }}>{group.sellerName}</span>
                <Badge>{group.sellerCity}</Badge>
              </Row>
              <div className="ff-divider" />
              {group.items.map((item) => (
                <Row key={item.productId} style={{ alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14 }}>
                    {item.name} <span className="ff-muted">× {item.qty} {item.unit}</span>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{rupiah(item.price * item.qty)}</span>
                </Row>
              ))}
              <div className="ff-divider" />
              <Row>
                <span className="ff-muted" style={{ fontSize: 13 }}>Ongkir</span>
                <span style={{ fontSize: 13 }}>{rupiah(group.shipping)}</span>
              </Row>
            </Card>
          ))}

          <Card>
            <span className="ff-label">Kode Promo</span>
            {promo ? (
              <Row>
                <Badge tone="soft">{promo} aktif</Badge>
                <button
                  type="button"
                  onClick={removePromo}
                  style={{ background: 'none', border: 'none', color: 'var(--ff-danger)', fontWeight: 600, minHeight: 44 }}
                >
                  Hapus
                </button>
              </Row>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="ff-input"
                  ref={codeRef}
                  placeholder="PANEN10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  aria-label="Kode promo"
                  aria-invalid={Boolean(promoError)}
                  aria-describedby={promoError ? 'promo-error' : undefined}
                />
                <button
                  type="button"
                  className="ff-chip"
                  onClick={() => {
                    const ok = applyPromo(code);
                    setPromoError(ok ? '' : 'Kode promo tidak dikenal.');
                    if (!ok) codeRef.current?.focus();
                  }}
                >
                  Pakai
                </button>
              </div>
            )}
            {promoError ? (
              <p id="promo-error" role="alert" style={{ color: 'var(--ff-danger)', fontSize: 13, margin: '8px 0 0' }}>
                {promoError}
              </p>
            ) : null}
          </Card>

          <h2 className="ff-section">Metode Pembayaran</h2>
          <div className="ff-stack">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                aria-pressed={method === m.id}
                className="ff-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderWidth: 2,
                  borderColor: method === m.id ? 'var(--ff-primary)' : 'var(--ff-line)',
                  background: method === m.id ? 'var(--ff-primary-soft)' : 'var(--ff-card)',
                  minHeight: 44,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{m.label}</p>
                <p className="ff-muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{m.note}</p>
              </button>
            ))}
          </div>

          <Card style={{ marginTop: 16 }}>
            <Row>
              <span className="ff-muted">Subtotal</span>
              <span>{rupiah(preview.subtotal)}</span>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <span className="ff-muted">Ongkir</span>
              <span>{rupiah(preview.shipping)}</span>
            </Row>
            {preview.discount > 0 ? (
              <Row style={{ marginTop: 8 }}>
                <span className="ff-muted">Diskon</span>
                <span style={{ color: 'var(--ff-success)' }}>-{rupiah(preview.discount)}</span>
              </Row>
            ) : null}
            <div className="ff-divider" />
            <Row>
              <span style={{ fontWeight: 700 }}>Total Bayar</span>
              <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)', fontSize: 18 }}>{rupiah(preview.total)}</span>
            </Row>
          </Card>

          {failed ? (
            <p role="alert" style={{ color: 'var(--ff-danger)', fontSize: 13 }}>
              Pembayaran gagal. Coba lagi atau pilih metode lain.
            </p>
          ) : null}

          <p className="ff-muted" style={{ fontSize: 12 }}>
            Dibayar dengan {PAYMENT_LABEL[method]}. Pesanan akan dipisah otomatis untuk tiap penjual.
          </p>

          <Btn onClick={pay} disabled={busy}>
            {busy ? 'Memproses…' : `Bayar ${rupiah(preview.total)}`}
          </Btn>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
