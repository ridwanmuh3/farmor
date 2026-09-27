import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from '../router';
import { roleLabel } from '../../data/dto/catalog';
import { initialsOf } from '../../core/entities/format';
import { environment } from '../../environments/environment';
import { useShop } from '../components/ShopProvider';
import { Btn, Card, ConfirmBtn } from '../components/ui';

export const Profile = () => {
  const history = useHistory();
  const { user, role, setRole, signOut, address } = useShop();
  const [showRole, setShowRole] = useState(false);

  const menu = [
    { label: 'Alamat Pengiriman', note: address.label, action: () => history.push('/addresses') },
    { label: 'Wishlist', note: 'Produk yang disimpan', action: () => history.push('/wishlist') },
    { label: 'Notifikasi', note: 'Pengingat pesanan', action: () => history.push('/notifications') },
    { label: 'Riwayat Pesanan', note: 'Semua transaksi', action: () => history.push('/orders') },
    { label: 'Pusat Bantuan', note: 'FAQ & kontak', action: () => history.push('/help') },
    { label: 'Syarat & Ketentuan', note: 'Legal', action: () => history.push('/terms') },
    { label: 'Tentang Farmor', note: 'Versi 0.0.1', action: () => history.push('/about') },
  ];

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <h1 className="ff-title">Profil</h1>

          <Card style={{ marginTop: 16 }}>
            <div className="ff-row">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" width={56} height={56} style={{ borderRadius: 28, objectFit: 'cover' }} />
                ) : (
                  <span
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      background: 'var(--ff-primary-strong)',
                      color: 'var(--ff-on-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                  >
                    {initialsOf(user.name)}
                  </span>
                )}
                <div>
                  <p style={{ margin: '0 0 var(--ff-space-1)', fontWeight: 700 }}>{user.name}</p>
                  <p className="ff-muted" style={{ margin: 0, fontSize: 13 }}>{user.email}</p>
                </div>
              </div>
              {environment.demoMode ? (
                <button
                  type="button"
                  className="ff-chip"
                  onClick={() => setShowRole(!showRole)}
                  aria-label="Ganti peran"
                >
                  {roleLabel(role)} ▾
                </button>
              ) : (
                <span className="ff-badge" style={{ background: 'var(--ff-primary-soft)', color: 'var(--ff-primary-dark)' }}>
                  {roleLabel(role)}
                </span>
              )}
            </div>

            {showRole ? (
              <div style={{ marginTop: 12 }}>
                <p className="ff-muted" style={{ fontSize: 12, margin: '0 0 8px' }}>
                  Mode demo: berpindah peran memuat akun contoh.
                </p>
                <div className="ff-row" style={{ gap: 8 }}>
                  <Btn variant={role === 'buyer' ? 'solid' : 'ghost'} onClick={() => { setRole('buyer'); setShowRole(false); }}>Pembeli</Btn>
                  <Btn variant={role === 'seller' ? 'solid' : 'ghost'} onClick={() => { setRole('seller'); setShowRole(false); history.push('/seller'); }}>Penjual</Btn>
                </div>
              </div>
            ) : null}
          </Card>

          <Card style={{ marginTop: 12, padding: 0 }}>
            {menu.map((m, i) => (
              <button
                key={m.label}
                type="button"
                onClick={m.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--ff-line)',
                  textAlign: 'left',
                  font: 'inherit',
                  cursor: 'pointer',
                  minHeight: 56,
                }}
              >
                <span>
                  <span style={{ display: 'block', fontWeight: 600 }}>{m.label}</span>
                  <span className="ff-muted" style={{ fontSize: 12 }}>{m.note}</span>
                </span>
                <span className="ff-muted">›</span>
              </button>
            ))}
          </Card>

          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <ConfirmBtn
              variant="ghost"
              title="Keluar dari akun?"
              note="Keranjang dan riwayat pesanan di perangkat ini akan ikut terhapus."
              confirmLabel="Ya, Keluar"
              onConfirm={() => {
                signOut();
                history.replace('/login');
              }}
              style={{ color: 'var(--ff-danger)', borderColor: 'var(--ff-danger)' }}
            >
              Keluar
            </ConfirmBtn>
          </div>
          <div className="ff-safe-bottom" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export const SimpleInfo = ({ title }: { title: string }) => {
  const history = useHistory();
  const content: Record<string, string> = {
    'Pusat Bantuan': 'Hubungi kami di bantuan@farmor.id atau WhatsApp 0812-0000-0000. Senin-Sabtu 08.00-18.00.',
    'Syarat & Ketentuan': 'Dengan memakai Farmor, kamu setuju membeli hasil tani sesuai deskripsi penjual dan menaati aturan pembayaran serta pengembalian.',
    'Tentang Farmor': 'Farmor menghubungkan petani, pekebun, dan peternak langsung ke pembeli. Versi 0.0.1 (mobile).',
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 16 }}>
          <div className="ff-row">
            <button type="button" className="ff-chip" onClick={() => history.goBack()} aria-label="Kembali" style={{ width: 44, padding: 0 }}>‹</button>
            <h1 className="ff-title" style={{ fontSize: 'var(--ff-type-title-screen)', flex: 1 }}>{title}</h1>
          </div>
          <Card style={{ marginTop: 16 }}>
            <p className="ff-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>
              {content[title] ?? 'Belum ada isi.'}
            </p>
          </Card>
        </div>
      </IonContent>
    </IonPage>
  );
};

