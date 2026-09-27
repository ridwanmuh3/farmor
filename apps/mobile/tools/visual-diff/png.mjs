/**
 * Dekoder PNG minimal (bit depth 8, color type 2/6, tanpa interlace) + RMSE.
 *
 * Tanpa dependensi: Node sudah punya zlib. Dipakai gerbang visual-diff untuk
 * membandingkan tangkapan layar dengan mockup. Hanya butuh piksel mentah,
 * jadi chunk lain (PLTE, tRNS, ...) diabaikan.
 */
import { inflateSync } from 'node:zlib';

const CHANNELS = { 2: 3, 6: 4 };

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** Kembalikan { width, height, data } — data RGBA 8-bit, panjang w*h*4. */
export const decodePng = (buffer) => {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('Bukan berkas PNG.');

  let offset = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const depth = body[8];
      const colorType = body[9];
      if (depth !== 8) throw new Error(`Bit depth ${depth} belum didukung.`);
      if (body[12] !== 0) throw new Error('PNG interlace belum didukung.');
      channels = CHANNELS[colorType];
      if (!channels) throw new Error(`Color type ${colorType} belum didukung.`);
    } else if (type === 'IDAT') {
      idat.push(body);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length; // length + type + body + crc
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 4);
  const line = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const prev = y === 0 ? null : line;

    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? line[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      const value = src[x];
      line[x] =
        filter === 0 ? value
        : filter === 1 ? (value + a) & 0xff
        : filter === 2 ? (value + b) & 0xff
        : filter === 3 ? (value + ((a + b) >> 1)) & 0xff
        : filter === 4 ? (value + paeth(a, b, c)) & 0xff
        : value;
    }

    for (let x = 0; x < width; x += 1) {
      const s = x * channels;
      const d = (y * width + x) * 4;
      out[d] = line[s];
      out[d + 1] = line[s + 1];
      out[d + 2] = line[s + 2];
      out[d + 3] = channels === 4 ? line[s + 3] : 255;
    }
  }

  return { width, height, data: out };
};

/** RMSE 0..1 antara dua gambar; 0 = identik. Ukuran harus sama. */
export const rmse = (a, b) => {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`Ukuran beda: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  let sum = 0;
  const n = a.data.length;
  for (let i = 0; i < n; i += 1) {
    const d = a.data[i] - b.data[i];
    sum += d * d;
  }
  return Math.sqrt(sum / n) / 255;
};
