import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from '../router';
import { ASSETS } from '../../assets';
import { useShop } from '../components/ShopProvider';
import { Btn, Field } from '../components/ui';

const Splash = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'linear-gradient(180deg, #5b8c2a 0%, #3b5c14 100%)' }}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: '#fff',
          }}
        >
          <img src={ASSETS.leaf} alt="" width={64} height={64} />
          <h1 style={{ fontSize: 34, fontWeight: 700, margin: 0 }}>Farmor</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Dari petani, langsung ke dapurmu</p>
          <Btn
            style={{ width: 200, background: '#fff', color: 'var(--ff-primary)', marginTop: 24 }}
            onClick={() => history.replace('/onboarding')}
          >
            Mulai
          </Btn>
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Onboarding = () => {
  const history = useHistory();
  const [step, setStep] = useState(0);
  const slides = [
    { title: 'Panen Segar Setiap Hari', note: 'Produk dipetik pagi, dikirim di hari yang sama.' },
    { title: 'Harga Langsung dari Petani', note: 'Tanpa perantara, petani dapat bagian lebih besar.' },
    { title: 'Bayar Aman, Lacak Mudah', note: 'QRIS, transfer bank, atau e-money. Status jelas.' },
  ];
  const slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 60, textAlign: 'center' }}>
          <img
            src={ASSETS.getStarted}
            alt=""
            style={{ width: 280, height: 280, objectFit: 'cover', borderRadius: 24, margin: '0 auto' }}
          />
          <h1 className="ff-title" style={{ marginTop: 32 }}>{slide.title}</h1>
          <p className="ff-subtitle">{slide.note}</p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '24px 0' }}>
            {slides.map((s, i) => (
              <span
                key={s.title}
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? 'var(--ff-primary)' : 'var(--ff-line)',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>

          <Btn onClick={() => (last ? history.push('/register') : setStep(step + 1))}>
            {last ? 'Daftar Sekarang' : 'Lanjut'}
          </Btn>
          <button
            type="button"
            onClick={() => history.push('/login')}
            style={{
              marginTop: 16,
              background: 'none',
              border: 'none',
              color: 'var(--ff-primary)',
              fontWeight: 600,
              minHeight: 44,
            }}
          >
            Sudah punya akun? Masuk
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Login = () => {
  const history = useHistory();
  const { signIn } = useShop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Email harus valid dan kata sandi minimal 6 karakter.');
      return;
    }
    signIn(email, '', 'buyer');
    history.replace('/tabs/home');
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-primary-soft)' }}>
        <div className="ff-screen" style={{ paddingTop: 40 }}>
          <img
            src={ASSETS.login}
            alt=""
            width={180}
            height={180}
            style={{ borderRadius: '50%', objectFit: 'cover', margin: '0 auto 24px', display: 'block' }}
          />
          <div
            style={{
              background: '#fff',
              borderRadius: '28px 28px 0 0',
              margin: '0 -20px',
              padding: '28px 20px 40px',
            }}
          >
            <h1 className="ff-title">Selamat Datang</h1>
            <p className="ff-subtitle">Masuk untuk mulai belanja hasil tani.</p>

            <form onSubmit={submit} className="ff-stack" style={{ marginTop: 20 }}>
              <Field label="Email">
                <input
                  className="ff-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                />
              </Field>
              <Field label="Kata Sandi">
                <input
                  className="ff-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete="current-password"
                />
              </Field>
              {error ? <p style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>{error}</p> : null}
              <Btn type="submit">Masuk</Btn>
            </form>

            <button
              type="button"
              onClick={() => history.push('/forgot')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ff-primary)',
                fontWeight: 600,
                marginTop: 12,
                minHeight: 44,
              }}
            >
              Lupa kata sandi?
            </button>

            <p className="ff-muted" style={{ fontSize: 13, textAlign: 'center' }}>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => history.push('/register')}
                style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontWeight: 700 }}
              >
                Daftar
              </button>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Register = () => {
  const history = useHistory();
  const { signIn } = useShop();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      setError('Nama, email valid, dan kata sandi minimal 6 karakter wajib diisi.');
      return;
    }
    if (!agree) {
      setError('Syarat dan ketentuan harus disetujui.');
      return;
    }
    signIn(email, name.trim(), role);
    history.replace(role === 'seller' ? '/seller' : '/tabs/home');
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 32 }}>
          <h1 className="ff-title">Daftar Akun</h1>
          <p className="ff-subtitle">Pilih peran, isi data, lalu mulai.</p>

          <div className="ff-grid" style={{ marginTop: 20 }}>
            {(['buyer', 'seller'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className="ff-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: role === r ? 'var(--ff-primary)' : 'var(--ff-line)',
                  borderWidth: 2,
                  background: role === r ? 'var(--ff-primary-soft)' : '#fff',
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>{r === 'buyer' ? 'Pembeli' : 'Penjual'}</p>
                <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
                  {r === 'buyer' ? 'Belanja hasil tani' : 'Jual hasil panen'}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="ff-stack" style={{ marginTop: 20 }}>
            <Field label={role === 'buyer' ? 'Nama Lengkap' : 'Nama Usaha'}>
              <input className="ff-input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <input className="ff-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Kata Sandi">
              <input className="ff-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minHeight: 44 }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: 'var(--ff-primary)', marginTop: 4 }}
              />
              <span style={{ fontSize: 13 }} className="ff-muted">
                Saya setuju dengan Syarat &amp; Ketentuan serta Kebijakan Privasi Farmor.
              </span>
            </label>
            {error ? <p style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>{error}</p> : null}
            <Btn type="submit">Daftar</Btn>
          </form>

          <p className="ff-muted" style={{ fontSize: 13, textAlign: 'center' }}>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => history.push('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontWeight: 700 }}
            >
              Masuk
            </button>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 32 }}>
          <h1 className="ff-title">Lupa Kata Sandi</h1>
          <p className="ff-subtitle">
            Masukkan email akunmu. Kami kirim tautan atur ulang lewat email.
          </p>

          {sent ? (
            <div className="ff-card" style={{ marginTop: 24 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Tautan terkirim</p>
              <p className="ff-muted" style={{ fontSize: 14 }}>
                Cek kotak masuk {email}. Tautan berlaku 30 menit.
              </p>
              <Btn variant="ghost" onClick={() => history.push('/login')}>
                Kembali ke Masuk
              </Btn>
            </div>
          ) : (
            <form
              className="ff-stack"
              style={{ marginTop: 24 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes('@')) setSent(true);
              }}
            >
              <Field label="Email">
                <input
                  className="ff-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                />
              </Field>
              <Btn type="submit" disabled={!email.includes('@')}>
                Kirim Tautan
              </Btn>
            </form>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export { Splash };
export default Splash;
