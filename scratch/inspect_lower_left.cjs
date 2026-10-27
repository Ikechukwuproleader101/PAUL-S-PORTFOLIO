const sharp = require('sharp');

async function inspectLowerLeft() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Let's check from x=0..650, y=600..1024
  // Where are the white pixels, black pixels, red pixels, and camera pixels?
  console.log('Inspecting lower-left (x=0..650, y=600..1024)...');

  // Let's check what x=300, y=650..884 is
  console.log('Sample at x=500, y=650..880:');
  for (let y = 640; y <= 890; y += 20) {
    const p = getPixel(500, y);
    console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }

  // What is at x=500, y=630..660?
  console.log('Boundary around y=640 at x=500:');
  for (let y = 635; y <= 655; y++) {
    const p = getPixel(500, y);
    console.log(`y=${y}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }

  // What is at x=630..645, y=700?
  console.log('Right boundary of this region at y=700:');
  for (let x = 630; x <= 645; x++) {
    const p = getPixel(x, 700);
    console.log(`x=${x}: [${p[0]}, ${p[1]}, ${p[2]}]`);
  }

  // What is at x=0..200, y=700?
  console.log('Camera area at x=50, y=700:');
  console.log(getPixel(50, 700));
}

inspectLowerLeft();
