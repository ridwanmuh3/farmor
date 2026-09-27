import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../router';
import { rupiah, tanggal } from '../../core/entities/format';
import type { OrderStatus } from '../../core/entities/types';
import { useShop } from '../components/ShopProvider';
import { STATUS_LABEL, STATUS_STYLE } from '../components/selectors';
import { Btn, Card, ConfirmBtn, Empty, Row } from '../components/ui';

const TABS: { id: 'semua' | OrderStatus; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'dibayar', label: 'Diproses' },
  { id: 'dikirim', label: 'Dikirim' },
  { id: 'selesai', label: 'Selesai' },
];

export const OrderHistory = () => {
  const history = useHistory();
  const { orders, setOrderStatus } = useShop();
  const [tab, setTab] = useState<'semua' | OrderStatus>('semua');

  const filtered = tab === 'semua' ? orders : orders.filter((o) => o.status === tab);

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Riwayat Pesanan</h1>
          </div>

          <div className="ff-chip-row" style={{ marginTop: 16 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="ff-chip"
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Empty title="Belum ada pesanan" note="Pesanan yang sudah dibayar muncul di sini." />
          ) : (
            filtered.map((order) => {
              const style = STATUS_STYLE[order.status];
              return (
                <Card key={order.id} style={{ marginTop: 12 }}>
                  <Row>
                    <span style={{ fontWeight: 600 }}>{order.sellerName}</span>
                    <span className="ff-badge" style={{ background: style.bg, color: style.fg }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </Row>
                  <p className="ff-muted" style={{ margin: '4px 0 8px', fontSize: 12 }}>
                    {order.invoice} · {tanggal(order.createdAt)}
                  </p>
                  <div className="ff-divider" />
                  {order.items.map((item) => (
                    <Row key={item.productId} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 13, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img
                          src={item.image}
                          alt=""
                          width={36}
                          height={36}
                          style={{ borderRadius: 10, objectFit: 'cover' }}
                          loading="lazy"
                          decoding="async"
                        />
                        {item.name} × {item.qty} {item.unit}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{rupiah(item.price * item.qty)}</span>
                    </Row>
                  ))}
                  <div className="ff-divider" />
                  <Row>
                    <span className="ff-muted" style={{ fontSize: 13 }}>Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)' }}>
                      {rupiah(order.subtotal + order.shipping - order.discount)}
                    </span>
                  </Row>
                  <div className="ff-row" style={{ marginTop: 12, gap: 8 }}>
                    <Btn variant="ghost" onClick={() => history.push(`/tracking/${order.id}`)}>Lacak</Btn>
                    {order.status === 'dikirim' ? (
                      <ConfirmBtn
                        title="Pesanan sudah diterima?"
                        note="Pesanan ditandai selesai dan pembeli berhenti bisa mengonfirmasi ulang."
                        confirmLabel="Ya, Diterima"
                        onConfirm={() => setOrderStatus(order.id, 'selesai')}
                      >
                        Pesanan Diterima
                      </ConfirmBtn>
                    ) : (
                      <Btn onClick={() => history.push(`/orders/${order.id}`)}>Detail</Btn>
                    )}
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

export const OrderDetail = () => {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const { orders, setOrderStatus } = useShop();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <IonPage>
        <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
          <div className="ff-screen" style={{ paddingTop: 24 }}>
            <Empty title="Pesanan tidak ditemukan" note="Mungkin sudah dihapus." />
            <Btn variant="ghost" onClick={() => history.replace('/orders')}>Ke Riwayat</Btn>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const style = STATUS_STYLE[order.status];
  const total = order.subtotal + order.shipping - order.discount;

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Detail Pesanan</h1>
          </div>

          <Card style={{ marginTop: 16 }}>
            <Row>
              <span style={{ fontWeight: 700 }}>{order.sellerName}</span>
              <span className="ff-badge" style={{ background: style.bg, color: style.fg }}>
                {STATUS_LABEL[order.status]}
              </span>
            </Row>
            <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
              {order.invoice} · {tanggal(order.createdAt)}
            </p>
          </Card>

          <h2 className="ff-section">Produk</h2>
          <Card>
            {order.items.map((item) => (
              <Row key={item.productId} style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>{item.name} × {item.qty} {item.unit}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{rupiah(item.price * item.qty)}</span>
              </Row>
            ))}
          </Card>

          <h2 className="ff-section">Pengiriman</h2>
          <Card>
            <p style={{ margin: 0, fontWeight: 600 }}>{order.address.recipient} · {order.address.phone}</p>
            <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{order.address.line}</p>
            {order.address.note ? (
              <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 12 }}>Catatan: {order.address.note}</p>
            ) : null}
          </Card>

          <h2 className="ff-section">Pembayaran</h2>
          <Card>
            <Row><span className="ff-muted">Subtotal</span><span>{rupiah(order.subtotal)}</span></Row>
            <Row style={{ marginTop: 8 }}><span className="ff-muted">Ongkir</span><span>{rupiah(order.shipping)}</span></Row>
            {order.discount > 0 ? (
              <Row style={{ marginTop: 8 }}>
                <span className="ff-muted">Diskon</span>
                <span style={{ color: 'var(--ff-success)' }}>-{rupiah(order.discount)}</span>
              </Row>
            ) : null}
            <div className="ff-divider" />
            <Row>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)' }}>{rupiah(total)}</span>
            </Row>
          </Card>

          <div className="ff-row" style={{ marginTop: 16, gap: 8 }}>
            <Btn variant="ghost" onClick={() => history.push(`/tracking/${order.id}`)}>Lacak Pengiriman</Btn>
            {order.status === 'dikirim' ? (
              <ConfirmBtn
                title="Pesanan sudah diterima?"
                note="Pesanan ditandai selesai dan pembeli berhenti bisa mengonfirmasi ulang."
                confirmLabel="Ya, Diterima"
                onConfirm={() => setOrderStatus(order.id, 'selesai')}
              >
                Pesanan Diterima
              </ConfirmBtn>
            ) : null}
          </div>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

