const sharp = require('sharp');
const fs = require('fs');

async function processCamera() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // In Desktop - 7.png, the camera occupies the bottom left.
  // Let's find exactly which pixels belong to the camera.
  // The camera sits on top of:
  // - Red canvas (#b50c0c)
  // - Panel 5 (white, x=0..628, y=334..639)
  // - Panel 7 (white, x=0..633, y=650..884)
  // - Panel 5 bottom shadow (y=640..649, x>=633)
  // - Panel 7 right shadow (x=634..644)
  //
  // Along the top edge of the camera (x=0 to ~560, y=585 to ~740),
  // there is the camera top edge and its shadow.
  // Along the right edge (x ~560 to 650, y ~740 to 1024),
  // there is the camera right edge and lens rim.

  // Let's create an alpha mask for the camera on the full 1440x1024 canvas (or cropped to camera bounds).
  // First, find the camera's bounding box:
  // Let's test a precise boundary finder:
  // For each column x from 0 to 660, let's find the top edge of the camera.
  // Above the camera:
  // x=0..120: camera top rises from y=630 down to y=600 at knob (x=120..160)
  // Between x=0 and 420:
  // Above the camera top is Panel 5 (white, y<640), Panel 5 shadow (y=640..649), or Panel 7 (white, y=650..884).
  // Notice: The camera body at x=0..420 has:
  // beige color: r ~ 220-250, g ~ 200-240, b ~ 180-220.
  // Notice that beige has r > g > b, and r-b is at least 20! (White has r ~= g ~= b, difference < 5).
  // Furthermore, camera shadow has r < 50, g < 50, b < 50.
  // And camera body has black text "MOONSHAKE".
  // So a pixel is CAMERA if:
  // 1. It is below the camera's top boundary and to the left of the lens right boundary.
  
  // Let's trace the boundary manually/semi-automatically with high precision:
  // Let's check the top boundary points every 5 pixels:
  console.log('Detecting camera outline...');
  const topEdge = [];
  for (let x = 0; x <= 660; x++) {
    let edgeY = -1;
    // Scan from y=580 downwards
    for (let y = 580; y < 1024; y++) {
      const [r, g, b] = getPixel(x, y);
      
      // Is this pixel pure white panel?
      const isPureWhite = (r >= 248 && g >= 248 && b >= 248);
      // Is this pixel red background?
      const isRed = (r >= 140 && g <= 40 && b <= 40);
      
      // Check if it's the horizontal shadow of Panel 5 (y=640..649, between Panel 5 and Panel 7):
      // Camera is in front of this shadow if x < 410?
      // Wait, let's check: does the camera cover y=640 at x=0..410?
      // YES! The camera top knob is at y=585, top corner is at y=600!
      // So at x < 410, the camera is ALREADY at y=600..635, which is ABOVE y=640!
      // So the Panel 5 shadow at y=640 is BEHIND the camera!
      
      if (!isPureWhite && !isRed) {
        // If x > 410 and y=640..649, that is the panel shadow outside the camera!
        if (x > 410 && y >= 640 && y <= 649 && (r < 30 && g < 30 && b < 30)) {
          continue;
        }
        // If x >= 633 and it's black panel shadow
        if (x >= 633 && (r < 30 && g < 30 && b < 30) && y < 885) {
          continue;
        }
        edgeY = y;
        break;
      }
    }
    topEdge[x] = edgeY;
  }

  // Let's check where edgeY is valid:
  let minCamX = 0;
  let maxCamX = 0;
  let minCamY = 1024;
  let maxCamY = 1024;

  for (let x = 0; x <= 660; x++) {
    if (topEdge[x] !== -1 && topEdge[x] < 1020) {
      if (topEdge[x] < minCamY) minCamY = topEdge[x];
      maxCamX = x;
    }
  }

  console.log(`Camera bounds: X: ${minCamX}..${maxCamX}, Y: ${minCamY}..${maxCamY}`);

  // Also check right edge for each y from minCamY to 1024:
  const rightEdge = [];
  for (let y = minCamY; y < 1024; y++) {
    let rx = -1;
    for (let x = 660; x >= 0; x--) {
      const [r, g, b] = getPixel(x, y);
      const isRed = (r >= 140 && g <= 40 && b <= 40);
      const isPureWhite = (r >= 248 && g >= 248 && b >= 248);
      const isPanelShadow = (x >= 633 && (r < 30 && g < 30 && b < 30) && y < 885);
      if (!isRed && !isPureWhite && !isPanelShadow) {
        rx = x;
        break;
      }
    }
    rightEdge[y] = rx;
  }

  // Create transparent PNG of exact camera
  const camW = maxCamX + 1;
  const camH = maxCamY - minCamY + 1;
  console.log(`Cropped camera size: ${camW} x ${camH}`);

  const camBuf = Buffer.alloc(camW * camH * 4);
  for (let y = minCamY; y < maxCamY; y++) {
    const cy = y - minCamY;
    const maxForY = rightEdge[y] !== undefined ? rightEdge[y] : maxCamX;
    const minForY = topEdge[y] !== undefined ? topEdge[y] : 0;
    for (let x = 0; x <= maxCamX; x++) {
      const cx = x;
      const idx = (cy * camW + cx) * 4;
      const [r, g, b, a] = getPixel(x, y);
      
      const isAboveTop = y < topEdge[x] || topEdge[x] === -1;
      const isPastRight = x > rightEdge[y] || rightEdge[y] === -1;
      
      if (!isAboveTop && !isPastRight) {
        camBuf[idx] = r;
        camBuf[idx + 1] = g;
        camBuf[idx + 2] = b;
        camBuf[idx + 3] = 255;
      } else {
        camBuf[idx] = 0;
        camBuf[idx + 1] = 0;
        camBuf[idx + 2] = 0;
        camBuf[idx + 3] = 0;
      }
    }
  }

  await sharp(camBuf, { raw: { width: camW, height: camH, channels: 4 } })
    .png()
    .toFile('public/assets/camera/moonshake-camera.png');

  console.log('Saved to public/assets/camera/moonshake-camera.png');
}

processCamera();
