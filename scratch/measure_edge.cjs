const sharp = require('sharp');

async function measureTopEdge() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Camera body top edge has a beige surface.
  // Above it is white or the black shadow of the camera body!
  // The camera itself has a hard black cast shadow on top and right!
  // Let's see: how thick is the black shadow behind the camera body?
  // Let's check at x=200, 300, 400, 500:
  for (const x of [200, 250, 300, 350, 400, 450, 500, 530]) {
    console.log(`--- x=${x} ---`);
    for (let y = 600; y <= 750; y += 3) {
      const p = getPixel(x, y);
      // check if it's white, black, red, or beige
      const isW = p[0] > 240 && p[1] > 240 && p[2] > 240;
      const isR = p[0] > 140 && p[1] < 40 && p[2] < 40;
      const isB = p[0] < 30 && p[1] < 30 && p[2] < 30;
      const isBeige = p[0] > 180 && p[1] > 160 && p[2] < p[1];
      if (!isW && !isR) {
        console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}] ${isB?'BLACK':isBeige?'BEIGE':''}`);
      }
    }
  }
}

measureTopEdge();
