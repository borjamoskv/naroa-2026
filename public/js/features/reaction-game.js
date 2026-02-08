/* ═══════════════════════════════════════════════════════════════
   Reaction Time — Premium with Artwork Reveal
   Artwork appears when zone turns green; shatters on click
   ═══════════════════════════════════════════════════════════════ */
window.ReactionGame = (() => {
  let container, canvas, ctx, state, startTime, results = [], artworks = [], currentArt;

  async function init() {
    container = document.getElementById('reaction-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(10);
    buildUI(); reset();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="max-width:440px;margin:0 auto;padding:12px;font-family:Inter,sans-serif;text-align:center">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          Round: <span id="react-round" style="color:#ff6ec7">0</span>/5
          &nbsp;·&nbsp; Best: <span id="react-best" style="color:#22c55e">—</span>
        </div>
        <canvas id="react-canvas" style="width:100%;aspect-ratio:4/3;border-radius:16px;cursor:pointer;display:block"></canvas>
        <div id="react-msg" style="color:#aaa;font-size:14px;margin-top:10px">Click when the artwork appears!</div>
      </div>
    `;
    canvas = document.getElementById('react-canvas');
    canvas.width = 440; canvas.height = 330;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
  }

  function reset() {
    state = 'waiting'; results = [];
    updateHUD(); scheduleGo();
    drawState();
  }

  function scheduleGo() {
    state = 'waiting';
    currentArt = artworks[results.length % artworks.length];
    drawState();
    const delay = 1500 + Math.random() * 3000;
    setTimeout(() => { if (state === 'waiting') { state = 'go'; startTime = performance.now(); drawState(); } }, delay);
  }

  function drawState() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (state === 'waiting') {
      // Red zone
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center';
      ctx.fillText('Wait...', canvas.width/2, canvas.height/2);
    } else if (state === 'go') {
      // Show artwork
      if (currentArt && currentArt.img) {
        window.ArtworkLoader.drawArtworkCover(ctx, currentArt.img, 0, 0, canvas.width, canvas.height, 0.9);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22c55e'; ctx.font = 'bold 28px Inter'; ctx.textAlign = 'center';
      ctx.fillText('CLICK!', canvas.width/2, canvas.height/2);
      // Glow border
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 4; ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 20;
      ctx.strokeRect(4, 4, canvas.width-8, canvas.height-8);
      ctx.shadowBlur = 0;
    } else if (state === 'result') {
      const ms = results[results.length - 1];
      const color = ms < 250 ? '#22c55e' : ms < 400 ? '#eab308' : '#ef4444';
      ctx.fillStyle = color; ctx.font = 'bold 48px Inter'; ctx.textAlign = 'center';
      ctx.fillText(`${ms}ms`, canvas.width/2, canvas.height/2);
      ctx.font = '16px Inter'; ctx.fillStyle = '#aaa';
      ctx.fillText(ms < 200 ? 'INCREDIBLE!' : ms < 300 ? 'Great!' : ms < 400 ? 'Good' : 'Try faster', canvas.width/2, canvas.height/2 + 40);
    }
  }

  function handleClick() {
    if (state === 'waiting') {
      state = 'early';
      const msg = document.getElementById('react-msg');
      if (msg) msg.textContent = '❌ Too early! Wait for the artwork...';
      setTimeout(() => { scheduleGo(); if (msg) msg.textContent = 'Click when the artwork appears!'; }, 1000);
    } else if (state === 'go') {
      const ms = Math.round(performance.now() - startTime);
      results.push(ms);
      state = 'result';
      drawState(); updateHUD();
      if (results.length >= 5) { setTimeout(endGame, 1500); }
      else { setTimeout(scheduleGo, 1200); }
    }
  }

  function updateHUD() {
    const r = document.getElementById('react-round'), b = document.getElementById('react-best');
    if (r) r.textContent = results.length;
    if (b && results.length) b.textContent = Math.min(...results) + 'ms';
  }

  function endGame() {
    const avg = Math.round(results.reduce((a,b)=>a+b,0)/results.length);
    const best = Math.min(...results);
    container.innerHTML = `
      <div style="max-width:400px;margin:0 auto;padding:40px;text-align:center;font-family:Inter,sans-serif">
        <div style="font-size:56px;margin-bottom:16px">⚡</div>
        <h2 style="color:#ff6ec7;margin:0 0 8px">Results</h2>
        <p style="color:#22c55e;font-size:24px;margin:0 0 4px">Best: ${best}ms</p>
        <p style="color:#ccc;font-size:14px;margin:0 0 24px">Average: ${avg}ms</p>
        <button onclick="ReactionGame.init()" style="background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:12px 32px;border-radius:24px;cursor:pointer;font-size:15px;font-weight:600">Try Again</button>
      </div>
    `;
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('reaction', best);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
