const sharp = require('sharp');
const fs = require('fs');

const imgPath = 'C:\\Users\\Ikechukwu\\.gemini\\antigravity-ide\\brain\\af6d057f-b801-4308-9634-f158693ee020\\.user_uploaded\\media_1793113614469.png';

async function analyze() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  console.log('Image dimensions:', info.width, 'x', info.height);

  function getPixel(x, y) {
    if (x < 0 || x >= info.width || y < 0 || y >= info.height) return [0, 0, 0];
    const idx = (info.width * y + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  // 1. Find the right vertical red bar and QR code
  // Let's find where the QR code is in this image
  // QR code has black and white pixels in the bottom right corner
  console.log('Inspecting bottom right corner:');
  for (let y = info.height - 30; y < info.height; y += 5) {
    let row = '';
    for (let x = info.width - 40; x < info.width; x += 4) {
      const [r, g, b] = getPixel(x, y);
      row += (r > 200 ? 'W' : (r < 50 ? 'B' : 'R')) + ' ';
    }
    console.log(`y=${y}: ${row}`);
  }

  // 2. Locate the Right-Side white panel right edge and bottom edge in this crop
  // In the crop, where does the right white panel end?
  // Let's scan horizontally across row y=100
  let panelRightX = -1;
  for (let x = 100; x < info.width; x++) {
    const [r, g, b] = getPixel(x, 100);
    // Is it white?
    if (r > 240 && g > 240 && b > 240) {
      // white
    } else if (r < 30 && g < 30 && b < 30) {
      // black shadow
    } else if (r > 120 && g < 40) {
      // red!
      if (panelRightX === -1) panelRightX = x;
    }
  }
  console.log('Red margin on right starts at x ≈', panelRightX, 'out of', info.width);

  // 3. Scan row y near bottom to find horizontal "MY WORKS"
  // Let's scan y=215 (near bottom) across all x
  console.log('Scanning y=215 for horizontal MY WORKS:');
  let textSegments = [];
  for (let x = 0; x < info.width; x++) {
    const [r, g, b] = getPixel(x, 215);
    if (r > 200 && g > 200 && b > 200) {
      textSegments.push(x);
    }
  }
  if (textSegments.length) {
    console.log(`White text found from x=${textSegments[0]} to x=${textSegments[textSegments.length - 1]}`);
  }

  // 4. Scan column near right edge (x = 320) for vertical "MY WORKS"
  console.log('Scanning x=320 for vertical MY WORKS:');
  let vSegments = [];
  for (let y = 0; y < info.height; y++) {
    const [r, g, b] = getPixel(320, y);
    if (r > 200 && g > 200 && b > 200) {
      vSegments.push(y);
    }
  }
  if (vSegments.length) {
    console.log(`Vertical white text found from y=${vSegments[0]} to y=${vSegments[vSegments.length - 1]}`);
  }
}

analyze().catch(console.error);
