/**
 * Cloudinary Helper - Filtros emocionales CDN para MICA
 */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

class EmotionalCloudinary {
  getOptimizedUrl(publicId, mood = 'neutral', options = {}) {
    const transformations = [
      { fetch_format: 'auto', quality: 'auto:good' },
      { width: options.width || 'auto', crop: 'limit' }
    ];

    const moodFilters = {
      energetic: { effect: 'saturation:15', contrast: 10 },
      tired: { effect: 'grayscale:30', brightness: -10 },
      grumpy: { effect: 'contrast:20', saturation: 20 },
      playful: { effect: 'hue:10', saturation: 25 }
    };

    if (moodFilters[mood]) {
      const filter = moodFilters[mood];
      if (filter.effect) transformations.push({ effect: filter.effect });
      if (filter.brightness) transformations.push({ brightness: filter.brightness });
    }

    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true
    });
  }

  async uploadWithEmotionalVariants(filePath, gameId) {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: `games/${gameId}`,
      tags: ['mica-game', gameId],
      eager: [
        { width: 800, crop: 'limit', effect: 'saturation:15', format: 'webp' },
        { width: 800, crop: 'limit', effect: 'grayscale:30', format: 'webp' }
      ],
      eager_async: true
    });

    return uploadResult;
  }
}

module.exports = new EmotionalCloudinary();
