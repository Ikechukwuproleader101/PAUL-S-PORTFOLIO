const sharp = require('sharp');

async function getExactPanels() {
  const metadata = await sharp('Desktop - 7.png').metadata();
  const raw = await sharp('Desktop - 7.png').raw().toBuffer();
  const w = metadata.width;
  const h = metadata.height;

  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return [0,0,0,0];
    const idx = (y * w + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  }

  function isWhite(x, y) {
    const [r, g, b] = getPixel(x, y);
    return r > 245 && g > 245 && b > 245;
  }

  function isBlack(x, y) {
    const [r, g, b] = getPixel(x, y);
    return r < 35 && g < 35 && b < 35;
  }

  // Known sample points inside each of the 7 white panels + lower-left:
  const seeds = [
    { name: 'Upper-Left Panel', x: 200, y: 150 },
    { name: 'Upper-Middle Panel', x: 800, y: 150 },
    { name: 'Upper-Right Panel', x: 1200, y: 150 },
    { name: 'Large Left-Middle Panel', x: 200, y: 450 },
    { name: 'Lower-Left Panel (Behind Cam)', x: 500, y: 700 },
    { name: 'Central Panel 1', x: 750, y: 550 },
    { name: 'Central Panel 2', x: 750, y: 800 },
    { name: 'Right-Side Panel', x: 1100, y: 600 }
  ];

  for (const seed of seeds) {
    // Flood fill white pixels for this panel
    const visited = new Uint8Array(w * h);
    const queue = [[seed.x, seed.y]];
    visited[seed.y * w + seed.x] = 1;
    let minX = seed.x, maxX = seed.x, minY = seed.y, maxY = seed.y;

    while (queue.length > 0) {
      const [cx, cy] = queue.pop();
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;

      const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nidx = ny * w + nx;
          if (!visited[nidx] && isWhite(nx, ny)) {
            visited[nidx] = 1;
            queue.push([nx, ny]);
          }
        }
      }
    }

    // Now find black shadow bounds around this panel
    // Shadow extends to the right and bottom
    let shadowMaxX = maxX;
    while (shadowMaxX + 1 < w && isBlack(shadowMaxX + 1, Math.floor((minY + maxY) / 2))) {
      shadowMaxX++;
    }
    let shadowMaxY = maxY;
    while (shadowMaxY + 1 < h && isBlack(Math.floor((minX + maxX) / 2), shadowMaxY + 1)) {
      shadowMaxY++;
    }

    // Border on left and top
    let borderMinX = minX;
    while (borderMinX - 1 >= 0 && isBlack(borderMinX - 1, Math.floor((minY + maxY) / 2))) {
      borderMinX--;
    }
    let borderMinY = minY;
    while (borderMinY - 1 >= 0 && isBlack(Math.floor((minX + maxX) / 2), borderMinY - 1)) {
      borderMinY--;
    }

    console.log(`--- ${seed.name} ---`);
    console.log(`White face: x=${minX}, y=${minY}, w=${maxX - minX + 1}, h=${maxY - minY + 1}, right=${maxX}, bottom=${maxY}`);
    console.log(`Shadow offset: rightShadow=${shadowMaxX - maxX}px, bottomShadow=${shadowMaxY - maxY}px`);
    console.log(`Border: leftBorder=${minX - borderMinX}px, topBorder=${minY - borderMinY}px`);
  }
}

getExactPanels();
