const sharp = require('sharp');

async function checkShapes() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  function isWhite(x, y) {
    const [r, g, b] = getPixel(x, y);
    return r > 240 && g > 240 && b > 240;
  }

  // Check column bounds of Panel 3 at different y coordinates
  console.log('Panel 3 width at various Y:');
  for (let y = 30; y <= 400; y += 20) {
    let minX = -1, maxX = -1;
    for (let x = 500; x <= 1100; x++) {
      if (isWhite(x, y)) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    console.log(`y=${y}: minX=${minX}, maxX=${maxX}, w=${maxX - minX + 1}`);
  }
}

checkShapes();
