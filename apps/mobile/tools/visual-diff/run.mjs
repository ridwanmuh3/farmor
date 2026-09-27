/**
 * Harness visual diff: potret tiap layar pada 390x844 lalu bandingkan
 * dengan mockup SVG-nya.
 *
 *   node tools/visual-diff/run.mjs            # semua layar
 *   node tools/visual-diff/run.mjs cart home  # layar tertentu saja
 *
 * Artboard mockup juga 390x844, jadi tangkapan layar sejajar 1:1 dengan
 * mockup-nya — tidak perlu penyetelan skala saat membandingkan.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Browser } from './cdp.mjs';
import { SCREENS, EXTRA_SCREENS, WORLDS, readFirstOrder, DEFAULT_LIMIT, LIMITS } from './screens.mjs';
import { buildReport } from './report.mjs';
import { decodePng, rmse } from './png.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const MOBILE = join(HERE, '..', '..');
const OUT = join(HERE, 'out');
const SHOTS = join(OUT, 'shots');
const MOCKUPS = join(MOBILE, '..', '..', 'mockup');

/** Rasterkan satu SVG mockup pada 390x844 @2x, sejajar dengan tangkapan layar. */
const rasterizeMockup = async (browser, name) => {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, scale: 2 });
  await page.goto('about:blank');
  const svg = readFileSync(join(MOCKUPS, `${name}.svg`), 'utf8');
  // Tanpa meta viewport, Chrome mode mobile memakai lebar 980px dan SVG hanya
  // menempati pojok kiri — hasilnya selalu dianggap jauh dari mockup.
  const html = `<!doctype html><html><head><meta name="viewport" content="width=${WIDTH}, initial-scale=1"></head><body style="margin:0">${svg}</body></html>`;
  await page.evaluate(`document.open();document.write(${JSON.stringify(html)});document.close()`);
  await page.waitForReady(600);
  const file = join(SHOTS, `_mockup-${name}.png`);
  await page.screenshot(file);
  page.close();
  return file;
};

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const WIDTH = 390;
const HEIGHT = 844;

const isUp = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
};

/** Pakai server yang sudah jalan kalau ada; kalau tidak, jalankan Vite sendiri. */
const ensureServer = async () => {
  if (await isUp(BASE_URL)) {
    console.log(`→ memakai server yang sudah jalan di ${BASE_URL}`);
    return null;
  }

  console.log('→ menjalankan vite…');
  const proc = spawn('npx', ['vite', '--port', '5173', '--strictPort'], {
    cwd: MOBILE,
    stdio: 'ignore',
  });

  for (let i = 0; i < 200; i += 1) {
    if (await isUp(BASE_URL)) return proc;
    await sleep(250);
  }

  proc.kill();
  throw new Error(`Vite tidak siap di ${BASE_URL}`);
};

const run = async () => {
  const only = process.argv.slice(2);
  const wanted = only.length
    ? [...SCREENS, ...EXTRA_SCREENS].filter((s) => only.includes(s.id))
    : [...SCREENS, ...EXTRA_SCREENS];
  if (new Set(wanted.map((s) => s.id)).size !== wanted.length) throw new Error('Ada id layar ganda.');
  if (wanted.length === 0) throw new Error(`Tidak ada layar cocok: ${only.join(', ')}`);

  mkdirSync(SHOTS, { recursive: true });

  const server = await ensureServer();
  const browser = await Browser.launch();

  const captured = [];
  const fidelity = [];
  let ctx = { groupId: '', orderId: '' };

  try {
    for (const screen of wanted) {
      const page = await browser.newPage();
      await page.setViewport({ width: WIDTH, height: HEIGHT, scale: 2 });

      // Buka origin dulu supaya localStorage bisa ditulis, baru tanam keadaan.
      await page.goto(BASE_URL);
      await WORLDS[screen.world](page, { baseUrl: BASE_URL });

      // Pesanan yang baru dibuat mengubah id yang dipakai rute.
      if (screen.world === 'order' || screen.world === 'sellerOrders') {
        ctx = await readFirstOrder(page);
      }

      const route = typeof screen.route === 'function' ? screen.route(ctx) : screen.route;
      await page.goto(`${BASE_URL}${route}`);

      const file = join(SHOTS, `${screen.id}.png`);
      await page.screenshot(file);
      page.close();

      // Gerbang kesetiaan: bandingkan tangkapan dengan mockup pada resolusi yang sama.
      if (screen.mockup) {
        const mockFile = await rasterizeMockup(browser, screen.mockup.replace(/\.svg$/, ''));
        const score = rmse(decodePng(readFileSync(mockFile)), decodePng(readFileSync(file)));
        const limit = LIMITS[screen.id] ?? DEFAULT_LIMIT;
        fidelity.push({ id: screen.id, label: screen.label, score, limit, pass: score <= limit });
      }

      captured.push({ ...screen, route, file: `shots/${screen.id}.png` });
      console.log(`  ✓ ${screen.id.padEnd(20)} ${route}`);
    }
  } finally {
    browser.close();
    server?.kill();
  }

  const report = join(OUT, 'index.html');
  const scored = captured.map((s) => ({ ...s, ...(fidelity.find((f) => f.id === s.id) ?? {}) }));
  buildReport({ screens: scored, outFile: report });
  console.log(`\n→ laporan: ${report}`);
  if (!existsSync(report)) throw new Error('Laporan gagal ditulis.');

  // Laporan gerbang ditulis sebelum keluar, supaya angka yang gagal tetap bisa dilihat.
  const gate = join(OUT, 'fidelity.json');
  writeFileSync(gate, JSON.stringify(fidelity, null, 2));
  const failed = fidelity.filter((f) => !f.pass);
  console.log('\n→ kesetiaan mockup (RMSE piksel, makin kecil makin mirip):');
  for (const f of fidelity) {
    const pct = (f.score * 100).toFixed(2).padStart(6);
    console.log(`  ${f.pass ? '✓' : '✗'} ${f.id.padEnd(20)} ${pct}%  (batas ${(f.limit * 100).toFixed(0)}%)`);
  }
  if (failed.length) {
    throw new Error(`${failed.length} layar melewati batas kesetiaan: ${failed.map((f) => f.id).join(', ')}`);
  }
};

run().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
