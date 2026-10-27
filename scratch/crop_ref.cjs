const sharp = require('sharp');

const imgPath = 'C:\\Users\\Ikechukwu\\.gemini\\antigravity-ide\\brain\\af6d057f-b801-4308-9634-f158693ee020\\.user_uploaded\\media_1793113614469.png';

async function cropDetails() {
  // Crop horizontal text
  await sharp(imgPath)
    .extract({ left: 135, top: 195, width: 215, height: 45 })
    .toFile('scratch/ref_horizontal_and_qr.png');

  // Crop vertical text
  await sharp(imgPath)
    .extract({ left: 295, top: 35, width: 55, height: 175 })
    .toFile('scratch/ref_vertical_text.png');

  console.log('Saved crops to scratch/');
}

cropDetails().catch(console.error);
