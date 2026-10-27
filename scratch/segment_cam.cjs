const sharp = require('sharp');

async function segmentCamera() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Camera region:
  // x: 0 to 670, y: 550 to 1024
  const cropX = 0;
  const cropY = 550;
  const cropW = 670;
  const cropH = 474;

  // Let's create an alpha mask buffer (cropW * cropH)
  // Initially all 0 (transparent)
  const alpha = new Uint8Array(cropW * cropH);

  // We know the camera pixels:
  // For each pixel (cx, cy):
  // Let's check if it's outside the camera:
  // Red background: (r > 130 && g < 35 && b < 35)
  // Pure white panel: (r > 248 && g > 248 && b > 248)
  // Panel shadow on right (fx >= 630 && r < 30 && g < 30 && b < 30)
  // Note: camera itself has beige/cream, lens glass, dark shadows.
  // Wait, does the camera body have pure white?
  // Let's check if camera has pure white pixels (r > 248, g > 248, b > 248)
  let pureWhiteInCamera = 0;
  for (let cy = 100; cy < cropH; cy++) {
    for (let cx = 0; cx < 400; cx++) {
      const [r, g, b] = getPixel(cropX + cx, cropY + cy);
      if (r > 248 && g > 248 && b > 248) pureWhiteInCamera++;
    }
  }
  console.log('Pure white pixels inside sample camera region:', pureWhiteInCamera);

  // Flood fill from outside (e.g. cx=0, cy=0 is pure white panel):
  const visited = new Uint8Array(cropW * cropH);
  const queue = [[0, 0], [cropW - 1, 0], [cropW - 1, Math.floor(cropH / 2)]];
  visited[0] = 1;
  visited[cropW - 1] = 1;

  function isBackground(cx, cy) {
    const fx = cropX + cx;
    const fy = cropY + cy;
    const [r, g, b] = getPixel(fx, fy);

    // Red canvas
    if (r > 130 && g < 40 && b < 40) return true;
    
    // Panel right shadow
    if (fx >= 633 && r < 40 && g < 40 && b < 40) return true;

    // White panel
    if (r >= 250 && g >= 250 && b >= 250) return true;

    // Near white panel compression artifacts
    if (r >= 245 && g >= 245 && b >= 245) return true;

    return false;
  }

  while (queue.length > 0) {
    const [cx, cy] = queue.pop();
    const idx = cy * cropW + cx;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
        const nidx = ny * cropW + nx;
        if (!visited[nidx] && isBackground(nx, ny)) {
          visited[nidx] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  // Any pixel not visited is camera!
  const outBuffer = Buffer.alloc(cropW * cropH * 4);
  for (let cy = 0; cy < cropH; cy++) {
    for (let cx = 0; cx < cropW; cx++) {
      const idx = cy * cropW + cx;
      const outIdx = idx * 4;
      const [r, g, b, a] = getPixel(cropX + cx, cropY + cy);
      if (!visited[idx]) {
        outBuffer[outIdx] = r;
        outBuffer[outIdx + 1] = g;
        outBuffer[outIdx + 2] = b;
        outBuffer[outIdx + 3] = 255;
      } else {
        outBuffer[outIdx] = 0;
        outBuffer[outIdx + 1] = 0;
        outBuffer[outIdx + 2] = 0;
        outBuffer[outIdx + 3] = 0;
      }
    }
  }

  await sharp(outBuffer, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile('scratch/camera_extracted.png');

  console.log('Camera extracted to scratch/camera_extracted.png');
}

segmentCamera();
