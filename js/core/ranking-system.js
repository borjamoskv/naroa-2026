/**
 * RANKING SYSTEM - Persistent Leaderboards
 * Uses localStorage for persistence
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'naroa-games-rankings';
  
  // Default leaderboard structure
  function getDefaultRankings() {
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
      // New games
      pong: [],
      painter: [],
      reaction: [],
      sequence: [],
      typing: []
    };
  }

  function loadRankings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return getDefaultRankings();
      const parsed = JSON.parse(data);
      // Merge with defaults for new games
      return { ...getDefaultRankings(), ...parsed };
    } catch (e) {
      console.warn('Rankings load error:', e);
      return getDefaultRankings();
    }
  }

  function saveRankings(rankings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings));
    } catch (e) {
      console.warn('Rankings save error:', e);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  }

  // Public API
  const RankingSystem = {
    /**
     * Submit a new score for a game
     * @param {string} gameId - Game identifier
     * @param {number} score - Player's score
     * @param {string} playerName - Player name (optional)
     * @param {object} meta - Additional metadata
     * @returns {object} - Rank info { rank, isHighScore, isTop10 }
     */
    submitScore(gameId, score, playerName = 'Anónimo', meta = {}) {
      const rankings = loadRankings();
      
      if (!rankings[gameId]) {
        rankings[gameId] = [];
      }
      
      const entry = {
        id: Date.now().toString(36),
        name: playerName.toUpperCase().slice(0, 3).padEnd(3, '_'), // 3 letras estilo arcade
        score: Math.floor(score),
        date: new Date().toISOString(),
        ...meta
      };
      
      rankings[gameId].push(entry);
      
      // Sort by score descending
      rankings[gameId].sort((a, b) => b.score - a.score);
      
      // Keep only top 100
      rankings[gameId] = rankings[gameId].slice(0, 100);
      
      saveRankings(rankings);
      
      // Find rank
      const rank = rankings[gameId].findIndex(e => e.id === entry.id) + 1;
      const isHighScore = rank === 1;
      const isTop10 = rank <= 10;
      
      return { rank, isHighScore, isTop10, entry };
    },

    /**
     * Get top scores for a game
     */
    getTopScores(gameId, limit = 10) {
      const rankings = loadRankings();
      return (rankings[gameId] || []).slice(0, limit);
    },

    /**
     * Get personal best for current session/player
     */
    getPersonalBest(gameId, playerName) {
      const rankings = loadRankings();
      const scores = rankings[gameId] || [];
      return scores.find(s => s.name === playerName) || null;
    },

    /**
     * Clear all rankings (for testing)
     */
    clearAll() {
      localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Render leaderboard HTML
     */
    renderLeaderboard(gameId, containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const scores = this.getTopScores(gameId, 10);
      
      if (scores.length === 0) {
        container.innerHTML = `
          <div class="ranking-empty">
            <p>🏆 Aún no hay puntuaciones</p>
            <p class="ranking-subtitle">¡Sé el primero!</p>
          </div>
        `;
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      
      container.innerHTML = `
        <div class="ranking-list">
          <h3 class="ranking-title">🏆 Top 10</h3>
          ${scores.map((s, i) => `
            <div class="ranking-entry ${i < 3 ? 'ranking-entry--top' : ''}">
              <span class="ranking-pos">${medals[i] || (i + 1)}</span>
              <span class="ranking-name">${s.name}</span>
              <span class="ranking-score">${s.score.toLocaleString()}</span>
              <span class="ranking-date">${formatDate(s.date)}</span>
            </div>
          `).join('')}
        </div>
      `;
    },

    /**
     * Show score submission modal
     */
    showSubmitModal(gameId, score, onSubmit) {
      // Remove existing modal
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
              <input type="text" 
                     id="ranking-player-name" 
                     placeholder="AAA" 
                     maxlength="3"
                     class="ranking-input ranking-input--arcade"
                     autocomplete="off"
                     pattern="[A-Za-z]{1,3}"
                     style="text-transform: uppercase; letter-spacing: 0.3em; font-family: monospace; font-size: 2rem;">
              <button type="submit" class="ranking-btn ranking-btn--primary">
                Guardar Puntuación
              </button>
              <button type="button" class="ranking-btn ranking-btn--secondary" id="ranking-skip">
                Saltar
              </button>
            </form>
          </div>
        </div>
        <style>
          .ranking-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(8px);
          }
          .ranking-modal-content {
            background: linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%);
            padding: 2.5rem;
            border-radius: 16px;
            text-align: center;
            border: 1px solid rgba(255,215,0,0.3);
            box-shadow: 0 25px 80px rgba(0,0,0,0.7);
            max-width: 90vw;
            width: 380px;
          }
          .ranking-modal-content h2 {
            color: #fff;
            margin: 0 0 1.5rem;
            font-size: 1.5rem;
          }
          .ranking-score-display {
            font-size: 3.5rem;
            font-weight: 700;
            color: #ffd700;
            text-shadow: 0 0 30px rgba(255,215,0,0.5);
          }
          .ranking-modal-content p {
            color: #888;
            margin: 0.25rem 0 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-size: 0.8rem;
          }
          .ranking-form {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .ranking-input {
            padding: 0.9rem 1rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            background: rgba(255,255,255,0.05);
            color: #fff;
            font-size: 1rem;
            text-align: center;
          }
          .ranking-input:focus {
            outline: none;
            border-color: #ffd700;
          }
          .ranking-btn {
            padding: 0.9rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .ranking-btn--primary {
            background: linear-gradient(135deg, #ffd700, #daa520);
            color: #000;
            font-weight: 600;
          }
          .ranking-btn--primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255,215,0,0.4);
          }
          .ranking-btn--secondary {
            background: transparent;
            color: #666;
            border: 1px solid #333;
          }
          .ranking-btn--secondary:hover {
            border-color: #555;
            color: #888;
          }
        </style>
      `;
      
      document.body.appendChild(modal);

      const form = modal.querySelector('#ranking-submit-form');
      const input = modal.querySelector('#ranking-player-name');
      const skipBtn = modal.querySelector('#ranking-skip');

      // Focus input
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

  // CSS for leaderboards
  const style = document.createElement('style');
  style.textContent = `
    .ranking-list {
      background: rgba(0,0,0,0.4);
      border-radius: 12px;
      padding: 1rem;
      margin: 1rem 0;
    }
    .ranking-title {
      text-align: center;
      color: #ffd700;
      margin: 0 0 1rem;
      font-size: 1.1rem;
    }
    .ranking-entry {
      display: grid;
      grid-template-columns: 40px 1fr auto auto;
      gap: 0.75rem;
      padding: 0.6rem 0.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      align-items: center;
    }
    .ranking-entry:last-child { border-bottom: none; }
    .ranking-entry--top { background: rgba(255,215,0,0.05); }
    .ranking-pos { 
      font-size: 1.2rem;
      text-align: center;
    }
    .ranking-name { 
      color: #fff;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ranking-score {
      color: #ffd700;
      font-weight: 600;
      font-family: monospace;
    }
    .ranking-date {
      color: #666;
      font-size: 0.75rem;
    }
    .ranking-empty {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    .ranking-subtitle {
      color: #888;
      font-size: 0.9rem;
    }
  `;
  document.head.appendChild(style);

  // Export
  window.RankingSystem = RankingSystem;
})();
