/**
 * Bangun laporan HTML yang menaruh mockup dan hasil potret berdampingan,
 * plus mode overlay dan difference untuk melihat pergeseran beberapa piksel.
 *
 * Teks di mockup sudah jadi outline path, jadi perbedaan label tidak bisa
 * dideteksi otomatis — overlay inilah yang membuatnya terlihat mata.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { WITHOUT_MOCKUP } from './screens.mjs';

/** Relatif terhadap out/index.html: out -> visual-diff -> tools -> mobile -> apps -> akar. */
const MOCKUP_DIR = '../../../../../mockup';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const card = ({ id, label, mockup, route, file, score, limit, pass }) => {
  const gate = typeof score === 'number';
  // Layar tanpa mockup: tanpa panel mockup/overlay, cukup tangkapanannya.
  const mockFrame = mockup
    ? `<figure class="fig fig-mockup">
        <img src="${MOCKUP_DIR}/${esc(mockup)}" width="390" height="844" alt="Mockup ${esc(label)}">
        <figcaption>Mockup — <code>${esc(mockup)}</code></figcaption>
      </figure>`
    : '';
  const overlay = mockup
    ? `<figure class="fig fig-overlay">
        <div class="stage">
          <img class="layer shot" src="./${esc(file)}" width="390" height="844" alt="">
          <img class="layer mock" src="${MOCKUP_DIR}/${esc(mockup)}" width="390" height="844" alt="">
        </div>
        <figcaption>Overlay — mockup di atas implementasi</figcaption>
      </figure>`
    : '';
  return `
  <section class="screen" id="s-${esc(id)}">
    <header>
      <h2>${esc(label)}</h2>
      <code>${esc(route)}</code>
      <span class="pill">${esc(mockup ?? 'tanpa mockup')}</span>
      ${
        gate
          ? `<span class="pill ${pass ? 'ok' : 'bad'}">RMSE ${(score * 100).toFixed(2)}% / batas ${(limit * 100).toFixed(0)}%</span>`
          : ''
      }
    </header>
    <div class="frames">
      ${mockFrame}
      <figure class="fig fig-shot">
        <img src="./${esc(file)}" width="390" height="844" alt="Implementasi ${esc(label)}">
        <figcaption>Implementasi — <code>${esc(route)}</code></figcaption>
      </figure>
      ${overlay}
    </div>
  </section>`;
};

export const buildReport = ({ screens, outFile }) => {
  // Jaga-jaga: jalur relatif gampang meleset satu tingkat, dan laporan yang
  // menunjuk berkas hilang akan tampak kosong tanpa penjelasan.
  const mockupDir = join(dirname(outFile), MOCKUP_DIR);
  const missing = screens.filter((s) => s.mockup && !existsSync(join(mockupDir, s.mockup)));
  if (missing.length) {
    throw new Error(
      `Mockup tidak ketemu dari ${dirname(outFile)} (${MOCKUP_DIR}): ${missing.map((m) => m.mockup).join(', ')}`,
    );
  }

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Farmor — Mockup vs Implementasi</title>
<style>
  :root {
    --mock-opacity: 0.5;
    --stage-zoom: 1;
    --ink: #1a1a1a;
    --muted: #666;
    --line: #e5e7eb;
    --brand: #5b8c2a;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 14px/1.5 -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: var(--ink);
    background: #f7fbf2;
  }
  .bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
    padding: 12px 20px; background: #fff; border-bottom: 1px solid var(--line);
  }
  .bar h1 { font-size: 15px; margin: 0 12px 0 0; }
  .bar label { display: flex; gap: 6px; align-items: center; font-size: 13px; color: var(--muted); }
  .bar select, .bar input[type=range] { font: inherit; }
  .bar nav { margin-left: auto; display: flex; flex-wrap: wrap; gap: 6px; }
  .bar nav a { font-size: 12px; color: var(--brand); text-decoration: none; }
  .bar nav a:hover { text-decoration: underline; }
  .note {
    max-width: 1100px; margin: 20px auto 0; padding: 14px 18px;
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
    font-size: 13px; color: #7c4a03;
  }
  .screens { display: flex; flex-direction: column; gap: 40px; padding: 28px 20px 80px; }
  .screen { max-width: 1100px; margin: 0 auto; width: 100%; }
  .screen header { display: flex; flex-wrap: wrap; gap: 10px; align-items: baseline; margin-bottom: 12px; }
  .screen h2 { font-size: 17px; margin: 0; }
  .screen code { font-size: 12px; color: var(--muted); }
  .pill { font-size: 11px; background: var(--brand); color: #fff; padding: 3px 9px; border-radius: 999px; }
  .pill.ok { background: #15803d; }
  .pill.bad { background: #b91c1c; }
  .frames { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
  figure { margin: 0; }
  figcaption { font-size: 11px; color: var(--muted); margin-top: 6px; }
  .fig img, .stage { border: 1px solid var(--line); border-radius: 12px; background: #fff; }
  .stage { position: relative; width: 390px; height: 844px; overflow: hidden; }
  .stage .layer { position: absolute; inset: 0; border: 0; border-radius: 0; }
  .stage .mock { opacity: var(--mock-opacity); }
  .fig { transform: scale(var(--stage-zoom)); transform-origin: top left; }

  /* mode: dua panel berdampingan */
  body[data-mode="side"] .fig-overlay { display: none; }
  /* mode: overlay */
  body[data-mode="overlay"] .fig-mockup,
  body[data-mode="overlay"] .fig-shot { display: none; }
  /* mode: difference */
  body[data-mode="difference"] .fig-mockup,
  body[data-mode="difference"] .fig-shot { display: none; }
  body[data-mode="difference"] .stage .mock { opacity: 1; mix-blend-mode: difference; }
  .missing {
    max-width: 1100px; margin: 0 auto 60px; padding: 18px;
    background: #fff; border: 1px solid var(--line); border-radius: 12px;
  }
  .missing h2 { font-size: 15px; margin: 0 0 8px; }
  .missing ul { margin: 0; padding-left: 20px; color: var(--muted); }
</style>
</head>
<body data-mode="side">

<div class="bar">
  <h1>Farmor — mockup vs implementasi</h1>
  <label>Mode
    <select id="mode">
      <option value="side">Berdampingan</option>
      <option value="overlay">Overlay</option>
      <option value="difference">Difference</option>
    </select>
  </label>
  <label>Opasitas mockup <input id="op" type="range" min="0" max="100" value="50"></label>
  <label>Zoom <input id="zoom" type="range" min="30" max="100" value="100"></label>
  <nav>${screens.map((s) => `<a href="#s-${esc(s.id)}">${esc(s.label)}</a>`).join(' · ')}</nav>
</div>

<p class="note">
  Tangkapan diambil pada viewport <strong>390&times;844</strong> — sama persis dengan artboard
  mockup, jadi tepi dan jarak bisa dibandingkan 1:1. Teks di dalam SVG mockup sudah
  dikonversi jadi outline <code>&lt;path&gt;</code>, sehingga perbedaan label tidak bisa
  dideteksi otomatis: pakai mode <strong>Overlay</strong> atau <strong>Difference</strong>
  untuk melihatnya. Catatan: perbedaan 44px vs 28px pada tombol stepper dan chip kategori
  memang <em>disengaja</em> demi target sentuh (lihat <code>tokens.css</code>).
</p>

<div class="screens">
${screens.map(card).join('\n')}
</div>

<div class="missing">
  <h2>Layar tanpa mockup</h2>
  <p class="muted">Sudah dibangun, belum ada pembanding di <code>mockup/</code> — tetap difoto di atas tanpa gerbang RMSE:</p>
  <ul>${WITHOUT_MOCKUP.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
</div>

<script>
  const root = document.documentElement;
  const body = document.body;

  document.getElementById('mode').addEventListener('change', (e) => {
    body.dataset.mode = e.target.value;
  });
  document.getElementById('op').addEventListener('input', (e) => {
    root.style.setProperty('--mock-opacity', e.target.value / 100);
  });
  document.getElementById('zoom').addEventListener('input', (e) => {
    root.style.setProperty('--stage-zoom', e.target.value / 100);
  });
</script>
</body>
</html>
`;

  writeFileSync(outFile, html, 'utf8');
};
