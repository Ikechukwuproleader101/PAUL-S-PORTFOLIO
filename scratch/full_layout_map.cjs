const sharp = require('sharp');

async function analyzeLayout() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Let's check what color is at various points across the bottom
  console.log('Sampling bottom area at y=950:');
  for (let x = 100; x < 1400; x += 200) {
    console.log(`x=${x}, y=950:`, getPixel(x, 950));
  }

  // Check bottom of right-side panel:
  console.log('Right-side panel bottom (x=1100, y=870..900):');
  for (let y = 870; y <= 895; y++) {
    console.log(`y=${y}:`, getPixel(1100, y));
  }

  // Check bottom of middle small panel:
  console.log('Middle small panel bottom (x=750, y=875..900):');
  for (let y = 875; y <= 900; y++) {
    console.log(`y=${y}:`, getPixel(750, y));
  }

  // Check what is at x=0..640, y=870..920:
  console.log('Lower-left area bottom (x=500, y=870..920):');
  for (let y = 870; y <= 920; y++) {
    console.log(`y=${y}:`, getPixel(500, y));
  }
}

analyzeLayout();
