/**
 * Asset Optimizer - Sharp.js Pipeline para MICA
 * Genera variantes AVIF/WebP/JPEG responsive con filtros emocionales
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

class AssetOptimizer {
  constructor() {
    this.inputDir = './images/artworks';
    this.outputDir = './images/optimized';
    this.qualities = {
      low: { webp: 60, avif: 50, jpg: 70 },
      medium: { webp: 75, avif: 65, jpg: 80 },
      high: { webp: 85, avif: 75, jpg: 90 }
    };
  }

  async processAll() {
    const files = await glob(`${this.inputDir}/**/*.{jpg,png,webp}`);
    
    Logger.debug(`🖼️ Procesando ${files.length} imágenes...`);
    
    await Promise.all(files.map(file => this.processImage(file)));
    
    await this.generateManifest();
    
    Logger.debug('✅ Optimización completa');
  }

  async processImage(inputPath) {
    const relativePath = path.relative(this.inputDir, inputPath);
    const baseName = path.parse(relativePath).name;
    const outputSubdir = path.dirname(relativePath);
    
    await fs.mkdir(path.join(this.outputDir, outputSubdir), { recursive: true });
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const sizes = [
      { width: 320, suffix: 'sm' },
      { width: 768, suffix: 'md' },
      { width: 1200, suffix: 'lg' },
      { width: 1920, suffix: 'xl' }
    ];

    const variants = [];

    for (const size of sizes) {
      if (metadata.width < size.width) continue;

      const resized = image.clone().resize(size.width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      });

      // AVIF
      await resized
        .avif({ quality: this.qualities.high.avif, effort: 4 })
        .toFile(path.join(this.outputDir, outputSubdir, `${baseName}-${size.suffix}.avif`));
      
      // WebP
      await resized
        .webp({ quality: this.qualities.high.webp, effort: 6 })
        .toFile(path.join(this.outputDir, outputSubdir, `${baseName}-${size.suffix}.webp`));
      
      // JPEG fallback
      await resized
        .jpeg({ quality: this.qualities.high.jpg, progressive: true, mozjpeg: true })
        .toFile(path.join(this.outputDir, outputSubdir, `${baseName}-${size.suffix}.jpg`));

      variants.push({
        width: size.width,
        sizes: {
          avif: `${baseName}-${size.suffix}.avif`,
          webp: `${baseName}-${size.suffix}.webp`,
          jpg: `${baseName}-${size.suffix}.jpg`
        }
      });
    }

    return {
      name: baseName,
      path: outputSubdir,
      originalWidth: metadata.width,
      variants
    };
  }

  async generateManifest() {
    const manifest = {
      generated: new Date().toISOString(),
      games: {}
    };

    const gameDirs = await fs.readdir(this.outputDir).catch(() => []);
    
    for (const game of gameDirs) {
      const gamePath = path.join(this.outputDir, game);
      try {
        const stat = await fs.stat(gamePath);
        if (stat.isDirectory()) {
          manifest.games[game] = await this.scanGameAssets(gamePath);
        }
      } catch (e) {
        console.error(`⚠️ Error al escanear directorio del juego ${game}:`, e.message);
      }
    }

    await fs.writeFile(
      path.join(this.outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }

  async scanGameAssets(gamePath) {
    const files = await glob(`${gamePath}/**/*.webp`);
    return files.map(f => path.relative(gamePath, f));
  }

  // Spritesheets emocionales para MICA
  async generateEmotionalSprites() {
    const emotions = ['neutral', 'energetic', 'tired', 'grumpy', 'playful'];
    
    for (const emotion of emotions) {
      const images = await glob(`./src/mica/emotions/${emotion}/*.png`);
      if (images.length === 0) continue;
      
      const sprite = await this.createSpritesheet(images, emotion);
      
      await sprite
        .webp({ quality: 90 })
        .toFile(`./public/mica/sprites-${emotion}.webp`);
    }
  }

  async createSpritesheet(images, emotion) {
    const data = await Promise.all(
      images.map(img => sharp(img).metadata())
    );

    const totalWidth = data.reduce((sum, m) => sum + m.width, 0);
    const maxHeight = Math.max(...data.map(m => m.height));

    const canvas = sharp({
      create: {
        width: totalWidth,
        height: maxHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    let currentX = 0;
    const composites = [];

    for (let i = 0; i < images.length; i++) {
      composites.push({
        input: images[i],
        left: currentX,
        top: Math.floor((maxHeight - data[i].height) / 2)
      });
      currentX += data[i].width;
    }

    return canvas.composite(composites);
  }
}

// CLI
const optimizer = new AssetOptimizer();
optimizer.processAll().catch(console.error);
