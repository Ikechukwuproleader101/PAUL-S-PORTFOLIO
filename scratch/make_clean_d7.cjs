const fs = require('fs');
const sharp = require('sharp');

// Red background color: #b50c0c
// Let's create an SVG that includes:
// 1. Red fill over camera
// 2. Left-middle panel
// 3. Central-1 panel
// 4. Central-2 panel
// 5. Lower-left panel
// 6. Horizontal "MY WORKS" text at the bottom
// 7. Vertical "MY WORKS" text at the right

const svgOverlay = Buffer.from(`
<svg width="1440" height="1024" viewBox="0 0 1440 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Clean red fill over the camera zone -->
  <rect x="0" y="330" width="926" height="694" fill="#b50c0c" />
  
  <!-- 1. Left-middle panel: x=0, y=334, w=628, h=305 -->
  <rect x="11" y="344" width="628" height="305" fill="#000000" />
  <rect x="0" y="334" width="628" height="305" fill="#ffffff" stroke="#000000" stroke-width="1.5" />

  <!-- 2. Central-1 panel: x=650, y=409, w=265, h=328 -->
  <rect x="661" y="420" width="265" height="328" fill="#000000" />
  <rect x="650" y="409" width="265" height="328" fill="#ffffff" stroke="#000000" stroke-width="1.5" />

  <!-- 3. Central-2 panel: x=649, y=752, w=267, h=130 -->
  <rect x="659" y="754" width="267" height="130" fill="#000000" />
  <rect x="649" y="752" width="267" height="130" fill="#ffffff" stroke="#000000" stroke-width="1.5" />

  <!-- 4. Lower-left panel: x=0, y=650, w=633, h=232 -->
  <rect x="10" y="652" width="633" height="232" fill="#000000" />
  <rect x="0" y="650" width="633" height="232" fill="#ffffff" stroke="#000000" stroke-width="1.5" />

  <!-- 5. Horizontal "MY WORKS" in bottom red strip -->
  <text x="660" y="965" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#ffffff" letter-spacing="2">MY WORKS</text>

  <!-- 6. Vertical "MY WORKS" in right red strip (rotated -90deg) -->
  <g transform="translate(1365, 845) rotate(-90)">
    <text x="0" y="0" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#ffffff" letter-spacing="2">MY WORKS</text>
  </g>
</svg>
`);

async function generate() {
  const qrBuffer = await sharp('Custom QR code.jpg')
    .resize(92, 92)
    .toBuffer();

  await sharp('scratch/Desktop-7-original.png')
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      { input: qrBuffer, top: 902, left: 1324 }
    ])
    .toFile('Desktop - 7.png');

  console.log('Successfully updated Desktop - 7.png with completed rectangles, MY WORKS text, and QR code!');
}

generate().catch(console.error);
