import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const input = 'public/Punteros/Puntero_mica.heic';
const output = 'images/ui/cursor-mica.png';

async function convert() {
  try {
    // Ensure output dir exists
    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(input)
      .resize(32, 32, { fit: 'inside' }) // Standard cursor size
      .toFile(output);
    
    Logger.debug(`Converted ${input} to ${output}`);
  } catch (error) {
    console.error('Error converting:', error);
  }
}

convert();
