/**
 * WOW 7: SERENDIPITY ENGINE — Arte inesperado
 * Conecta con Art Institute of Chicago API (pública).
 * Intención: la serendipia — encontrar lo que no buscabas.
 * @module effects/wow/serendipity-engine
 */
export const SerendipityEngine = {
  async init() {
    try {
      const page = Math.floor(Math.random() * 100) + 1;
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=1&fields=id,title,artist_title,image_id,date_display`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) throw new Error('Art API failed');
      const data = await res.json();
      if (data.data?.length > 0) {
        const artwork = data.data[0];
        window.__serendipity = {
          title: artwork.title,
          artist: artwork.artist_title,
          date: artwork.date_display,
          image: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`,
          museum: 'Art Institute of Chicago'
        };
      }
    } catch {
      // Silent fail — serendipity is never forced
    }
  }
};
