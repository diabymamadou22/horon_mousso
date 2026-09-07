import fs from 'fs';
import path from 'path';

// Minimal 1x1 or valid PNG base64 representation or PNG chunk writer
// Let's create a clean valid PNG binary buffer directly
// A valid PNG file with chunk structure (IHDR, IDAT, IEND)
function createSolidColorPng(width, height, r, g, b, a = 255) {
  // We can write a clean RGBA uncompressed PNG or use a canvas if available in node
  // Or SVG embedded in HTML. Modern browsers and PWA engines handle data URIs or SVG icons,
  // but to satisfy Lighthouse & PWA manifest standards with real PNG files:
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  function crc32(buf) {
    let table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      table[n] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, toCrc, crc]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw uncompressed scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // create a handsome dark green with slight gold border
      const isBorder = x < 4 || x >= width - 4 || y < 4 || y >= height - 4;
      if (isBorder) {
        rawData[pxOffset] = 245;     // R (Gold)
        rawData[pxOffset + 1] = 158; // G
        rawData[pxOffset + 2] = 11;  // B
        rawData[pxOffset + 3] = 255; // A
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = a;
      }
    }
  }

  // Deflate using zlib
  import('zlib').then(zlib => {
    const compressed = zlib.deflateSync(rawData);
    const idatChunk = makeChunk('IDAT', compressed);
    const iendChunk = makeChunk('IEND', Buffer.alloc(0));
    const fullPng = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    fs.writeFileSync(path.join(publicDir, `pwa-${width}x${height}.png`), fullPng);
    if (width === 512) {
      fs.writeFileSync(path.join(publicDir, `pwa-maskable-512x512.png`), fullPng);
      fs.writeFileSync(path.join(publicDir, `apple-touch-icon.png`), fullPng);
    }
    console.log(`Generated PWA icon: ${width}x${height}`);
  });
}

createSolidColorPng(192, 192, 45, 90, 39); // Forest green #2D5A27
createSolidColorPng(512, 512, 45, 90, 39);
