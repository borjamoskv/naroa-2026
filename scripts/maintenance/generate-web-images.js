import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = 'images/artworks';
const HERO_SOURCES = [
  { source: 'source-amy.png', name: 'amy' },
  { source: 'source-james.png', name: 'james' },
  { source: 'source-johnny.png', name: 'johnny' },
  { source: 'source-marilyn.png', name: 'marilyn' },
  { source: 'source-portrait-1.png', name: 'portrait-1' },
  { source: 'source-portrait-2.png', name: 'portrait-2' }
];

async function generate() {
  Logger.debug('🚀 Generating Web-Optimized + Blur Placeholder Images...\n');

  for (const { source, name } of HERO_SOURCES) {
    const inputPath = path.join(SRC_DIR, source);
    if (!fs.existsSync(inputPath)) {
      // Fallback to hq version
      const hqPath = path.join(SRC_DIR, `hq-${name}.webp`);
      if (!fs.existsSync(hqPath)) {
        Logger.warn(`⚠️ No source found for ${name}, skipping`);
        continue;
      }
      Logger.debug(`  Using HQ fallback for ${name}`);
      await processImage(hqPath, name);
    } else {
      await processImage(inputPath, name);
    }
  }

  Logger.debug('\n✅ All done!');
}

async function processImage(inputPath, name) {
  const webPath = path.join(SRC_DIR, `web-${name}.webp`);
  const blurPath = path.join(SRC_DIR, `blur-${name}.webp`);

  // Tier 2: Web-optimized (max 2000px wide, quality 85)
  Logger.debug(`  📷 [${name}] Generating web version...`);
  await sharp(inputPath)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(webPath);

  const webSize = (fs.statSync(webPath).size / 1024).toFixed(0);
  Logger.debug(`     ✅ web-${name}.webp → ${webSize}KB`);

  // Tier 1: Blur placeholder (40px wide, quality 20)
  Logger.debug(`  🌫️  [${name}] Generating blur placeholder...`);
  await sharp(inputPath)
    .resize({ width: 40 })
    .webp({ quality: 20 })
    .toFile(blurPath);

  const blurSize = (fs.statSync(blurPath).size / 1024).toFixed(1);
  Logger.debug(`     ✅ blur-${name}.webp → ${blurSize}KB`);
}

generate();
