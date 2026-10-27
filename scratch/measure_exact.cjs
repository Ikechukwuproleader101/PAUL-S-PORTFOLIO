const sharp = require('sharp');

const imgPath = 'C:\\Users\\Ikechukwu\\.gemini\\antigravity-ide\\brain\\af6d057f-b801-4308-9634-f158693ee020\\.user_uploaded\\media_1793113614469.png';

async function measure() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  console.log('Image:', info.width, 'x', info.height);

  function getPixel(x, y) {
    if (x < 0 || x >= info.width || y < 0 || y >= info.height) return [0,0,0];
    const idx = (info.width * y + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  // 1. QR Code bounding box:
  // In bottom right corner: find black & white square
  let qrMinX = 999, qrMaxX = -1, qrMinY = 999, qrMaxY = -1;
  // QR code is near x > 280, y > 190
  for (let y = 190; y < info.height; y++) {
    for (let x = 280; x < info.width; x++) {
      const [r, g, b] = getPixel(x, y);
      // QR code has pure white and pure black pixels, and white border
      // Check if pixel is within the QR code box (background of QR is white)
      if ((r > 230 && g > 230 && b > 230) || (r < 30 && g < 30 && b < 30)) {
        // Exclude the text "MY WORKS" which is to the left or above
        if (x > 305 && y > 200) {
          if (x < qrMinX) qrMinX = x;
          if (x > qrMaxX) qrMaxX = x;
          if (y < qrMinY) qrMinY = y;
          if (y > qrMaxY) qrMaxY = y;
        }
      }
    }
  }
  console.log('QR Code in reference (352x241):', { qrMinX, qrMaxX, qrMinY, qrMaxY, w: qrMaxX - qrMinX + 1, h: qrMaxY - qrMinY + 1 });

  // 2. Horizontal "MY WORKS":
  // In bottom red bar: y >= 200, x between 150 and 310
  let hTextMinX = 999, hTextMaxX = -1, hTextMinY = 999, hTextMaxY = -1;
  for (let y = 200; y < info.height; y++) {
    for (let x = 140; x < qrMinX - 2; x++) {
      const [r, g, b] = getPixel(x, y);
      // White text: r > 200, g > 200, b > 200
      if (r > 200 && g > 200 && b > 200) {
        if (x < hTextMinX) hTextMinX = x;
        if (x > hTextMaxX) hTextMaxX = x;
        if (y < hTextMinY) hTextMinY = y;
        if (y > hTextMaxY) hTextMaxY = y;
      }
    }
  }
  console.log('Horizontal "MY WORKS" in reference:', {
    hTextMinX, hTextMaxX, hTextMinY, hTextMaxY,
    w: hTextMaxX - hTextMinX + 1,
    h: hTextMaxY - hTextMinY + 1
  });

  // 3. Vertical "MY WORKS":
  // On the right margin: x >= 300, y between 50 and 210
  let vTextMinX = 999, vTextMaxX = -1, vTextMinY = 999, vTextMaxY = -1;
  for (let y = 40; y < qrMinY - 2; y++) {
    for (let x = 300; x < info.width; x++) {
      const [r, g, b] = getPixel(x, y);
      if (r > 200 && g > 200 && b > 200) {
        if (x < vTextMinX) vTextMinX = x;
        if (x > vTextMaxX) vTextMaxX = x;
        if (y < vTextMinY) vTextMinY = y;
        if (y > vTextMaxY) vTextMaxY = y;
      }
    }
  }
  console.log('Vertical "MY WORKS" in reference:', {
    vTextMinX, vTextMaxX, vTextMinY, vTextMaxY,
    w: vTextMaxX - vTextMinX + 1,
    h: vTextMaxY - vTextMinY + 1
  });

  // 4. Panel coordinates in reference for scaling reference:
  // Let's find right-side panel bounding box:
  // Central-2 bounding box:
  // Lower-left bounding box:
}

measure().catch(console.error);
