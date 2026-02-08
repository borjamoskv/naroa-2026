/* ═══════════════════════════════════════════════════════════════
   ArtworkLoader — Shared artwork image utility for all games
   Loads artworks-metadata.json, resolves image paths, preloads
   ═══════════════════════════════════════════════════════════════ */
window.ArtworkLoader = (() => {
  let _meta = null;
  let _imageCache = {};

  const PATHS = [
    'images/artworks/',
    'images/thumbnails-webp/',
    'img/artworks-intro/'
  ];

  async function loadMetadata() {
    if (_meta) return _meta;
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      _meta = data.artworks || [];
      return _meta;
    } catch (e) {
      console.warn('[ArtworkLoader] Failed to load metadata:', e);
      _meta = [];
      return _meta;
    }
  }

  function getImageUrl(artwork) {
    if (artwork.image) return artwork.image;
    return `images/artworks/${artwork.id}.webp`;
  }

  function getThumbnailUrl(artwork) {
    return `images/thumbnails-webp/${artwork.id}.webp`;
  }

  function preloadImage(url) {
    return new Promise((resolve) => {
      if (_imageCache[url]) { resolve(_imageCache[url]); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { _imageCache[url] = img; resolve(img); };
      img.onerror = () => { resolve(null); };
      img.src = url;
    });
  }

  async function loadImage(artwork) {
    const primary = getImageUrl(artwork);
    let img = await preloadImage(primary);
    if (img) return img;
    // Fallback to thumbnail
    const thumb = getThumbnailUrl(artwork);
    img = await preloadImage(thumb);
    if (img) return img;
    // Fallback to intro
    const intro = `img/artworks-intro/${artwork.id}.webp`;
    return preloadImage(intro);
  }

  async function getRandomArtworks(count = 6) {
    const all = await loadMetadata();
    if (!all.length) return [];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, all.length));
    const loaded = await Promise.all(selected.map(async (a) => {
      const img = await loadImage(a);
      return img ? { ...a, img } : null;
    }));
    return loaded.filter(Boolean);
  }

  async function getArtworksBySeries(series, count = 4) {
    const all = await loadMetadata();
    const filtered = all.filter(a => a.series === series);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, filtered.length));
    const loaded = await Promise.all(selected.map(async (a) => {
      const img = await loadImage(a);
      return img ? { ...a, img } : null;
    }));
    return loaded.filter(Boolean);
  }

  async function getFeaturedArtworks(count = 6) {
    const all = await loadMetadata();
    const featured = all.filter(a => a.featured);
    const shuffled = [...featured].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, featured.length));
    const loaded = await Promise.all(selected.map(async (a) => {
      const img = await loadImage(a);
      return img ? { ...a, img } : null;
    }));
    return loaded.filter(Boolean);
  }

  function drawArtworkCover(ctx, img, x, y, w, h, opacity = 1) {
    if (!img) return;
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  }

  function drawArtworkCircle(ctx, img, cx, cy, r, opacity = 1) {
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const size = r * 2;
    const scale = Math.max(size / img.width, size / img.height);
    const sw = size / scale, sh = size / scale;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, cx - r, cy - r, size, size);
    ctx.restore();
  }

  return {
    loadMetadata,
    getImageUrl,
    getThumbnailUrl,
    loadImage,
    preloadImage,
    getRandomArtworks,
    getArtworksBySeries,
    getFeaturedArtworks,
    drawArtworkCover,
    drawArtworkCircle
  };
})();
