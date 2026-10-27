const sharp = require('sharp');

async function checkCamTopRight() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Let's inspect x=550..650, y=550..660
  // Panel 5 is x=0..628, y=334..639
  // Panel 5 bottom shadow is at y=640..649
  // But where does the camera body lie?
  // Camera top-right corner:
  for (let y = 600; y <= 660; y += 5) {
    let line = `y=${y}: `;
    for (let x = 500; x <= 640; x += 20) {
      const p = getPixel(x, y);
      line += `[${x}]:(${p[0]},${p[1]},${p[2]}) `;
    }
    console.log(line);
  }
}

checkCamTopRight();
