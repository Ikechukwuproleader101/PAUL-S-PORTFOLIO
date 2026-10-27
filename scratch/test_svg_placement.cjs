const sharp = require('sharp');

// Design canvas: 1440 x 1024
// Let's create an SVG with the exact parameters:
// Horizontal MY WORKS:
// x = 580, y = 975 (font-size: 112, font-weight: 800)
// Vertical MY WORKS:
// At x = 1395, y = 870, rotated -90deg (font-size: 112, font-weight: 800)
// QR Code:
// At x = 1296, y = 890, size = 114 x 114

const svg = Buffer.from(`
<svg width="1440" height="1024" viewBox="0 0 1440 1024" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="1440" height="1024" fill="#b50c0c" />

  <!-- Horizontal MY WORKS -->
  <!-- Starts under Central-2 left at x=580, baseline at y=980 -->
  <text x="580" y="980" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="900" fill="#ffffff" letter-spacing="-1">MY WORKS</text>

  <!-- Vertical MY WORKS -->
  <!-- Anchor at x=1395, y=870, rotated -90deg -->
  <g transform="translate(1395, 870) rotate(-90)">
    <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="900" fill="#ffffff" letter-spacing="-1">MY WORKS</text>
  </g>
</svg>
`);

async function run() {
  const qr = await sharp('Custom QR code.jpg')
    .resize(114, 114)
    .toBuffer();

  await sharp(svg)
    .composite([
      { input: qr, top: 890, left: 1296 }
    ])
    .toFile('scratch/test_text_placement.png');

  console.log('Successfully generated scratch/test_text_placement.png');
}

run().catch(console.error);
