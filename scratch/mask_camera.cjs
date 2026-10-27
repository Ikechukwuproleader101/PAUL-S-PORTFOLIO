const sharp = require('sharp');

async function analyzeCameraBoundary() {
  const metadata = await sharp('scratch/camera_crop.png').metadata();
  const raw = await sharp('scratch/camera_crop.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Find camera silhouette:
  // The camera shadow on top and right is nearly black (r < 60, g < 60, b < 60).
  // Outside the shadow is either pure white (r > 250, g > 250, b > 250) or red (r > 150, g < 30, b < 30).
  // Let's find for each column x the top boundary of the camera (including its shadow).
  console.log('Finding top boundary of camera + shadow:');
  const topBoundary = [];
  for (let x = 0; x < w; x++) {
    let topY = -1;
    for (let y = 0; y < h; y++) {
      const [r, g, b] = getPixel(x, y);
      const isPureWhite = (r > 250 && g > 250 && b > 250);
      const isRed = (r > 150 && g < 30 && b < 30);
      if (!isPureWhite && !isRed) {
        topY = y;
        break;
      }
    }
    topBoundary.push(topY);
  }

  console.log('x=10:', topBoundary[10], 'x=100:', topBoundary[100], 'x=200:', topBoundary[200], 'x=300:', topBoundary[300], 'x=400:', topBoundary[400], 'x=500:', topBoundary[500], 'x=600:', topBoundary[600]);
}

analyzeCameraBoundary();
