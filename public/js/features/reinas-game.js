/* ═══════════════════════════════════════════════════════════════
   Reinas — Premium with Artwork Gallery Backgrounds
   Shows rotating artwork between questions
   ═══════════════════════════════════════════════════════════════ */
window.ReinasGame = (() => {
  let container, currentQ = 0, score = 0, artworks = [];
  const QUEENS = [
    { name: 'Frida Kahlo', country: 'México', hints: ['Pintora de autorretratos', 'Casada con Diego Rivera', 'Ceja unida icónica'], years: '1907-1954' },
    { name: 'Georgia O\'Keeffe', country: 'EEUU', hints: ['Madre del modernismo americano', 'Flores gigantes', 'Paisajes de Nuevo México'], years: '1887-1986' },
    { name: 'Artemisia Gentileschi', country: 'Italia', hints: ['Barroca italiana', 'Judith decapitando a Holofernes', 'Primera mujer en la Accademia'], years: '1593-1656' },
    { name: 'Tamara de Lempicka', country: 'Polonia', hints: ['Reina del Art Déco', 'Retratos glamurosos', 'Autorretrato en Bugatti verde'], years: '1898-1980' },
    { name: 'Yayoi Kusama', country: 'Japón', hints: ['Obsesión con lunares', 'Infinity Rooms', 'Calabazas gigantes'], years: '1929-' },
    { name: 'Louise Bourgeois', country: 'Francia', hints: ['Arañas gigantes "Maman"', 'Arte confesional', 'Esculturas de tela'], years: '1911-2010' },
    { name: 'Hilma af Klint', country: 'Suecia', hints: ['Pionera del arte abstracto', 'Pinturas espirituales', 'Anterior a Kandinsky'], years: '1862-1944' },
    { name: 'Marina Abramović', country: 'Serbia', hints: ['Madre del performance art', '"The Artist Is Present"', 'Resistencia corporal'], years: '1946-' }
  ];

  async function init() {
    container = document.getElementById('reinas-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getFeaturedArtworks(8);
    currentQ = 0; score = 0;
    showQuestion();
  }

  function showQuestion() {
    if (currentQ >= QUEENS.length) { endGame(); return; }
    const q = QUEENS[currentQ];
    const bgArt = artworks[currentQ % artworks.length];
    const wrongs = QUEENS.filter((_, i) => i !== currentQ).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [q, ...wrongs].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="max-width:500px;margin:0 auto;padding:16px;font-family:Inter,sans-serif;position:relative">
        <div style="position:absolute;inset:0;border-radius:16px;overflow:hidden;z-index:0">
          ${bgArt && bgArt.img ? `<img src="${bgArt.img.src}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.15) blur(4px)" />` : ''}
        </div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;justify-content:space-between;color:#aaa;font-size:13px;margin-bottom:12px">
            <span>${currentQ + 1}/${QUEENS.length}</span>
            <span style="color:#ff6ec7">Score: ${score}</span>
          </div>
          <div style="background:rgba(10,10,26,0.8);border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid rgba(123,47,247,0.3)">
            <div style="color:#aaa;font-size:12px;margin-bottom:8px">${q.country} · ${q.years}</div>
            ${q.hints.map((h, i) => `<div style="color:#fff;font-size:14px;margin-bottom:6px;opacity:${1 - i * 0.15}">💡 ${h}</div>`).join('')}
          </div>
          <div style="display:grid;gap:10px">
            ${options.map(o => `<button class="reinas-opt" data-name="${o.name}" style="padding:12px;border-radius:12px;
              border:1px solid rgba(255,110,199,0.3);background:rgba(26,26,46,0.9);color:#fff;font-size:14px;
              cursor:pointer;font-family:Inter,sans-serif;transition:all 0.3s;text-align:left">${o.name}</button>`).join('')}
          </div>
        </div>
      </div>
    `;
    container.querySelectorAll('.reinas-opt').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn, q));
    });
  }

  function handleAnswer(btn, q) {
    const correct = btn.dataset.name === q.name;
    container.querySelectorAll('.reinas-opt').forEach(b => {
      b.style.pointerEvents = 'none';
      if (b.dataset.name === q.name) { b.style.background = 'rgba(0,200,100,0.3)'; b.style.borderColor = '#00c864'; }
    });
    if (correct) { score += 10; if (typeof GameEffects !== 'undefined') GameEffects.confetti(container); }
    else { btn.style.background = 'rgba(255,50,50,0.3)'; btn.style.borderColor = '#ff3232'; }
    setTimeout(() => { currentQ++; showQuestion(); }, 1500);
  }

  function endGame() {
    container.innerHTML = `
      <div style="max-width:400px;margin:0 auto;padding:40px;text-align:center;font-family:Inter,sans-serif">
        <div style="font-size:56px;margin-bottom:16px">👑</div>
        <h2 style="color:#ff6ec7;margin:0 0 8px">¡Quiz Completado!</h2>
        <p style="color:#ccc;font-size:16px">${score} / ${QUEENS.length * 10}</p>
        <button onclick="ReinasGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);
          border:none;color:#fff;padding:12px 32px;border-radius:24px;cursor:pointer;font-size:15px;font-weight:600">
          Play Again
        </button>
      </div>
    `;
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('reinas', score);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
