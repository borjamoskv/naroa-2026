/**
 * Sistema de Rankings — Naroa 2026
 * Gestión soberana de puntuaciones con persistencia localStorage.
 * @module core/ranking-system
 */

/** Previene inyección XSS en templates innerHTML */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export const RankingSystem = {
  // ... (keeping internal state as local constants within module scope)
  storageKey: 'naroa-games-rankings',
  
  getDefaultRankings() {
    return {
      oca: [],
      tetris: [],
      memory: [],
      puzzle: [],
      snake: [],
      breakout: [],
      whack: [],
      simon: [],
      quiz: [],
      catch: [],
      collage: [],
      reinas: [],
      mica: [],
      kintsugi: [],
      pong: [],
      painter: [],
      reaction: [],
      sequence: [],
      typing: []
    };
  },

  loadRankings() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return this.getDefaultRankings();
      const parsed = JSON.parse(data);
      return { ...this.getDefaultRankings(), ...parsed };
    } catch (e) {
      Logger.warn('Rankings load error:', e);
      return this.getDefaultRankings();
    }
  },

  saveRankings(rankings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(rankings));
    } catch (e) {
      Logger.warn('Rankings save error:', e);
    }
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  },

  submitScore(gameId, score, playerName = 'Anónimo', meta = {}) {
    const rankings = this.loadRankings();
    if (!rankings[gameId]) rankings[gameId] = [];
    
    const entry = {
      id: Date.now().toString(36),
      name: playerName.toUpperCase().slice(0, 3).padEnd(3, '_'),
      score: Math.floor(score),
      date: new Date().toISOString(),
      ...meta
    };
    
    rankings[gameId].push(entry);
    rankings[gameId].sort((a, b) => b.score - a.score);
    rankings[gameId] = rankings[gameId].slice(0, 100);
    this.saveRankings(rankings);
    
    const rank = rankings[gameId].findIndex(e => e.id === entry.id) + 1;
    return { rank, isHighScore: rank === 1, isTop10: rank <= 10, entry };
  },

  getTopScores(gameId, limit = 10) {
    const rankings = this.loadRankings();
    return (rankings[gameId] || []).slice(0, limit);
  },

  getPersonalBest(gameId, playerName) {
    const rankings = this.loadRankings();
    const scores = rankings[gameId] || [];
    return scores.find(s => s.name === playerName) || null;
  },

  clearAll() {
    localStorage.removeItem(this.storageKey);
  },

  renderLeaderboard(gameId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const scores = this.getTopScores(gameId, 10);
    
    if (scores.length === 0) {
      container.textContent = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'ranking-empty';
      emptyDiv.innerHTML = `<p>🏆 Aún no hay puntuaciones</p><p class="ranking-subtitle">¡Sé el primero!</p>`;
      container.appendChild(emptyDiv);
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    container.innerHTML = `
      <div class="ranking-list">
        <h3 class="ranking-title">🏆 Top 10</h3>
        ${scores.map((s, i) => `
          <div class="ranking-entry ${i < 3 ? 'ranking-entry--top' : ''}">
            <span class="ranking-pos">${medals[i] || (i + 1)}</span>
            <span class="ranking-name">${escapeHTML(s.name)}</span>
            <span class="ranking-score">${s.score.toLocaleString()}</span>
            <span class="ranking-date">${this.formatDate(s.date)}</span>
          </div>
        `).join('')}
      </div>`;
  },

  showSubmitModal(gameId, score, onSubmit) {
    document.getElementById('ranking-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'ranking-modal';
    modal.innerHTML = `
      <div class="ranking-modal-overlay">
        <div class="ranking-modal-content">
          <h2>🎮 ¡Partida Completada!</h2>
          <div class="ranking-score-display">${score.toLocaleString()}</div>
          <p>puntos</p>
          <form class="ranking-form" id="ranking-submit-form">
            <input type="text" id="ranking-player-name" placeholder="AAA" maxlength="3" class="ranking-input ranking-input--arcade" autocomplete="off" pattern="[A-Za-z]{1,3}" style="text-transform: uppercase; letter-spacing: 0.3em; font-family: monospace; font-size: 2rem;">
            <button type="submit" class="ranking-btn ranking-btn--primary">Guardar Puntuación</button>
            <button type="button" class="ranking-btn ranking-btn--secondary" id="ranking-skip">Saltar</button>
          </form>
        </div>
      </div>
      <style>
        .ranking-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(8px); }
        .ranking-modal-content { background: linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%); padding: 2.5rem; border-radius: 16px; text-align: center; border: 1px solid rgba(255,215,0,0.3); box-shadow: 0 25px 80px rgba(0,0,0,0.7); max-width: 90vw; width: 380px; }
        .ranking-modal-content h2 { color: #fff; margin: 0 0 1.5rem; font-size: 1.5rem; }
        .ranking-score-display { font-size: 3.5rem; font-weight: 700; color: #ffd700; text-shadow: 0 0 30px rgba(255,215,0,0.5); }
        .ranking-modal-content p { color: #888; margin: 0.25rem 0 1.5rem; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.8rem; }
        .ranking-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .ranking-input { padding: 0.9rem 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem; text-align: center; }
        .ranking-input:focus { outline: none; border-color: #ffd700; }
        .ranking-btn { padding: 0.9rem 1.5rem; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .ranking-btn--primary { background: linear-gradient(135deg, #ffd700, #daa520); color: #000; font-weight: 600; }
        .ranking-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,215,0,0.4); }
        .ranking-btn--secondary { background: transparent; color: #666; border: 1px solid #333; }
        .ranking-btn--secondary:hover { border-color: #555; color: #888; }
      </style>`;
    
    document.body.appendChild(modal);
    const form = modal.querySelector('#ranking-submit-form');
    const input = modal.querySelector('#ranking-player-name');
    const skipBtn = modal.querySelector('#ranking-skip');

    setTimeout(() => input.focus(), 100);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = input.value.trim() || 'Anónimo';
      const result = this.submitScore(gameId, score, name);
      modal.remove();
      if (onSubmit) onSubmit(result);
    });

    skipBtn.addEventListener('click', () => {
      modal.remove();
      if (onSubmit) onSubmit(null);
    });
  }
};

// Injection of styles (maintaining original behavior but cleaner)
const style = document.createElement('style');
style.textContent = `
  .ranking-list { background: rgba(0,0,0,0.4); border-radius: 12px; padding: 1rem; margin: 1rem 0; }
  .ranking-title { text-align: center; color: #ffd700; margin: 0 0 1rem; font-size: 1.1rem; }
  .ranking-entry { display: grid; grid-template-columns: 40px 1fr auto auto; gap: 0.75rem; padding: 0.6rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); align-items: center; }
  .ranking-entry:last-child { border-bottom: none; }
  .ranking-entry--top { background: rgba(255,215,0,0.05); }
  .ranking-pos { font-size: 1.2rem; text-align: center; }
  .ranking-name { color: #fff; font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
  .ranking-score { color: #ffd700; font-weight: 600; font-family: monospace; }
  .ranking-date { color: #666; font-size: 0.75rem; }
  .ranking-empty { text-align: center; padding: 2rem; color: #666; }
  .ranking-subtitle { color: #888; font-size: 0.9rem; }
`;
document.head.appendChild(style);
