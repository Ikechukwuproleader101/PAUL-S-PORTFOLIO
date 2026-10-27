const sharp = require('sharp');

async function inspectAllPanels() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  function isBlack(x, y) {
    const [r, g, b] = getPixel(x, y);
    return r < 30 && g < 30 && b < 30;
  }

  function isWhite(x, y) {
    const [r, g, b] = getPixel(x, y);
    return r > 240 && g > 240 && b > 240;
  }

  // Let's test border around Panel 3: x=506, y=21, w=576, h=372
  console.log('Testing Panel 3 borders:');
  console.log('Top of Panel 3 at x=600, y=10..25:');
  for (let y = 10; y <= 25; y++) {
    const p = getPixel(600, y);
    console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }
  console.log('Left of Panel 3 at x=495..510, y=100:');
  for (let x = 495; x <= 510; x++) {
    const p = getPixel(x, 100);
    console.log(`x=${x}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }
  console.log('Right of Panel 3 at x=1075..1100, y=100:');
  for (let x = 1075; x <= 1100; x++) {
    const p = getPixel(x, 100);
    console.log(`x=${x}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }
  console.log('Bottom of Panel 3 at x=800, y=365..400:');
  for (let y = 365; y <= 400; y++) {
    const p = getPixel(800, y);
    console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }
}

inspectAllPanels();
