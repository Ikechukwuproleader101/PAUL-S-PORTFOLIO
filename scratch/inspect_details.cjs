const sharp = require('sharp');

async function inspect() {
  const image = sharp('Desktop - 7.png');
  const metadata = await image.metadata();
  const { width, height } = image;
  const raw = await (sharp('Desktop - 7.png').raw().toBuffer());
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Let's check around Panel 2: x=1, y=21, w=484, h=295
  // Right edge of panel 2: x=484. What is at x=485..505, y=100?
  console.log('Right of Panel 2 (x=480..500, y=150):');
  for (let x = 480; x <= 505; x++) {
    const p = getPixel(x, 150);
    console.log(`x=${x}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }

  // Bottom edge of Panel 2: y=315. What is at x=200, y=310..330?
  console.log('Bottom of Panel 2 (x=200, y=310..330):');
  for (let y = 310; y <= 330; y++) {
    const p = getPixel(200, y);
    console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }

  // Let's check the offset of black shadow:
  // Is it black border + black offset block?
  // Let's check around Panel 1 (top right): x=1095, y=19, w=193, h=301
  console.log('Panel 1 right/bottom shadow test:');
  console.log('Right of Panel 1 (x=1285..1305, y=150):');
  for (let x = 1285; x <= 1305; x++) {
    const p = getPixel(x, 150);
    console.log(`x=${x}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }

  console.log('Bottom of Panel 1 (x=1150, y=315..330):');
  for (let y = 315; y <= 330; y++) {
    const p = getPixel(1150, y);
    console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }
}

inspect();
