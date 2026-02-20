/**
 * Artwork Loader — Shared utility for loading artwork images
 * Used by games and gallery to load Naroa's artwork efficiently
 * @module features/artwork-loader
 */

(function() {
  'use strict';

  const ARTWORKS_PATH = '/images/artworks/';
  const CACHE = new Map();
  let artworksData = null;

  async function loadMetadata() {
    if (artworksData) return artworksData;
    try {
      const res = await fetch('/data/database.json');
      artworksData = await res.json();
      return artworksData;
    } catch (e) {
      Logger.warn('[ArtworkLoader] Failed to load metadata:', e);
      return null;
    }
  }

  function getImageUrl(filename) {
    return `${ARTWORKS_PATH}${filename}`;
  }

  async function loadImage(filename) {
    if (CACHE.has(filename)) return CACHE.get(filename);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        CACHE.set(filename, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load: ${filename}`));
      img.src = getImageUrl(filename);
    });
  }

  async function preloadImages(filenames) {
    return Promise.allSettled(filenames.map(f => loadImage(f)));
  }

  async function getRandomArtworks(count = 6) {
    const meta = await loadMetadata();
    if (!meta?.artworks) return [];
    
    const shuffled = [...meta.artworks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  window.ArtworkLoader = {
    loadMetadata,
    getImageUrl,
    loadImage,
    preloadImages,
    getRandomArtworks,
    ARTWORKS_PATH
  };
})();
