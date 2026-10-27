const sharp = require('sharp');

async function testComposite() {
  const width = 1440;
  const height = 1024;

  // SVG representation of the panels on red background:
  const panelsSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#b50c0c" />

    <!-- 1. Upper-Left Panel (x=0, y=20, w=484, h=295) -->
    <!-- Shadow (12px right, 11px bottom) -->
    <rect x="12" y="31" width="484" height="295" fill="#000" />
    <rect x="0" y="20" width="484" height="295" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 2. Upper-Middle Panel (Stepped / Inverted-T) -->
    <!-- Shadow offset: 12px right, 7px bottom -->
    <path d="M 518 27 L 1093 27 L 1093 322 L 924 322 L 924 399 L 662 399 L 662 322 L 518 322 Z" fill="#000" />
    <!-- White Face -->
    <path d="M 506 20 L 1081 20 L 1081 315 L 912 315 L 912 392 L 650 392 L 650 315 L 506 315 Z" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 3. Upper-Right Panel (x=1095, y=19, w=192, h=300) -->
    <!-- Shadow (10px right, 3px bottom) -->
    <rect x="1105" y="22" width="192" height="300" fill="#000" />
    <rect x="1095" y="19" width="192" height="300" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 4. Large Left-Middle Panel (x=0, y=334, w=628, h=305) -->
    <!-- Shadow (11px right, 10px bottom) -->
    <rect x="11" y="344" width="628" height="305" fill="#000" />
    <rect x="0" y="334" width="628" height="305" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 5. Lower-Left Panel (x=0, y=650, w=636, h=234) -->
    <!-- Shadow (10px right, 1px bottom) -->
    <rect x="10" y="651" width="636" height="234" fill="#000" />
    <rect x="0" y="650" width="636" height="234" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 6. Central Panel 1 (x=650, y=409, w=265, h=328) -->
    <!-- Shadow (11px right, 11px bottom) -->
    <rect x="661" y="420" width="265" height="328" fill="#000" />
    <rect x="650" y="409" width="265" height="328" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 7. Central Panel 2 (x=649, y=752, w=267, h=130) -->
    <!-- Shadow (10px right, 2px bottom) -->
    <rect x="659" y="754" width="267" height="130" fill="#000" />
    <rect x="649" y="752" width="267" height="130" fill="#fff" stroke="#000" stroke-width="1.5" />

    <!-- 8. Right-Side Panel (x=928, y=328, w=355, h=549) -->
    <!-- Shadow (14px right, 5px bottom) -->
    <rect x="942" y="333" width="355" height="549" fill="#000" />
    <rect x="928" y="328" width="355" height="549" fill="#fff" stroke="#000" stroke-width="1.5" />
  </svg>
  `;

  const bgBuffer = await sharp(Buffer.from(panelsSvg)).png().toBuffer();

  // Composite camera onto the background at (left: 0, top: 580)
  const compositeBuffer = await sharp(bgBuffer)
    .composite([
      {
        input: 'public/assets/camera/moonshake-camera.png',
        left: 0,
        top: 580
      }
    ])
    .png()
    .toFile('scratch/rendered_test.png');

  console.log('Test composite saved to scratch/rendered_test.png');
}

testComposite();
