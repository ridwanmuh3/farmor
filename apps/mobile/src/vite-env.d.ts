/// <reference types="vite/client" />

/**
 * Ionic mengatur warna lewat CSS variable (--background, --color, ...).
 * React 19 tidak mengizinkannya di `style`, jadi buka tipenya di sini.
 */
import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
