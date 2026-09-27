/**
 * Driver Chrome DevTools Protocol minimal — tanpa dependensi npm.
 *
 * Node 24 sudah punya `fetch` dan `WebSocket` bawaan, jadi cukup bicara
 * langsung ke Chrome yang dijalankan dengan --remote-debugging-port.
 * Dipakai harness visual diff untuk memotret tiap layar pada 390x844.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Cari biner Chrome: PLAYWRIGHT_CHROME dulu, lalu cache ms-playwright. */
export const findChrome = () => {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) {
    throw new Error(`Chrome tidak ditemukan. Set CHROME_PATH, atau pasang: ~/.cache/ms-playwright kosong.`);
  }

  const candidates = [];
  for (const entry of readdirSync(cache)) {
    if (!entry.startsWith('chromium-')) continue;
    for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
      candidates.push(join(cache, entry, rel));
    }
  }

  const found = candidates.find(existsSync);
  if (!found) throw new Error('Chrome tidak ditemukan di dalam cache ms-playwright.');
  return found;
};

class Page {
  #ws;
  #id = 0;
  #pending = new Map();

  constructor(ws) {
    this.#ws = ws;
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      const entry = this.#pending.get(msg.id);
      if (!entry) return;
      this.#pending.delete(msg.id);
      if (msg.error) entry.reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? '')})`));
      else entry.resolve(msg.result);
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.#pending.delete(id)) reject(new Error(`Timeout: ${method}`));
      }, 30_000);
    });
  }

  /** Ukuran viewport disamakan dengan artboard mockup supaya 1:1. */
  setViewport({ width = 390, height = 844, scale = 2 } = {}) {
    return this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: scale,
      mobile: true,
    });
  }

  async goto(url) {
    await this.send('Page.navigate', { url });
    await this.waitForReady();
  }

  /** Tunggu DOM selesai, lalu beri waktu transisi Ionic mereda. */
  async waitForReady(settleMs = 450) {
    for (let i = 0; i < 100; i += 1) {
      const state = await this.#readyState();
      if (state === 'complete') break;
      await sleep(100);
    }
    await sleep(settleMs);
  }

  async #readyState() {
    try {
      const { result } = await this.send('Runtime.evaluate', {
        expression: 'document.readyState',
        returnByValue: true,
      });
      return result.value;
    } catch {
      return 'loading';
    }
  }

  async evaluate(expression) {
    const { result } = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.value;
  }

  async screenshot(file) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const { writeFile } = await import('node:fs/promises');
    await writeFile(file, Buffer.from(data, 'base64'));
    return file;
  }

  close() {
    try {
      this.#ws.close();
    } catch {
      /* sudah tertutup */
    }
  }
}

export class Browser {
  #proc;
  #port;

  constructor(proc, port) {
    this.#proc = proc;
    this.#port = port;
  }

  static async launch({ port = 9333, profileDir } = {}) {
    const chrome = findChrome();
    const dir = profileDir ?? join(homedir(), '.cache', 'farmor-visual-diff');
    mkdirSync(dir, { recursive: true });

    const proc = spawn(
      chrome,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=2',
        '--disable-lcd-text',
        '--font-render-hinting=none',
        '--disable-extensions',
        '--no-first-run',
        `--user-data-dir=${dir}`,
        `--remote-debugging-port=${port}`,
        'about:blank',
      ],
      { stdio: 'ignore' },
    );

    // Tunggu endpoint debugging siap.
    for (let i = 0; i < 150; i += 1) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (res.ok) return new Browser(proc, port);
      } catch {
        /* belum siap */
      }
      await sleep(100);
    }

    proc.kill();
    throw new Error(`Chrome gagal membuka port debugging ${port}.`);
  }

  async newPage() {
    const res = await fetch(`http://127.0.0.1:${this.#port}/json/list`);
    const targets = await res.json();
    const target = targets.find((t) => t.type === 'page');
    if (!target) throw new Error('Tidak ada target halaman di Chrome.');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error('Gagal membuka WebSocket ke Chrome.')), { once: true });
    });

    const page = new Page(ws);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    return page;
  }

  close() {
    this.#proc.kill();
  }
}
