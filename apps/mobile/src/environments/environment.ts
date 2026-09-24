/**
 * Konfigurasi runtime per environment.
 * ponytail: v1 pakai data lokal; tambahkan `apiBaseUrl` saat backend gateway siap.
 */
export const environment = {
  production: false,
  /** Mode demo: pemilih peran pembeli/penjual di halaman profil. Matikan saat rilis. */
  demoMode: true,
} as const;
