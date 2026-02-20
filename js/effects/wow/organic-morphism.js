/**
 * WOW 8: ORGANIC MORPHISM — Blob shapes that breathe
 * SVG blobs orgánicos que mutan lentamente en los bordes.
 * Intención: la naturaleza no tiene líneas rectas.
 * @module effects/wow/organic-morphism
 */
export const OrganicMorphism = {
  init() {
    const style = document.createElement('style');
    style.textContent = `
      .organic-blob { position:absolute; opacity:0.06; filter:blur(40px); pointer-events:none; z-index:-1; animation:blob-morph 15s ease-in-out infinite alternate; }
      .organic-blob--warm { background: radial-gradient(ellipse, rgba(255,100,50,0.6) 0%, rgba(255,180,50,0.3) 40%, transparent 70%); }
      .organic-blob--cool { background: radial-gradient(ellipse, rgba(100,150,255,0.5) 0%, rgba(139,92,246,0.3) 40%, transparent 70%); }
      .organic-blob--earth { background: radial-gradient(ellipse, rgba(180,140,80,0.5) 0%, rgba(120,90,50,0.3) 40%, transparent 70%); }
      @keyframes blob-morph {
        0%   { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); }
        33%  { border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%; transform: rotate(120deg) scale(1.1); }
        66%  { border-radius: 30% 70% 50% 50% / 70% 40% 60% 30%; transform: rotate(240deg) scale(0.9); }
        100% { border-radius: 50% 50% 40% 60% / 50% 60% 30% 70%; transform: rotate(360deg) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) { .organic-blob { animation: none; } }
    `;
    document.head.appendChild(style);

    const sections = document.querySelectorAll('.view, section, .hero');
    const types = ['warm', 'cool', 'earth'];
    sections.forEach((section, i) => {
      if (i > 5) return;
      const blob = document.createElement('div');
      blob.className = `organic-blob organic-blob--${types[i % 3]}`;
      blob.style.cssText = `top:${Math.random()*80}%;${i%2===0?'left':'right'}:${-50+Math.random()*100}px;width:${200+Math.random()*200}px;height:${200+Math.random()*200}px;animation-delay:${-Math.random()*15}s;animation-duration:${12+Math.random()*8}s;`;
      section.style.position = section.style.position || 'relative';
      section.appendChild(blob);
    });
  }
};
