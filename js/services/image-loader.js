/**
 * 🖼️ Cargador de Imágenes — Estrategia Dual (CDN + IPFS)
 * 
 * Estrategia:
 * 1. Intentar Primary CDN (Vercel/Cloudflare) - APIs rápidas y optimizadas
 * 2. Fallback a IPFS Gateway (Pinata) - Permanente, descentralizado
 * 
 * Uso:
 *   const img = await ImageLoader.load('espejos-del-alma');
 *   document.body.appendChild(img);
 */

const ImageLoader = {
  manifest: null,
  manifestUrl: 'data/ipfs-manifest.json',

  /**
   * Cargar una imagen de obra de arte con respaldo (fallback)
   * @param {string} artworkId - ID de la obra (nombre de archivo sin extensión)
   * @param {string} format - 'webp' (por defecto)
   * @returns {Promise<HTMLImageElement>} Elemento de imagen cargado
   */
  async load(artworkId, format = 'webp') {
    const cdnUrl = `images/gallery/${artworkId}.${format}`;
    
    return new Promise((resolve, reject) => {
      // 1. Try CDN
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`[ImageLoader] CDN failed for ${artworkId}, trying IPFS fallback...`);
        this._loadFromIPFS(artworkId, img, resolve, reject);
      };
      img.src = cdnUrl;
    });
  },

  /**
   * Internal: Handle IPFS fallback
   */
  async _loadFromIPFS(artworkId, imgObj, resolve, reject) {
    try {
      // Lazy load manifest
      if (!this.manifest) {
        this.manifest = await window.DataCache.get(this.manifestUrl);
      }

      const entry = this.manifest?.artworks?.[artworkId];
      
      if (!entry || !entry.gateway) {
        throw new Error(`No IPFS entry for ${artworkId}`);
      }

      console.info(`[ImageLoader] Serving ${artworkId} from IPFS: ${entry.cid}`);
      
      // Retry with IPFS Gateway URL
      imgObj.src = entry.gateway;
      imgObj.onload = () => resolve(imgObj);
      imgObj.onerror = () => reject(new Error(`Both CDN and IPFS failed for ${artworkId}`));

    } catch (err) {
      console.error('[ImageLoader] IPFS Fallback failed:', err);
      reject(err);
    }
  },

  /**
   * Get URL (don't load image element)
   * Useful for background-image
   */
  async getUrl(artworkId, format = 'webp') {
    // Optimistic: return CDN url, but verify in background if needed? 
    // For now, just return CDN url. Complex logic regarding fallback for CSS backgrounds 
    // requires checking availability first, which negates the speed benefit.
    // Recommended: Use the load() method and set src.
    return `images/gallery/${artworkId}.${format}`;
  }
};

window.ImageLoader = ImageLoader;
