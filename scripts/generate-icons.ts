import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator that produces valid RGBA PNG files without native dependencies
function createPng(width: number, height: number, draw: (x: number, y: number) => [number, number, number, number]): Buffer {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (rowSize + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = draw(x, y);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate 192x192
const png192 = createPng(192, 192, (x, y) => {
  const cx = 96, cy = 96;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  // Rounded square icon boundary
  if (Math.abs(x - cx) > 86 || Math.abs(y - cy) > 86) return [0, 0, 0, 0];
  if (dist < 40) return [16, 185, 129, 255]; // Emerald core
  if (dist < 44) return [6, 182, 212, 255]; // Cyan ring
  return [2, 6, 23, 255]; // Slate 950 bg
});
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 2. Generate 512x512
const png512 = createPng(512, 512, (x, y) => {
  const cx = 256, cy = 256;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (Math.abs(x - cx) > 230 || Math.abs(y - cy) > 230) return [0, 0, 0, 0];
  if (dist < 110) return [16, 185, 129, 255]; // Emerald core
  if (dist < 120) return [6, 182, 212, 255]; // Cyan ring
  return [2, 6, 23, 255]; // Slate 950 bg
});
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 3. Generate maskable 512x512 (Safe-zone padded, full bleed solid background)
const pngMaskable = createPng(512, 512, (x, y) => {
  const cx = 256, cy = 256;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist < 90) return [16, 185, 129, 255];
  if (dist < 100) return [6, 182, 212, 255];
  return [2, 6, 23, 255]; // Solid full bleed background for maskable
});
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// 4. Generate apple-touch-icon 180x180
const pngApple = createPng(180, 180, (x, y) => {
  const cx = 90, cy = 90;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist < 40) return [16, 185, 129, 255];
  if (dist < 45) return [6, 182, 212, 255];
  return [2, 6, 23, 255];
});
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

console.log('PWA PNG icons generated successfully in public/');
