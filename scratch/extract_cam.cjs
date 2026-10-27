const sharp = require('sharp');

async function extractCamera() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  const cropX = 0;
  const cropY = 580;
  const cropW = 670;
  const cropH = 444; // to 1024

  function isBgPixel(cx, cy) {
    const fx = cropX + cx;
    const fy = cropY + cy;
    const [r, g, b] = getPixel(fx, fy);
    
    // Check if red background
    const isRed = (r > 130 && g < 35 && b < 35);
    // Check if white panel
    const isWhite = (r > 240 && g > 240 && b > 240);
    // Check if black panel shadow (between x=633 and 644)
    const isPanelShadow = (r < 20 && g < 20 && b < 20 && fx >= 633);
    
    return isRed || isWhite || isPanelShadow;
  }

  console.log('Top edge of crop:');
  for (let cx = 0; cx < cropW; cx += 50) {
    console.log(`cx=${cx}:`, isBgPixel(cx, 0), getPixel(cropX + cx, cropY));
  }
}

extractCamera();
