const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const image = sharp('Desktop - 7.png');
  const metadata = await image.metadata();
  const { width, height } = metadata;
  console.log(`Image size: ${width}x${height}`);

  const raw = await image.raw().toBuffer();
  const getPixel = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return [0,0,0,0];
    const idx = (y * width + x) * 4;
    return [raw[idx], raw[idx+1], raw[idx+2], raw[idx+3]];
  };

  // Let's find white pixels: R > 250, G > 250, B > 250
  // Let's create a 2D grid of white pixels
  const isWhite = (x, y) => {
    const [r, g, b, a] = getPixel(x, y);
    return r > 240 && g > 240 && b > 240 && a > 200;
  };

  const isBlack = (x, y) => {
    const [r, g, b, a] = getPixel(x, y);
    return r < 30 && g < 30 && b < 30 && a > 200;
  };

  const isRed = (x, y) => {
    const [r, g, b, a] = getPixel(x, y);
    return r > 150 && g < 30 && b < 30;
  };

  console.log('Sampling grid...');
  // Find connected components of white pixels (the panels!)
  // Since panels are axis-aligned rectangles, let's scan horizontal slices or use bounding boxes.
  const visited = new Uint8Array(width * height);
  const panels = [];

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if (isWhite(x, y) && !visited[y * width + x]) {
        // Flood fill to find panel bounding box
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        visited[y * width + x] = 1;

        while (queue.length > 0) {
          const [cx, cy] = queue.pop();
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const neighbors = [
            [cx + 4, cy],
            [cx - 4, cy],
            [cx, cy + 4],
            [cx, cy - 4]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited[nidx] && isWhite(nx, ny)) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        // Refine bounding box to 1px precision
        // Scan boundaries
        let trueMinX = minX;
        while (trueMinX > 0 && isWhite(trueMinX - 1, Math.floor((minY + maxY) / 2))) trueMinX--;
        let trueMaxX = maxX;
        while (trueMaxX < width - 1 && isWhite(trueMaxX + 1, Math.floor((minY + maxY) / 2))) trueMaxX++;
        let trueMinY = minY;
        while (trueMinY > 0 && isWhite(Math.floor((minX + maxX) / 2), trueMinY - 1)) trueMinY--;
        let trueMaxY = maxY;
        while (trueMaxY < height - 1 && isWhite(Math.floor((minX + maxX) / 2), trueMaxY + 1)) trueMaxY++;

        const pWidth = trueMaxX - trueMinX + 1;
        const pHeight = trueMaxY - trueMinY + 1;
        if (pWidth > 20 && pHeight > 20) {
          panels.push({
            minX: trueMinX,
            minY: trueMinY,
            maxX: trueMaxX,
            maxY: trueMaxY,
            width: pWidth,
            height: pHeight
          });
        }
      }
    }
  }

  console.log(`Found ${panels.length} white regions:`);
  panels.sort((a, b) => a.minY - b.minY || a.minX - b.minX);
  panels.forEach((p, i) => {
    console.log(`Panel ${i + 1}: x=${p.minX}, y=${p.minY}, w=${p.width}, h=${p.height}, right=${p.maxX}, bottom=${p.maxY}`);
  });
}

run().catch(console.error);
