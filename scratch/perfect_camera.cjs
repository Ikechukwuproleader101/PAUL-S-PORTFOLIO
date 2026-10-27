const sharp = require('sharp');

async function extractPerfectCamera() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  const minX = 0;
  const maxX = 655;
  const minY = 580;
  const maxY = 1024;
  const outW = maxX - minX + 1;
  const outH = maxY - minY + 1;

  // Lens right rim curve:
  // At y=815: x ~ 575
  // At y=840: x ~ 595
  // At y=870: x ~ 620
  // At y=885: x ~ 632
  // At y=900: x ~ 642
  // At y=930: x ~ 652
  // At y=960: x ~ 655
  // At y=1024: x ~ 655 (cuts out)
  // Let's trace the lens edge specifically by looking for the transition to red background (#b50c0c):
  const lensRightEdge = [];
  for (let y = 815; y < 1024; y++) {
    let rx = 560;
    for (let x = 655; x >= 560; x--) {
      const [r, g, b] = getPixel(x, y);
      const isRed = (r >= 135 && g <= 40 && b <= 40);
      const isWhite = (r >= 248 && g >= 248 && b >= 248);
      // If y < 885, anything at x >= 633 is panel 7's right border/shadow/gap, not the lens!
      if (y < 885 && x >= 632) continue;
      
      if (!isRed && !isWhite) {
        rx = x;
        break;
      }
    }
    lensRightEdge[y] = rx;
  }

  const outBuf = Buffer.alloc(outW * outH * 4);

  for (let y = minY; y < maxY; y++) {
    const cy = y - minY;
    for (let x = minX; x <= maxX; x++) {
      const cx = x - minX;
      const outIdx = (cy * outW + cx) * 4;
      const [r, g, b] = getPixel(x, y);

      let isCam = false;

      // Knob (x: 115..165, y: 585..610)
      if (x >= 115 && x <= 165 && y >= 585 && y <= 610) {
        const isWhite = (r >= 248 && g >= 248 && b >= 248);
        if (!isWhite) isCam = true;
      }
      
      // Left of knob (x: 0..115)
      if (x < 115) {
        const topY = 630 - (x / 115) * 24;
        if (y >= Math.floor(topY)) {
          isCam = true;
        }
      }

      // Camera body (x: 115..555, y: 602..820)
      if (x >= 115 && x <= 555) {
        let topY;
        if (x <= 160) {
          topY = 603;
        } else {
          topY = 603 + ((x - 160) / (555 - 160)) * (738 - 603);
        }
        if (y >= Math.floor(topY)) {
          isCam = true;
        }
      }

      // Right shadow of body (x: 555..568, y: 735..815)
      if (x > 555 && x <= 567 && y >= 735 && y < 815) {
        const isWhite = (r >= 248 && g >= 248 && b >= 248);
        if (!isWhite) isCam = true;
      }

      // Lens and lower camera (y >= 815)
      if (y >= 815) {
        const rx = lensRightEdge[y] || 630;
        if (x <= rx) {
          isCam = true;
        }
      }

      if (isCam) {
        outBuf[outIdx] = r;
        outBuf[outIdx + 1] = g;
        outBuf[outIdx + 2] = b;
        outBuf[outIdx + 3] = 255;
      } else {
        outBuf[outIdx] = 0;
        outBuf[outIdx + 1] = 0;
        outBuf[outIdx + 2] = 0;
        outBuf[outIdx + 3] = 0;
      }
    }
  }

  await sharp(outBuf, { raw: { width: outW, height: outH, channels: 4 } })
    .png()
    .toFile('public/assets/camera/moonshake-camera.png');

  console.log(`Saved refined camera to public/assets/camera/moonshake-camera.png (${outW}x${outH})`);
}

extractPerfectCamera();
