const sharp = require('sharp');

async function inspectCamera() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  // Camera bounds in Desktop - 7.png:
  // Topmost pixel of camera:
  // Let's find topmost pixel that is not red [181, 12, 12] and not white [255, 255, 255] and not pure black [0, 0, 0] in the lower left area
  let minY = 1024, maxY = 0, minX = 1440, maxX = 0;
  for (let y = 550; y < 1024; y++) {
    for (let x = 0; x < 700; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const isRed = Math.abs(r - 181) < 20 && Math.abs(g - 12) < 15 && Math.abs(b - 12) < 15;
      const isWhite = r > 245 && g > 245 && b > 245;
      const isPanelBlack = (r < 10 && g < 10 && b < 10);
      
      // Let's see if this pixel is part of the camera or camera drop shadow:
      // In Desktop - 7.png, the camera is beige/cream/silver/lens glass.
      // Body is beige/cream: r ~ 220-250, g ~ 200-240, b ~ 180-220.
      // Text "Moonshake" is dark.
      // Lens has green/blue reflection and dark metal rings.
      // Camera shadow is dark (alpha blended with red or white).
      if (!isRed && (!isWhite || (x < 300 && y > 600))) {
        // let's check
      }
    }
  }

  // Let's crop x: 0..670, y: 550..1024 to a png to inspect the camera crop
  await sharp('Desktop - 7.png')
    .extract({ left: 0, top: 580, width: 670, height: 444 })
    .toFile('scratch/camera_crop.png');

  console.log('Camera cropped to scratch/camera_crop.png');
}

inspectCamera();
