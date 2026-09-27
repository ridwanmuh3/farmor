import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Jaring pengaman: satu halaman yang error tidak boleh membuat seluruh aplikasi
 * putih. Pengguna diberi tombol memuat ulang, dan detail errornya hanya masuk
 * ke konsol supaya tidak membocorkan data ke layar.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Halaman gagal dirender', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="ff-screen" style={{ paddingTop: 64, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 32 }} aria-hidden>
          ⚠
        </p>
        <h1 className="ff-title" style={{ marginTop: 12 }}>
          Ada yang salah
        </h1>
        <p className="ff-subtitle">
          Halaman ini gagal dimuat. Coba muat ulang; data keranjang dan pesananmu tetap tersimpan.
        </p>
        <button
          type="button"
          className="ff-btn"
          style={{ marginTop: 24 }}
          onClick={() => window.location.reload()}
        >
          Muat Ulang
        </button>
      </div>
    );
  }
}
