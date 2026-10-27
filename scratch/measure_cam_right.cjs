const sharp = require('sharp');

async function measureCameraRight() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Camera right shadow:
  // At y=750..820, where is the right shadow and where is white/red?
  for (let y = 740; y <= 830; y += 10) {
    let line = `y=${y}: `;
    for (let x = 540; x <= 585; x += 3) {
      const p = getPixel(x, y);
      const isW = p[0] > 240 && p[1] > 240 && p[2] > 240;
      const isR = p[0] > 140 && p[1] < 40 && p[2] < 40;
      const isB = p[0] < 30 && p[1] < 30 && p[2] < 30;
      line += `[${x}]:${isW?'W':isR?'R':isB?'B':'Cam'}(${p[0]},${p[1]},${p[2]}) `;
    }
    console.log(line);
  }
}

measureCameraRight();
