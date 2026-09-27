import { IonContent, IonPage } from '@ionic/react';
import { useRef, useState } from 'react';
import { Store, User } from 'lucide-react';
import { useHistory } from '../router';
import { ASSETS } from '../../assets';
import { isEmail, isPhone } from '../../core/entities/format';
import { useShop } from '../components/ShopProvider';
import { Btn, Field } from '../components/ui';

const Splash = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'linear-gradient(180deg, var(--ff-primary-strong) 0%, var(--ff-primary-deep) 100%)' }}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: 'var(--ff-on-primary)',
            padding: '0 40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              background: 'var(--ff-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={ASSETS.leaf} alt="" width={44} height={44} />
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 700, margin: 0 }}>Farmor</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
            Pasar Tani Langsung
          </p>

          <div style={{ position: 'absolute', bottom: 132, textAlign: 'center', left: 0, right: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>&ldquo;Segar dari Ladang ke Meja Anda&rdquo;</p>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--ff-lime)', margin: '16px auto 0' }} />
          </div>

          {/* Mockup tidak menampilkan tombol, tapi tanpa kontrol yang terlihat
              layar ini tidak bisa dilanjutkan — tap tersembunyi melanggar
              WCAG 3.2.1 tanpa aba-aba. Tombol solid mengikuti pola CTA hijau
              yang sudah ada di Onboarding/Login.

              Tombolnya dibungkus div: WebView lama (Chrome 74) tidak mau
              melebarkan <button> absolute yang hanya di-stretch left+right —
              dia menyusut selebar teks (shrink-to-fit), div tidak. */}
          <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40 }}>
            <Btn
              onClick={() => history.replace('/onboarding')}
              style={{
                /* Hijau primary di gradien hijau bawah hanya 1,4:1 — tombolnya
                   melebur. Dibalik: putih seperti logo, teks hijau tua 7,7:1. */
                background: 'var(--ff-card)',
                color: 'var(--ff-primary-dark)',
              }}
            >
              Mulai
            </Btn>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export const Onboarding = () => {
  const history = useHistory();
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: 'Langsung dari Petani ke Anda',
      note: 'Dapatkan hasil panen segar langsung dari petani lokal terpercaya. Tanpa perantara, harga lebih adil untuk semuanya.',
    },
    { title: 'Harga Langsung dari Petani', note: 'Tanpa perantara, petani dapat bagian lebih besar.' },
    { title: 'Bayar Aman, Lacak Mudah', note: 'QRIS, transfer bank, atau e-money. Status jelas.' },
  ];
  const slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 24, textAlign: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => history.push('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, minHeight: 44 }}
            >
              Lewati
            </button>
          </div>

          <img
            src={ASSETS.getStarted}
            alt=""
            style={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 24, margin: '8px auto 0', display: 'block' }}
          />
          <h1 className="ff-title" style={{ marginTop: 28 }}>{slide.title}</h1>
          <p className="ff-subtitle">{slide.note}</p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '24px 0' }}>
            {slides.map((s, i) => (
              <span
                key={s.title}
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? 'var(--ff-primary-strong)' : 'var(--ff-line)',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>

          <Btn onClick={() => (last ? history.push('/register') : setStep(step + 1))}>
            {last ? 'Daftar Sekarang' : 'Selanjutnya'}
          </Btn>
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
  const [socialNote, setSocialNote] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const emailOk = isEmail(email);
  const passwordOk = password.length >= 6;
  const emailInvalid = Boolean(error) && !emailOk;
  const passwordInvalid = Boolean(error) && !passwordOk;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk || !passwordOk) {
      // Sebutkan hanya yang salah — jangan menuduh email yang sudah benar.
      setError(
        [!emailOk ? 'Masukkan email yang valid.' : '', !passwordOk ? 'Kata sandi minimal 6 karakter.' : '']
          .filter(Boolean)
          .join(' '),
      );
      // Fokus ke kolom bermasalah pertama supaya pengguna keyboard tidak tersesat.
      (emailOk ? passwordRef : emailRef).current?.focus();
      return;
    }
    setError('');
    signIn(email, '', 'buyer');
    history.replace('/tabs/home');
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-primary-soft)' }}>
        <div className="ff-screen" style={{ paddingTop: 40 }}>
          <img
            src={ASSETS.login}
            alt=""
            width={150}
            height={150}
            style={{ borderRadius: '50%', objectFit: 'cover', margin: '0 auto 24px', display: 'block' }}
          />
          <div
            style={{
              background: 'var(--ff-card)',
              borderRadius: '28px 28px 0 0',
              margin: '0 -20px',
              padding: '28px 20px 40px',
            }}
          >
            <h1 className="ff-title">Selamat Datang</h1>
            <p className="ff-subtitle">Masuk untuk menikmati hasil tani segar terbaik</p>

            <form onSubmit={submit} className="ff-stack" style={{ marginTop: 20 }}>
              <Field label="Email">
                <input
                  className="ff-input"
                  type="email"
                  ref={emailRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi.petani@gmail.com"
                  autoComplete="email"
                  aria-invalid={emailInvalid}
                  aria-describedby={emailInvalid ? 'login-error' : undefined}
                />
              </Field>
              <div>
                <div className="ff-row" style={{ marginBottom: 6 }}>
                  <span className="ff-label" style={{ margin: 0 }}>Kata Sandi</span>
                  <button
                    type="button"
                    onClick={() => history.push('/forgot')}
                    style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 600, fontSize: 13, padding: 0, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <input
                  className="ff-input"
                  type="password"
                  aria-label="Kata Sandi"
                  ref={passwordRef}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  aria-invalid={passwordInvalid}
                  aria-describedby={passwordInvalid ? 'login-error' : undefined}
                />
              </div>
              {error ? (
                <p id="login-error" role="alert" style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>
                  {error}
                </p>
              ) : null}
              <Btn type="submit">Masuk Sekarang</Btn>
            </form>

            <p className="ff-muted" style={{ fontSize: 13, textAlign: 'center', marginTop: 16 }}>
              Atau masuk dengan
            </p>
            <div className="ff-row" style={{ gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="ff-btn ff-btn-ghost"
                style={{ flex: 1, minHeight: 44, color: 'var(--ff-text)' }}
                onClick={() => setSocialNote('Masuk dengan Google belum tersedia. Pakai email dulu ya.')}
              >
                Google
              </button>
              <button
                type="button"
                className="ff-btn ff-btn-ghost"
                style={{ flex: 1, minHeight: 44, color: 'var(--ff-text)' }}
                onClick={() => setSocialNote('Masuk dengan Apple belum tersedia. Pakai email dulu ya.')}
              >
                Apple
              </button>
            </div>
            <span className="ff-sr" role="status">{socialNote}</span>
            {socialNote ? (
              <p style={{ margin: '8px 0 0', fontSize: 13, textAlign: 'center', color: 'var(--ff-muted)' }}>
                {socialNote}
              </p>
            ) : null}

            <p className="ff-muted" style={{ fontSize: 13, textAlign: 'center', marginTop: 20 }}>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => history.push('/register')}
                style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
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
  const [role, setRole] = useState<'buyer' | 'seller'>('seller');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<'fields' | 'agree' | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const agreeRef = useRef<HTMLInputElement>(null);

  const nameOk = Boolean(name.trim());
  const emailOk = isEmail(email);
  const phoneOk = isPhone(phone);
  const passwordOk = password.length >= 6;
  const nameInvalid = errorField === 'fields' && !nameOk;
  const emailInvalid = errorField === 'fields' && !emailOk;
  const phoneInvalid = errorField === 'fields' && !phoneOk;
  const passwordInvalid = errorField === 'fields' && !passwordOk;
  const agreeInvalid = errorField === 'agree' && !agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstInvalid = !nameOk
      ? nameRef
      : !phoneOk
        ? phoneRef
        : !emailOk
          ? emailRef
          : !passwordOk
            ? passwordRef
            : null;
    if (firstInvalid) {
      // Sebutkan hanya kolom yang belum benar, satu kalimat per masalah.
      setError(
        [
          !nameOk ? 'Isi nama lengkap.' : '',
          !phoneOk ? 'Masukkan nomor HP yang valid.' : '',
          !emailOk ? 'Masukkan email yang valid.' : '',
          !passwordOk ? 'Kata sandi minimal 6 karakter.' : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
      setErrorField('fields');
      // Fokus ke kolom bermasalah pertama supaya pengguna keyboard tidak tersesat.
      firstInvalid.current?.focus();
      return;
    }
    if (!agree) {
      setError('Centang kotak persetujuan untuk melanjutkan.');
      setErrorField('agree');
      agreeRef.current?.focus();
      return;
    }
    setError('');
    setErrorField(null);
    signIn(email, name.trim(), role);
    history.replace(role === 'seller' ? '/seller' : '/tabs/home');
  };

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 32 }}>
          <h1 className="ff-title">Daftar Akun Baru</h1>
          <p className="ff-subtitle">Buat akun untuk belanja atau mulai jual hasil tani</p>

          <span className="ff-label" style={{ marginTop: 20 }}>Pilih Peran Anda</span>
          <div className="ff-grid">
            {([
              { id: 'seller' as const, label: 'Saya Petani', note: 'Jual hasil panen', Icon: Store },
              { id: 'buyer' as const, label: 'Saya Pembeli', note: 'Belanja hasil tani', Icon: User },
            ]).map(({ id, label, note, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                aria-pressed={role === id}
                className="ff-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: role === id ? 'var(--ff-primary)' : 'var(--ff-line)',
                  borderWidth: 2,
                  background: role === id ? 'var(--ff-primary-soft)' : 'var(--ff-card)',
                }}
              >
                <div className="ff-row">
                  <Icon size={20} aria-hidden />
                  <span
                    aria-hidden
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      border: `2px solid ${role === id ? 'var(--ff-primary)' : 'var(--ff-line)'}`,
                      background: role === id ? 'var(--ff-primary)' : 'transparent',
                    }}
                  />
                </div>
                <p style={{ margin: 'var(--ff-space-2) 0 0', fontWeight: 700 }}>{label}</p>
                <p className="ff-muted" style={{ margin: 'var(--ff-space-1) 0 0', fontSize: 12 }}>
                  {note}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="ff-stack" style={{ marginTop: 20 }}>
            <Field label="Nama Lengkap">
              <input
                className="ff-input"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Budi Hartono"
                aria-invalid={nameInvalid}
                aria-describedby={nameInvalid ? 'register-error' : undefined}
              />
            </Field>
            <Field label="Nomor Telepon">
              <input
                className="ff-input"
                inputMode="tel"
                ref={phoneRef}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                aria-invalid={phoneInvalid}
                aria-describedby={phoneInvalid ? 'register-error' : undefined}
              />
            </Field>
            <Field label="Email">
              <input
                className="ff-input"
                type="email"
                ref={emailRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi.hartono@gmail.com"
                aria-invalid={emailInvalid}
                aria-describedby={emailInvalid ? 'register-error' : undefined}
              />
            </Field>
            <Field label="Kata Sandi">
              <input
                className="ff-input"
                type="password"
                ref={passwordRef}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                aria-invalid={passwordInvalid}
                aria-describedby={passwordInvalid ? 'register-error' : undefined}
              />
            </Field>
            {/* Syarat dipasang sebelum submit, bukan baru muncul saat gagal.
                Di luar <label> supaya nama aksesibel field tetap bersih. */}
            <span className="ff-muted" style={{ display: 'block', fontSize: 12, marginTop: -8 }}>
              Minimal 6 karakter.
            </span>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minHeight: 44 }}>
              <input
                type="checkbox"
                ref={agreeRef}
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: 'var(--ff-primary)', marginTop: 4 }}
                aria-invalid={agreeInvalid}
                aria-describedby={agreeInvalid ? 'register-error' : undefined}
              />
              <span style={{ fontSize: 13 }} className="ff-muted">
                Saya menyetujui{' '}
                <button
                  type="button"
                  onClick={() => history.push('/terms')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--ff-primary-text)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', minHeight: 24 }}
                >
                  Syarat &amp; Ketentuan
                </button>{' '}
                Farmor
              </span>
            </label>
            {error ? (
              <p id="register-error" role="alert" style={{ color: 'var(--ff-danger)', fontSize: 13, margin: 0 }}>
                {error}
              </p>
            ) : null}
            <Btn type="submit">Daftar Sekarang</Btn>
          </form>

          <p className="ff-muted" style={{ fontSize: 13, textAlign: 'center' }}>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => history.push('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--ff-primary-text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
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

  const emailOk = isEmail(email);

  return (
    <IonPage>
      <IonContent fullscreen role="main" style={{ '--background': 'var(--ff-surface)' }}>
        <div className="ff-screen" style={{ paddingTop: 32 }}>
          <h1 className="ff-title">Lupa Kata Sandi</h1>
          <p className="ff-subtitle">
            Masukkan email akunmu. Kami akan mengirim tautan atur ulang ke emailmu.
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
                if (emailOk) setSent(true);
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
              <Btn type="submit" disabled={!emailOk}>
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
