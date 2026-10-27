const sharp = require('sharp');

async function checkInsideUpperMiddle() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Look for any non-white pixel inside x=660..900, y=310..325
  let nonWhite = [];
  for (let y = 310; y <= 330; y++) {
    for (let x = 660; x <= 900; x++) {
      const p = getPixel(x, y);
      if (p[0] < 240 || p[1] < 240 || p[2] < 240) {
        nonWhite.push({ x, y, p });
      }
    }
  }
  console.log(`Non-white pixels inside step region: ${nonWhite.length}`);
  if (nonWhite.length > 0) {
    console.log('Sample non-white:', nonWhite.slice(0, 5));
  }
}

checkInsideUpperMiddle();
