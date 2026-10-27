const sharp = require('sharp');

async function findCameraSilhouette() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;

  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Scan from y=1023 up to 550 for x from 0 to 650.
  // The camera body is NOT pure white (r > 248 && g > 248 && b > 248)
  // and NOT red (r > 130 && g < 40 && b < 40)
  // and NOT the panel shadow (which is horizontal y=640..649 between white panels)
  // Let's trace for each x where the camera top is:
  console.log('Tracing camera silhouette:');
  const points = [];
  for (let x = 0; x <= 650; x += 10) {
    let topY = -1;
    // scan from y=580 down to 1024
    for (let y = 580; y < 1024; y++) {
      const [r, g, b] = getPixel(x, y);
      const isRed = (r > 140 && g < 35 && b < 35);
      const isWhite = (r > 248 && g > 248 && b > 248);
      const isPanelShadow = (y >= 639 && y <= 649 && x > 400 && r < 30 && g < 30 && b < 30);
      const isRightPanelShadow = (x >= 633 && r < 30 && g < 30 && b < 30);

      // If it's camera:
      // Note: camera has black drop shadow right along its top edge!
      // But panel shadow was at y=640..649. Where does camera body cross y=640?
      // Body of camera top edge goes from (x=0, y=585) to (x=450, y=675) approx!
      if (!isRed && !isWhite && !isPanelShadow && !isRightPanelShadow) {
        // Check if this pixel is connected to camera
        topY = y;
        break;
      }
    }
    points.push({ x, topY });
  }

  points.forEach(p => console.log(`x=${p.x}: topY=${p.topY}`));
}

findCameraSilhouette();
