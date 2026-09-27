import { describe, expect, it } from 'vitest';
import { berat, greetingOf, initialsOf, isEmail, isPhone, jam, rupiah, tanggal, totalQty } from './format';

describe('rupiah', () => {
  it('memformat angka jadi rupiah tanpa desimal', () => {
    expect(rupiah(12000)).toBe('Rp12.000');
    expect(rupiah(0)).toBe('Rp0');
  });
});

describe('berat', () => {
  it('memakai gram di bawah 1 kg', () => {
    expect(berat(250)).toBe('250 g');
  });

  it('memakai kilogram untuk 1000 g ke atas', () => {
    expect(berat(1000)).toBe('1 kg');
    expect(berat(2500)).toBe('2,5 kg');
  });
});

describe('totalQty', () => {
  it('menjumlahkan qty', () => {
    expect(totalQty([{ qty: 2 }, { qty: 3 }])).toBe(5);
    expect(totalQty([])).toBe(0);
  });
});

describe('tanggal', () => {
  it('memformat ISO jadi tanggal Indonesia', () => {
    expect(tanggal('2026-01-15T03:00:00.000Z')).toContain('2026');
  });
});

describe('initialsOf', () => {
  it('mengambil maksimal dua inisial', () => {
    expect(initialsOf('Ridwan Muh')).toBe('RM');
    expect(initialsOf('  tani   makmur  ')).toBe('TM');
    expect(initialsOf('Ridwan Muh Jaya')).toBe('RM');
  });
});

describe('greetingOf', () => {
  it('mengubah sapaan sesuai jam', () => {
    expect(greetingOf(new Date('2026-01-15T02:00:00'))).toBe('Selamat pagi');
    expect(greetingOf(new Date('2026-01-15T12:00:00'))).toBe('Selamat siang');
    expect(greetingOf(new Date('2026-01-15T17:00:00'))).toBe('Selamat sore');
    expect(greetingOf(new Date('2026-01-15T21:00:00'))).toBe('Selamat malam');
  });
});

describe('isEmail', () => {
  it('menerima email dengan nama lokal, domain, dan titik', () => {
    expect(isEmail('ridwan@farmor.id')).toBe(true);
    expect(isEmail('  ridwan@farmor.co.id  ')).toBe(true);
  });

  it('menolak email tanpa titik domain atau tanpa nama lokal', () => {
    expect(isEmail('ridwan@farmor')).toBe(false);
    expect(isEmail('@farmor.id')).toBe(false);
    expect(isEmail('nama saja')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
});

describe('isPhone', () => {
  it('menerima format 08 dan 62, dengan spasi atau hubung', () => {
    expect(isPhone('081234567890')).toBe(true);
    expect(isPhone('+6281234567890')).toBe(true);
    expect(isPhone('0812 3456 7890')).toBe(true);
    expect(isPhone('0812-3456-7890')).toBe(true);
  });

  it('menolak nomor yang terlalu pendek, huruf, atau kosong', () => {
    expect(isPhone('0812')).toBe(false);
    expect(isPhone('bukan-nomor')).toBe(false);
    expect(isPhone('')).toBe(false);
  });
});

describe('jam', () => {
  it('memformat jam dan menit dua digit', () => {
    expect(jam(new Date('2026-01-15T08:05:00'))).toBe('08:05');
    expect(jam(new Date('2026-01-15T19:30:00'))).toBe('19:30');
  });
});
