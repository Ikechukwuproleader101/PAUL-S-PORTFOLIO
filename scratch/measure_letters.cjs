const sharp = require('sharp');

async function measureLetters() {
  const { data, info } = await sharp('scratch/ref_horizontal_and_qr.png').raw().toBuffer({ resolveWithObject: true });
  console.log('Horizontal crop:', info.width, 'x', info.height);

  function getPixel(x, y) {
    const idx = (info.width * y + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  // Find the top and bottom of the letter 'M' in 'MY WORKS'
  // 'M' is near x=15 to x=35
  let mTop = 999, mBottom = -1, mLeft = 999, mRight = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 10; x < 40; x++) {
      const [r, g, b] = getPixel(x, y);
      if (r > 200 && g > 200 && b > 200) {
        if (y < mTop) mTop = y;
        if (y > mBottom) mBottom = y;
        if (x < mLeft) mLeft = x;
        if (x > mRight) mRight = x;
      }
    }
  }
  const mHeight = mBottom - mTop + 1;
  const mWidth = mRight - mLeft + 1;
  console.log('Letter M in crop:', { mTop, mBottom, mHeight, mLeft, mRight, mWidth });

  // Total height of the red bar in this crop:
  // From Central-2 bottom black line to bottom of image
  // Let's find Central-2 bottom black line in column x=20
  let blackBottom = -1;
  for (let y = 0; y < mTop; y++) {
    const [r, g, b] = getPixel(20, y);
    if (r < 50 && g < 50 && b < 50) {
      blackBottom = y;
    }
  }
  console.log('Central-2 bottom shadow ends at y =', blackBottom);
  console.log('Red bar height in crop =', info.height - blackBottom);
  console.log('M height / Red bar height ratio =', mHeight / (info.height - blackBottom));

  // Measure QR code in this crop:
  let qrT = 999, qrB = -1, qrL = 999, qrR = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 170; x < info.width; x++) {
      const [r, g, b] = getPixel(x, y);
      // QR code white or black
      if (r > 220 || r < 30) {
        if (y < qrT) qrT = y;
        if (y > qrB) qrB = y;
        if (x < qrL) qrL = x;
        if (x > qrR) qrR = x;
      }
    }
  }
  console.log('QR in crop:', { qrT, qrB, qrH: qrB - qrT + 1, qrL, qrR, qrW: qrR - qrL + 1 });
}

measureLetters().catch(console.error);
