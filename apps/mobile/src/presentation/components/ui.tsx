import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

export const Btn = ({
  children,
  variant = 'solid',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost' }) => (
  <button className={`ff-btn${variant === 'ghost' ? ' ff-btn-ghost' : ''}`} {...rest}>
    {children}
  </button>
);

export const Chip = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) => (
  <button className="ff-chip" aria-pressed={active} onClick={onClick} type="button">
    {children}
  </button>
);

export const Badge = ({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'solid' | 'amber' | 'info' }) => {
  const tones: Record<string, [string, string]> = {
    soft: ['var(--ff-primary-soft)', 'var(--ff-primary-dark)'],
    solid: ['var(--ff-primary-strong)', 'var(--ff-on-primary)'],
    amber: ['var(--ff-amber-soft)', 'var(--ff-amber)'],
    info: ['var(--ff-info-soft)', 'var(--ff-info)'],
  };
  const [bg, fg] = tones[tone];
  return (
    <span className="ff-badge" style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
};

export const Card = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div className="ff-card" style={style}>
    {children}
  </div>
);

export const Row = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div className="ff-row" style={style}>
    {children}
  </div>
);

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label style={{ display: 'block' }}>
    <span className="ff-label">{label}</span>
    {children}
  </label>
);

export const Empty = ({ title, note }: { title: string; note: string }) => (
  <div className="ff-empty">
    <p style={{ fontWeight: 700, color: 'var(--ff-text)' }}>{title}</p>
    <p style={{ fontSize: 14 }}>{note}</p>
  </div>
);

export const QtyStepper = ({
  qty,
  max,
  onChange,
}: {
  qty: number;
  max: number;
  onChange: (next: number) => void;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <button
      type="button"
      className="ff-chip"
      aria-label="Kurangi jumlah"
      onClick={() => onChange(Math.max(1, qty - 1))}
      disabled={qty <= 1}
      style={{ minWidth: 44 }}
    >
      −
    </button>
    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
    <button
      type="button"
      className="ff-chip"
      aria-label="Tambah jumlah"
      onClick={() => onChange(Math.min(max, qty + 1))}
      disabled={qty >= max}
      style={{ minWidth: 44 }}
    >
      +
    </button>
  </div>
);

/**
 * Konfirmasi dalam kartu, bukan dialog modal: tidak ada overlay yang
 * memblokir layar, dan tombol Batal selalu dijangkau ibu jari.
 */
export const Confirm = ({
  open,
  title,
  note,
  confirmLabel = 'Ya, Lanjutkan',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  note?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="ff-card" style={{ marginTop: 12, borderColor: 'var(--ff-danger)' }} role="alertdialog" aria-label={title}>
      <p style={{ margin: 0, fontWeight: 700 }}>{title}</p>
      {note ? (
        <p className="ff-muted" style={{ fontSize: 13, margin: '4px 0 12px' }}>
          {note}
        </p>
      ) : null}
      <div className="ff-row" style={{ gap: 8 }}>
        <Btn variant="ghost" onClick={onClose}>
          Batal
        </Btn>
        <Btn onClick={onConfirm}>{confirmLabel}</Btn>
      </div>
    </div>
  );
};

/** Tombol yang meminta konfirmasi sekali sebelum menjalankan aksi. */
export const ConfirmBtn = ({
  children,
  title,
  note,
  confirmLabel = 'Ya, Lanjutkan',
  onConfirm,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  note?: string;
  confirmLabel?: string;
  variant?: 'solid' | 'ghost';
  onConfirm: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { variant, ...btnProps } = rest;
  return (
    <>
      <Btn {...btnProps} variant={variant} onClick={() => setOpen(true)}>
        {children}
      </Btn>
      <Confirm
        open={open}
        title={title}
        note={note}
        confirmLabel={confirmLabel}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          onConfirm();
        }}
      />
    </>
  );
};

export const Thumb = ({ src, size = 64, radius = 16 }: { src: string; size?: number; radius?: number }) => (
  <img
    className="ff-thumb"
    loading="lazy"
    decoding="async"
    src={src}
    alt=""
    width={size}
    height={size}
    style={{ width: size, height: size, borderRadius: radius }}
  />
);
