const sharp = require('sharp');

const imgPath = 'C:\\Users\\Ikechukwu\\.gemini\\antigravity-ide\\brain\\af6d057f-b801-4308-9634-f158693ee020\\.user_uploaded\\media_1793113614469.png';

async function mapCrop() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  console.log('User image:', info.width, 'x', info.height);

  function getPixel(x, y) {
    const idx = (info.width * y + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  // Let's find the bounding box of the blue outline!
  // In the user image there is a blue outline around one panel!
  // Blue color: r < 50, g > 100, b > 200
  let minX = 999, maxX = -1, minY = 999, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const [r, g, b] = getPixel(x, y);
      if (b > 180 && r < 50 && g > 100) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log('Blue selection box in crop:', { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY });

  // In Desktop - 7.png, which panel was that?
  // In Desktop - 7.png:
  // Left-middle panel was x=0, y=334, w=628, h=305!
  // Wait! Look at the blue box: left edge is x=0, top=70, right=151, bottom=146!
  // That means this crop starts at x ≈ ?
  // If the blue box is left-middle panel (or another panel):
  // Let's check what panel is to the right of the blue box in the crop:
  // In the crop, to the right of the blue box is a panel!
}

mapCrop().catch(console.error);
