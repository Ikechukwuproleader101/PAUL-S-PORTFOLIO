const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('Desktop - 8.png');
let offset = 8;
const idatChunks = [];
let width, height;

while (offset < buf.length) {
  const len = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(offset + 8);
    height = buf.readUInt32BE(offset + 12);
  } else if (type === 'IDAT') idatChunks.push(buf.slice(offset + 8, offset + 8 + len));
  offset += 12 + len;
}
const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
const bpp = 4;
const rowSize = 1 + width * bpp;
const raw = Buffer.alloc(width * height * bpp);
for (let y = 0; y < height; y++) {
  const filter = decompressed[y * rowSize];
  const rowStart = y * rowSize + 1;
  const outRowStart = y * width * bpp;
  const prevOutRowStart = (y - 1) * width * bpp;
  for (let x = 0; x < width * bpp; x++) {
    const rawByte = decompressed[rowStart + x];
    const a = x >= bpp ? raw[outRowStart + x - bpp] : 0;
    const b = y > 0 ? raw[prevOutRowStart + x] : 0;
    const c = (x >= bpp && y > 0) ? raw[prevOutRowStart + x - bpp] : 0;
    let val = 0;
    if (filter === 0) val = rawByte;
    else if (filter === 1) val = (rawByte + a) & 0xff;
    else if (filter === 2) val = (rawByte + b) & 0xff;
    else if (filter === 3) val = (rawByte + Math.floor((a + b) / 2)) & 0xff;
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      let pr = c;
      if (pa <= pb && pa <= pc) pr = a;
      else if (pb <= pc) pr = b;
      val = (rawByte + pr) & 0xff;
    }
    raw[outRowStart + x] = val;
  }
}
function getPixel(x, y) {
  const idx = (y * width + x) * bpp;
  return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
}

// 1. Barcode
// Find exact top and bottom of barcode:
let bTop = 874, bBottom = 969;
// Let's verify each bar at y = 900
const sampleY = 900;
let inBar = false;
let barStart = 0;
const bars = [];
for (let x = 0; x < width; x++) {
  const [r, g, b] = getPixel(x, sampleY);
  const isBlack = (r < 50 && g < 50 && b < 50);
  if (isBlack && !inBar) {
    inBar = true;
    barStart = x;
  } else if (!isBlack && inBar) {
    inBar = false;
    bars.push({ x: barStart, width: x - barStart });
  }
}
if (inBar) bars.push({ x: barStart, width: width - barStart });

const barcodeX0 = bars[0].x;
const barcodeW = (bars[bars.length - 1].x + bars[bars.length - 1].width) - barcodeX0;
const barcodeH = bBottom - bTop + 1;

console.log('Barcode dimensions:');
console.log({ barcodeX0, barcodeW, barcodeH, bTop, bBottom });
console.log('Relative bars (x relative to barcode start):');
const relBars = bars.map(b => ({ x: b.x - barcodeX0, width: b.width }));
console.log(JSON.stringify(relBars));

fs.writeFileSync('scratch/barcode_data.json', JSON.stringify({
  x0: barcodeX0,
  y0: bTop,
  totalWidth: barcodeW,
  totalHeight: barcodeH,
  bars: relBars
}, null, 2));
