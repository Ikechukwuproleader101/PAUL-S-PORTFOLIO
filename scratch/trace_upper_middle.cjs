const sharp = require('sharp');

async function traceUpperMiddle() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  function isWhite(x, y) {
    const [r, g, b] = getPixel(x, y);
    return r > 240 && g > 240 && b > 240;
  }

  // Scan minX and maxX for each y from y=20 to y=400 in region x=490..1100
  console.log('Upper-Middle panel outline:');
  for (let y = 18; y <= 400; y++) {
    let minX = -1, maxX = -1;
    for (let x = 495; x <= 1095; x++) {
      if (isWhite(x, y)) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1) {
      if (y === 18 || y === 22 || y === 314 || y === 315 || y === 316 || y === 317 || y === 318 || y === 319 || y === 320 || y === 325 || y === 390 || y === 392 || y === 393) {
        console.log(`y=${y}: minX=${minX}, maxX=${maxX}, w=${maxX - minX + 1}`);
      }
    }
  }
}

traceUpperMiddle();
