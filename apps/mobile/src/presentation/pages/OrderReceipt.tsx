import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../router';
import { rupiah, tanggal } from '../../core/entities/format';
import { useShop } from '../components/ShopProvider';
import { STATUS_LABEL, PAYMENT_LABEL } from '../components/selectors';
import { Badge, Btn, Card, Empty, Row } from '../components/ui';

export const OrderReceipt = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const history = useHistory();
  const { orders } = useShop();

  const list = orders.filter((o) => o.groupId === groupId);

  if (list.length === 0) {
    return (
      <IonPage>
        <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
          <div className="ff-screen" style={{ paddingTop: 24 }}>
            <Empty title="Pesanan tidak ditemukan" note="Cek riwayat pesanan untuk detail." />
            <Btn variant="ghost" onClick={() => history.replace('/orders')}>Ke Riwayat</Btn>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const total = list.reduce((sum, o) => sum + o.subtotal + o.shipping - o.discount, 0);
  const first = list[0];

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: 'var(--ff-primary-strong)',
              color: 'var(--ff-on-primary)',
              fontSize: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            ✓
          </div>
          <h1 className="ff-title" style={{ marginTop: 16 }}>Pembayaran Berhasil</h1>
          <p className="ff-subtitle">
            {list.length} pesanan dibuat dari {list.length} penjual. Bayar sekali, diproses terpisah.
          </p>

          <Card style={{ marginTop: 24, textAlign: 'left' }}>
            <Row>
              <span className="ff-muted">Total dibayar</span>
              <span style={{ fontWeight: 700, color: 'var(--ff-primary-text)' }}>{rupiah(total)}</span>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <span className="ff-muted">Metode</span>
              <span style={{ fontWeight: 600 }}>{PAYMENT_LABEL[first.payment]}</span>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <span className="ff-muted">Tanggal</span>
              <span>{tanggal(first.createdAt)}</span>
            </Row>
            <div className="ff-divider" />
            <p style={{ margin: 0, fontWeight: 700 }}>Dikirim ke</p>
            <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
              {first.address.recipient} · {first.address.phone}
              <br />
              {first.address.line}
            </p>
          </Card>

          <h2 className="ff-section" style={{ textAlign: 'left' }}>Rincian Penjual</h2>
          {list.map((order) => (
            <Card key={order.id} style={{ textAlign: 'left', marginBottom: 12 }}>
              <Row>
                <span style={{ fontWeight: 600 }}>{order.sellerName}</span>
                <Badge tone="info">{STATUS_LABEL[order.status]}</Badge>
              </Row>
              <p className="ff-muted" style={{ margin: '4px 0 8px', fontSize: 12 }}>{order.invoice}</p>
              {order.items.map((item) => (
                <Row key={item.productId}>
                  <span style={{ fontSize: 13 }}>{item.name} × {item.qty}</span>
                  <span style={{ fontSize: 13 }}>{rupiah(item.price * item.qty)}</span>
                </Row>
              ))}
              <div className="ff-divider" />
              <Row>
                <span className="ff-muted" style={{ fontSize: 12 }}>Subtotal + ongkir</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {rupiah(order.subtotal + order.shipping - order.discount)}
                </span>
              </Row>
            </Card>
          ))}

          <Btn onClick={() => history.replace('/orders')}>Lihat Riwayat Pesanan</Btn>
          <div style={{ height: 8 }} />
          <Btn variant="ghost" onClick={() => history.replace('/tabs/home')}>Kembali ke Beranda</Btn>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

