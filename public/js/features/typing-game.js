/* ═══════════════════════════════════════════════════════════════
   Typing Art — Type artwork titles from metadata
   Shows artwork image above the word being typed
   ═══════════════════════════════════════════════════════════════ */
window.TypingGame = (() => {
  let container, artworks = [], wordQueue = [], current = 0, typed = '', score = 0, combo = 0, timeLeft = 45, timer;

  async function init() {
    container = document.getElementById('typing-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(20);
    wordQueue = artworks.map(a => ({ text: a.title, img: a.img, id: a.id }));
    current = 0; typed = ''; score = 0; combo = 0; timeLeft = 45;
    buildUI(); startTimer();
    document.addEventListener('keydown', handleKey);
  }

  function buildUI() {
    container.innerHTML = `
      <div style="max-width:480px;margin:0 auto;padding:16px;font-family:Inter,sans-serif;text-align:center">
        <div style="display:flex;justify-content:space-between;color:#ccc;font-size:13px;margin-bottom:12px">
          <span>Score: <b id="type-score" style="color:#ff6ec7">${score}</b></span>
          <span>Combo: <b id="type-combo" style="color:#7b2ff7">x${combo}</b></span>
          <span>⏱ <b id="type-timer">${timeLeft}s</b></span>
        </div>
        <div id="type-art" style="width:200px;height:150px;margin:0 auto 16px;border-radius:12px;overflow:hidden;border:2px solid rgba(123,47,247,0.3);background:#0a0a1a"></div>
        <div id="type-word" style="font-size:28px;color:#fff;letter-spacing:2px;margin-bottom:16px;min-height:40px"></div>
        <div style="color:#aaa;font-size:12px">Type the artwork title shown above</div>
      </div>
    `;
    renderWord();
  }

  function renderWord() {
    if (current >= wordQueue.length) { endGame(); return; }
    const w = wordQueue[current];
    // Artwork image
    const artDiv = document.getElementById('type-art');
    if (artDiv) {
      artDiv.innerHTML = '';
      if (w.img) {
        const img = document.createElement('img');
        img.src = w.img.src; Object.assign(img.style, { width:'100%', height:'100%', objectFit:'cover' });
        artDiv.appendChild(img);
      }
    }
    // Word display
    const wordDiv = document.getElementById('type-word');
    if (wordDiv) {
      wordDiv.innerHTML = w.text.split('').map((ch, i) => {
        const color = i < typed.length ? (typed[i].toLowerCase() === ch.toLowerCase() ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,0.3)';
        return `<span style="color:${color};transition:color 0.1s">${ch}</span>`;
      }).join('');
    }
  }

  function handleKey(e) {
    if (e.key.length === 1) {
      typed += e.key;
      const w = wordQueue[current];
      if (typed.length <= w.text.length) renderWord();
      if (typed.length === w.text.length) {
        const correct = typed.toLowerCase() === w.text.toLowerCase();
        if (correct) { combo++; score += 10 * combo; }
        else { combo = 0; score += 5; }
        updateHUD();
        typed = ''; current++;
        setTimeout(renderWord, 300);
      }
    } else if (e.key === 'Backspace') {
      typed = typed.slice(0, -1);
      renderWord();
    }
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      const t = document.getElementById('type-timer');
      if (t) { t.textContent = timeLeft + 's'; if (timeLeft <= 5) t.style.color = '#ef4444'; }
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function updateHUD() {
    const s = document.getElementById('type-score'), c = document.getElementById('type-combo');
    if (s) s.textContent = score; if (c) c.textContent = `x${combo}`;
  }

  function endGame() {
    clearInterval(timer); document.removeEventListener('keydown', handleKey);
    container.innerHTML = `
      <div style="max-width:400px;margin:0 auto;padding:40px;text-align:center;font-family:Inter,sans-serif">
        <div style="font-size:56px;margin-bottom:16px">⌨️</div>
        <h2 style="color:#ff6ec7;margin:0 0 8px">Time's Up!</h2>
        <p style="color:#ccc;font-size:16px">Score: ${score} · Words: ${current}</p>
        <button onclick="TypingGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:12px 32px;border-radius:24px;cursor:pointer;font-size:15px;font-weight:600">Play Again</button>
      </div>
    `;
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('typing', score);
  }

  function destroy() { clearInterval(timer); document.removeEventListener('keydown', handleKey); if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
