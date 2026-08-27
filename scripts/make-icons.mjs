import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../public/icons");

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function colorAt(x, y, size) {
  const nx = (x + 0.5) / size;
  const ny = (y + 0.5) / size;
  const green = [49, 94, 75];
  const gold = [200, 169, 107];
  const cream = [247, 250, 245];
  const d1 = Math.hypot(nx - 0.46, ny - 0.46);
  const d2 = Math.hypot(nx - 0.58, ny - 0.4);
  const star = Math.hypot(nx - 0.68, ny - 0.32);
  if (star < 0.045) return cream;
  if (d1 < 0.28 && d2 > 0.22) return gold;
  return green;
}

function writePng(size, name) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = colorAt(x, y, size);
      const i = row + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(join(dir, name), png);
}

writePng(192, "icon-192.png");
writePng(512, "icon-512.png");
writePng(180, "apple-touch-icon.png");
console.log("icons written");
