export const rupiah = (n: number): string =>
  `Rp${Math.round(n).toLocaleString('id-ID')}`;

/** kg di bawah 1 tampil sebagai gram, biar 0,5 kg tidak salah baca jadi 0 kg. */
export const berat = (gram: number): string =>
  gram < 1000 ? `${gram} g` : `${(gram / 1000).toLocaleString('id-ID')} kg`;

export const totalQty = (items: { qty: number }[]): number =>
  items.reduce((sum, item) => sum + item.qty, 0);

export const tanggal = (iso: string): string =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/** Avatar default: inisial nama depan + belakang, sesuai PRD. */
export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const greetingOf = (date = new Date()): string => {
  const hour = date.getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
};
