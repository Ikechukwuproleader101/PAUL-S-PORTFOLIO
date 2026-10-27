const sharp = require('sharp');

async function checkOverlap() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Check column x=920..940 at y=300..420
  console.log('Checking boundary between Upper-Middle and Right-Side Panel:');
  for (let y = 310; y <= 350; y += 5) {
    let line = `y=${y}: `;
    for (let x = 910; x <= 940; x += 5) {
      const p = getPixel(x, y);
      const isW = p[0] > 240 && p[1] > 240 && p[2] > 240;
      const isB = p[0] < 30 && p[1] < 30 && p[2] < 30;
      const isR = p[0] > 140 && p[1] < 30 && p[2] < 30;
      line += `[${x}]:${isW?'W':isB?'B':isR?'R':'?'}(${p[0]},${p[1]},${p[2]}) `;
    }
    console.log(line);
  }
}

checkOverlap();
