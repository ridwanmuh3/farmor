import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from '../router';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { isPhone, tanggal } from '../../core/entities/format';
import { useShop } from '../components/ShopProvider';
import { Badge, Btn, Card, Field, Row } from '../components/ui';
import { STATUS_LABEL, STATUS_STYLE } from '../components/selectors';
import type { TrackStep } from '../../core/entities/types';

export const DeliveryTracking = () => {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const { orders } = useShop();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <IonPage>
        <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
          <div className="ff-screen" style={{ paddingTop: 24 }}>
            <p>Belum ada pengiriman untuk dilacak.</p>
            <Btn variant="ghost" onClick={() => history.replace('/orders')}>Ke Riwayat</Btn>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Waktu langkah pertama diturunkan dari tanggal pesanan; langkah berikutnya
  // baru punya keterangan waktu setelah benar-benar terjadi, jadi masih estimasi.
  const paidAt = tanggal(order.createdAt);
  const steps: TrackStep[] = [
    { label: 'Pesanan Dibayar', note: 'Pembayaran terverifikasi', at: paidAt },
    {
      label: 'Sedang Diproses',
      note: `${order.sellerName} menyiapkan pesanan`,
      at: order.status === 'diproses' ? paidAt : 'Menunggu',
    },
    {
      label: 'Dikirim Kurir',
      note: 'Kurir menuju alamat tujuan',
      at: order.status === 'dikirim' || order.status === 'selesai' ? 'Dalam perjalanan' : 'Estimasi 1 hari',
    },
    {
      label: 'Pesanan Tiba',
      note: order.address.line,
      at: order.status === 'selesai' ? 'Selesai' : 'Estimasi besok',
    },
  ];
  const activeIndex =
    order.status === 'selesai' ? 3 : order.status === 'dikirim' ? 2 : order.status === 'diproses' || order.status === 'dibayar' ? 1 : 0;

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Lacak Pengiriman</h1>
          </div>

          <Card style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
            {/* ponytail: peta statis; ganti ke peta hidup saat API kurir & GPS tersedia */}
            <div
              style={{
                height: 160,
                background:
                  'repeating-linear-gradient(45deg, var(--ff-primary-soft) 0 14px, var(--ff-lime-soft) 14px 28px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ff-primary-dark)',
                fontWeight: 600,
              }}
            >
              Peta rute pengiriman
            </div>
            <div style={{ padding: 16 }}>
              <Row>
                <span style={{ fontWeight: 700 }}>Status</span>
                <span className="ff-badge" style={STATUS_STYLE[order.status]}>{STATUS_LABEL[order.status]}</span>
              </Row>
              {order.status === 'dikirim' || order.status === 'selesai' ? (
                <Row style={{ marginTop: 8 }}>
                  <span className="ff-muted" style={{ fontSize: 13 }}>Kurir</span>
                  <span style={{ fontSize: 13 }}>Budi Santoso · B 1234 XYZ</span>
                </Row>
              ) : null}
              <Row style={{ marginTop: 8 }}>
                <span className="ff-muted" style={{ fontSize: 13 }}>Perkiraan tiba</span>
                <span style={{ fontSize: 13 }}>
                  {order.status === 'selesai' ? 'Sudah tiba' : order.status === 'dibatalkan' ? 'Dibatalkan' : order.status === 'dikirim' ? '1 hari lagi' : 'Menunggu dikirim'}
                </span>
              </Row>
            </div>
          </Card>

          <h2 className="ff-section">Riwayat Perjalanan</h2>
          <Card>
            {steps.map((step, i) => {
              const done = i <= activeIndex;
              return (
                <div key={step.label} style={{ display: 'flex', gap: 12, marginBottom: i === steps.length - 1 ? 0 : 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: done ? 'var(--ff-primary)' : 'var(--ff-card)',
                        border: done ? 'none' : '2px solid var(--ff-line)',
                        flex: '0 0 auto',
                      }}
                    />
                    {i < steps.length - 1 ? (
                      <span style={{ flex: 1, width: 2, background: done ? 'var(--ff-primary)' : 'var(--ff-line)', minHeight: 28 }} />
                    ) : null}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: done ? 700 : 500 }}>{step.label}</p>
                    <p className="ff-muted" style={{ margin: '2px 0 0', fontSize: 12 }}>{step.note}</p>
                    <p className="ff-muted" style={{ margin: '2px 0 0', fontSize: 11 }}>{step.at}</p>
                  </div>
                </div>
              );
            })}
          </Card>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const AddressBook = () => {
  const history = useHistory();
  const { addresses, address, selectAddress, addAddress } = useShop();
  const [draft, setDraft] = useState({ label: '', recipient: '', phone: '', line: '' });
  const [saved, setSaved] = useState(false);

  const phoneOk = isPhone(draft.phone);
  const ready = Boolean(draft.label && draft.recipient && draft.line && phoneOk) && !saved;

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>Alamat Pengiriman</h1>
          </div>

          {addresses.map((a) => (
            <Card key={a.id} style={{ marginTop: 12, borderColor: a.id === address.id ? 'var(--ff-primary)' : 'var(--ff-line)', borderWidth: a.id === address.id ? 2 : 1 }}>
              <Row>
                <span style={{ fontWeight: 700 }}>{a.label}</span>
                {a.id === address.id ? <Badge>Utama</Badge> : null}
              </Row>
              <p style={{ margin: '6px 0 0', fontWeight: 600 }}>{a.recipient} · {a.phone}</p>
              <p className="ff-muted" style={{ margin: 0, fontSize: 13 }}>{a.line}</p>
              <div style={{ marginTop: 12 }}>
                <Btn variant="ghost" onClick={() => { selectAddress(a.id); history.goBack(); }}>
                  Kirim ke Alamat Ini
                </Btn>
              </div>
            </Card>
          ))}

          <h2 className="ff-section">Tambah Alamat</h2>
          <Card>
            <div className="ff-stack">
              <Field label="Label">
                <input className="ff-input" placeholder="Rumah, Kantor" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
              </Field>
              <Field label="Nama Penerima">
                <input className="ff-input" value={draft.recipient} onChange={(e) => setDraft({ ...draft, recipient: e.target.value })} />
              </Field>
              <Field label="Nomor HP">
                <input
                  className="ff-input"
                  inputMode="tel"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  placeholder="081234567890"
                  aria-invalid={!phoneOk}
                  aria-describedby={!phoneOk ? 'address-phone-error' : undefined}
                />
              </Field>
              {!phoneOk ? (
                <p id="address-phone-error" role="alert" style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>
                  Nomor HP wajib diisi, contoh 081234567890.
                </p>
              ) : null}
              <Field label="Alamat Lengkap">
                <input className="ff-input" value={draft.line} onChange={(e) => setDraft({ ...draft, line: e.target.value })} />
              </Field>
              <Btn
                disabled={!ready}
                onClick={() => {
                  addAddress({
                    id: `a${Date.now()}`,
                    label: draft.label,
                    recipient: draft.recipient,
                    phone: draft.phone,
                    line: draft.line,
                  });
                  setSaved(true);
                }}
              >
                {saved ? 'Alamat Tersimpan ✓' : 'Simpan Alamat'}
              </Btn>
              <span className="ff-sr" role="status">{saved ? 'Alamat tersimpan' : ''}</span>
            </div>
          </Card>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};
