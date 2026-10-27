const sharp = require('sharp');

async function checkAbove() {
  const { data, info } = await sharp('scratch/ref_horizontal_and_qr.png').raw().toBuffer({ resolveWithObject: true });
  function getPixel(x, y) {
    const idx = (info.width * y + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  // Check top 5 rows (y=0 to y=5) across x=0 to 180 to see white panels and black shadows
  console.log('Top rows of horizontal crop:');
  for (let x = 0; x < info.width; x += 10) {
    const [r, g, b] = getPixel(x, 1);
    const type = (r > 200 && g > 200 && b > 200) ? 'WHITE' : ((r < 50 && g < 50 && b < 50) ? 'BLACK' : 'RED');
    console.log(`x=${x}: ${type} (${r},${g},${b})`);
  }
}

checkAbove().catch(console.error);
