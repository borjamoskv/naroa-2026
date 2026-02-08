/**
 * Game Gateway — MICA Organic Art Invitation
 * Palette: gold (#d4af37), red (#ff003c), black
 * Aesthetic: organic shapes, irregular borders, petrichor warmth
 * No perfect circles, no right angles — tierra
 */
(function() {
  'use strict';

  const CONFIG = {
    trigger: {
      scrollThreshold: 0.6,
      timeThreshold: 45000,
      maxShowsPerSession: 2
    },
    games: [
      { id: 'memory', name: 'Memory', icon: '🧠', tags: ['calm', 'art'] },
      { id: 'puzzle', name: 'Puzzle', icon: '🧩', tags: ['calm', 'art'] },
      { id: 'snake', name: 'Snake', icon: '🐍', tags: ['action'] },
      { id: 'breakout', name: 'Breakout', icon: '🧱', tags: ['action'] },
      { id: 'tetris', name: 'Tetris', icon: '🕹️', tags: ['action', 'classic'] },
      { id: 'whack', name: 'Whack Art', icon: '🔨', tags: ['action', 'fun'] },
      { id: 'simon', name: 'Simon', icon: '🎵', tags: ['memory'] },
      { id: 'quiz', name: 'Quiz', icon: '❓', tags: ['trivia', 'art'] },
      { id: 'catch', name: 'Catch', icon: '🧺', tags: ['action'] },
      { id: 'collage', name: 'Collage', icon: '🎨', tags: ['creative', 'art'] },
      { id: 'reinas', name: 'Reinas', icon: '👑', tags: ['trivia'] },
      { id: 'kintsugi', name: 'Kintsugi', icon: '🥇', tags: ['zen', 'art'] },
      { id: 'pong', name: 'Pong', icon: '🏓', tags: ['action', 'classic'] },
      { id: 'reaction', name: 'Reflejos', icon: '⚡', tags: ['action'] },
      { id: 'typing', name: 'Typing', icon: '⌨️', tags: ['skill'] },
      { id: 'chess', name: 'Ajedrez', icon: '♟️', tags: ['strategy'] },
      { id: 'checkers', name: 'Damas', icon: '🔴', tags: ['strategy'] },
      { id: 'connect4', name: 'Conecta 4', icon: '🔵', tags: ['strategy'] },
      { id: 'reversi', name: 'Reversi', icon: '⚫', tags: ['strategy'] },
      { id: 'restaurador', name: 'Restaurador', icon: '🎨💀', tags: ['fun', 'art'] },
      { id: 'runner', name: 'Runner', icon: '🏃', tags: ['action'] },
      { id: 'rotate', name: 'Rotate', icon: '🔄', tags: ['calm'] },
      { id: 'scratch', name: 'Scratch', icon: '🎰', tags: ['fun'] },
      { id: 'target', name: 'Target', icon: '🎯', tags: ['action'] },
      { id: 'juego', name: 'Oca', icon: '🎲', tags: ['classic'] },
      { id: 'mica', name: 'MICA Viva', icon: '✨', tags: ['art', 'zen'] }
    ],
    quotes: {
      yes: [
        '¡Así me gusta! Vamos a jugar... 🎮',
        'Excelente elección. Tu cerebro te lo agradecerá ✨',
        '¡Dale! He preparado algo especial para ti...',
        'MICA aprueba. Iniciando diversión artística... 🎨'
      ],
      depends: [
        'Mmm, indecisión... Te muestro opciones para tentarte 😏',
        'Déjame recomendarte algo basado en lo que has visto...',
        '«Depende» es la respuesta de quien ya quiere jugar 😉',
        'Te voy a convencer. Mira esto...'
      ],
      no: [
        'Respeto tu decisión... pero volveré 🖤',
        'Ok, sigue explorando. Pero los juegos te esperan...',
        'Bueno... más arte para ti entonces. ¡Excelente gusto! 🖼️',
        '¿Seguro? Los cuadros se aburren sin ti...',
        'Entendido. MICA se retira... por ahora 👀'
      ]
    }
  };

  let state = {
    shown: false,
    showCount: 0,
    scrollTriggered: false,
    timeTriggered: false,
    dismissed: sessionStorage.getItem('gg-dismissed') === 'true'
  };

  const utils = {
    random: arr => arr[Math.floor(Math.random() * arr.length)],
    throttle: (fn, wait) => {
      let last = 0;
      return (...args) => {
        const now = Date.now();
        if (now - last >= wait) { last = now; fn(...args); }
      };
    },
    getViewedArtworks: () => {
      try { return JSON.parse(localStorage.getItem('naroa-viewed') || '[]'); }
      catch { return []; }
    },
    saveViewedArtwork: (id) => {
      const viewed = utils.getViewedArtworks();
      if (!viewed.includes(id)) {
        viewed.push(id);
        localStorage.setItem('naroa-viewed', JSON.stringify(viewed.slice(-50)));
      }
    },
    trackInteraction: (action) => {
      if (window.gtag) window.gtag('event', 'game_gateway', { action });
    }
  };

  // ============================================================
  // ORGANIC STYLES — Gold/Red/Black, no perfect shapes
  // ============================================================
  function injectStyles() {
    if (document.getElementById('game-gateway-styles')) return;
    const style = document.createElement('style');
    style.id = 'game-gateway-styles';
    style.textContent = `
      .gg-overlay {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.6s ease;
      }
      .gg-overlay.active { opacity: 1; pointer-events: all; }

      .gg-backdrop {
        position: absolute; inset: 0;
        background: rgba(8, 5, 3, 0.88);
        -webkit-backdrop-filter: blur(24px) saturate(0.8);
        backdrop-filter: blur(24px) saturate(0.8);
      }

      .gg-dialog {
        position: relative; z-index: 1;
        background: linear-gradient(160deg, 
          rgba(25, 18, 10, 0.95), 
          rgba(15, 10, 5, 0.98));
        border: 1px solid rgba(212, 175, 55, 0.12);
        border-radius: 22px 14px 18px 10px;
        padding: 44px 40px 36px;
        max-width: 460px;
        width: 90%;
        text-align: center;
        box-shadow: 
          0 0 80px rgba(212, 175, 55, 0.04),
          0 30px 60px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(212, 175, 55, 0.06);
        animation: ggSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes ggSlideIn {
        from { transform: translateY(24px) scale(0.97); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }

      .gg-avatar {
        width: 56px; height: 56px;
        border-radius: 18px 12px 16px 10px;
        background: linear-gradient(145deg, 
          rgba(212, 175, 55, 0.2), 
          rgba(255, 0, 60, 0.12));
        border: 1px solid rgba(212, 175, 55, 0.2);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.6rem;
        margin: 0 auto 14px;
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.08);
        animation: ggBreathe 4s ease-in-out infinite;
      }

      @keyframes ggBreathe {
        0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.08); }
        50% { box-shadow: 0 0 35px rgba(212, 175, 55, 0.15); }
      }

      .gg-label {
        font-size: 0.7rem;
        color: rgba(212, 175, 55, 0.45);
        text-transform: uppercase;
        letter-spacing: 3px;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .gg-text {
        font-size: 1.9rem;
        color: rgba(255, 248, 235, 0.95);
        font-weight: 700;
        min-height: 48px;
        margin-bottom: 28px;
        line-height: 1.2;
      }

      .gg-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .gg-btn {
        padding: 11px 26px;
        border-radius: 10px 6px 8px 5px;
        font-family: 'Satoshi', sans-serif;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
        letter-spacing: 0.2px;
      }

      .gg-btn::before {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.06), transparent);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .gg-btn:hover::before { opacity: 1; }

      .gg-btn--yes {
        background: linear-gradient(140deg, 
          rgba(212, 175, 55, 0.85), 
          rgba(178, 140, 35, 0.9));
        color: #0a0804;
        box-shadow: 0 0 25px rgba(212, 175, 55, 0.15);
      }
      .gg-btn--yes:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.25);
      }

      .gg-btn--depends {
        background: rgba(255, 248, 235, 0.05);
        color: rgba(255, 248, 235, 0.8);
        border-color: rgba(212, 175, 55, 0.15);
      }
      .gg-btn--depends:hover {
        background: rgba(212, 175, 55, 0.08);
        border-color: rgba(212, 175, 55, 0.3);
        transform: translateY(-1px);
      }

      .gg-btn--no {
        background: transparent;
        color: rgba(255, 248, 235, 0.3);
        border-color: rgba(255, 248, 235, 0.06);
      }
      .gg-btn--no:hover {
        color: rgba(255, 0, 60, 0.7);
        border-color: rgba(255, 0, 60, 0.2);
      }

      .gg-close {
        position: absolute;
        top: 14px; right: 14px;
        width: 30px; height: 30px;
        border: none;
        background: rgba(255, 248, 235, 0.03);
        border-radius: 8px 5px 7px 4px;
        color: rgba(255, 248, 235, 0.2);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.25s;
        display: flex; align-items: center; justify-content: center;
      }
      .gg-close:hover { 
        background: rgba(255, 0, 60, 0.12); 
        color: rgba(255, 0, 60, 0.6);
      }

      .gg-recs {
        display: none;
        margin-top: 20px;
      }
      .gg-recs.active { display: block; }

      .gg-rec-list {
        display: flex; gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 14px;
      }

      .gg-game-card {
        background: rgba(212, 175, 55, 0.03);
        border: 1px solid rgba(212, 175, 55, 0.1);
        border-radius: 12px 8px 10px 6px;
        padding: 14px;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        min-width: 95px;
        text-align: center;
      }
      .gg-game-card:hover {
        background: rgba(212, 175, 55, 0.06);
        border-color: rgba(212, 175, 55, 0.25);
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(212, 175, 55, 0.08);
      }
      .gg-game-card__icon { font-size: 1.8rem; margin-bottom: 4px; }
      .gg-game-card__name { 
        font-size: 0.8rem; 
        color: rgba(255, 248, 235, 0.7); 
      }

      .gg-response {
        color: rgba(212, 175, 55, 0.7);
        font-style: italic;
        min-height: 22px;
        margin-top: 10px;
        font-size: 0.85rem;
        line-height: 1.4;
      }

      /* Organic texture overlay */
      .gg-dialog::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: 
          radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.03) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 70%, rgba(255,0,60,0.02) 0%, transparent 50%);
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // TYPEWRITER
  // ============================================================
  function typewriter(el, text, speed = 60) {
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, speed);
      }
    };
    type();
  }

  // ============================================================
  // CREATE OVERLAY
  // ============================================================
  function createOverlay() {
    injectStyles();

    const overlay = document.createElement('div');
    overlay.className = 'gg-overlay';
    overlay.innerHTML = `
      <div class="gg-backdrop"></div>
      <div class="gg-dialog" id="gg-dialog">
        <button class="gg-close" aria-label="Cerrar">✕</button>
        <div class="gg-avatar">🎭</div>
        <div class="gg-label">MICA te pregunta</div>
        <div class="gg-text" id="gg-mica-text"></div>
        <div class="gg-buttons">
          <button class="gg-btn gg-btn--yes" data-action="yes">🎮 ¡Sí!</button>
          <button class="gg-btn gg-btn--depends" data-action="depends">🤔 Depende</button>
          <button class="gg-btn gg-btn--no" data-action="no">Mejor no</button>
        </div>
        <div class="gg-response" id="gg-response"></div>
        <div class="gg-recs" id="gg-recommendations">
          <div class="gg-rec-list" id="gg-rec-list"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================
  function getRecommendations(count = 3) {
    const viewed = utils.getViewedArtworks();
    let preferred = [];

    if (viewed.length > 5) {
      preferred = CONFIG.games.filter(g => g.tags.includes('art'));
    } else if (viewed.length > 0) {
      preferred = CONFIG.games.filter(g => g.tags.includes('calm') || g.tags.includes('art'));
    }

    if (preferred.length < count) {
      preferred = [...CONFIG.games];
    }

    const shuffled = preferred.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  function handleButtonClick(e, action, overlay) {
    const responseEl = overlay.querySelector('#gg-response');
    const recsEl = overlay.querySelector('#gg-recommendations');
    const quote = utils.random(CONFIG.quotes[action] || CONFIG.quotes.no);

    typewriter(responseEl, quote, 40);
    utils.trackInteraction(action);

    if (action === 'yes') {
      setTimeout(() => {
        const game = utils.random(CONFIG.games);
        launchGame(game);
        hide();
      }, 1500);
    } else if (action === 'depends') {
      setTimeout(() => {
        const recs = getRecommendations(3);
        const listEl = overlay.querySelector('#gg-rec-list');
        listEl.innerHTML = recs.map(g => `
          <div class="gg-game-card" data-game-id="${g.id}">
            <div class="gg-game-card__icon">${g.icon}</div>
            <div class="gg-game-card__name">${g.name}</div>
          </div>
        `).join('');

        listEl.querySelectorAll('.gg-game-card').forEach(card => {
          card.addEventListener('click', () => {
            const game = CONFIG.games.find(g => g.id === card.dataset.gameId);
            if (game) { launchGame(game); hide(); }
          });
        });

        recsEl.classList.add('active');
      }, 800);
    } else {
      setTimeout(() => {
        hide();
        sessionStorage.setItem('gg-dismissed', 'true');
        state.dismissed = true;
      }, 2000);
    }
  }

  function launchGame(game) {
    window.location.hash = `/${game.id}`;
    utils.trackInteraction(`launch_${game.id}`);
  }

  // ============================================================
  // TRIGGERS
  // ============================================================
  function setupTriggers() {
    if (state.dismissed) return;

    const handleScroll = utils.throttle(() => {
      if (state.scrollTriggered || state.shown || state.dismissed) return;
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent >= CONFIG.trigger.scrollThreshold) {
        state.scrollTriggered = true;
        show();
      }
    }, 200);

    setTimeout(() => {
      if (!state.timeTriggered && !state.shown && !state.dismissed) {
        state.timeTriggered = true;
        show();
      }
    }, CONFIG.trigger.timeThreshold);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  let overlay = null;

  function init() {
    if (overlay) return;
    setupTriggers();

    document.querySelectorAll('[data-artwork]').forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) utils.saveViewedArtwork(el.dataset.artwork);
        });
      }, { threshold: 0.5 });
      observer.observe(el);
    });
  }

  function show() {
    if (state.dismissed) return;
    if (state.shown) return;
    if (state.showCount >= CONFIG.trigger.maxShowsPerSession) return;

    if (!overlay) overlay = createOverlay();

    state.shown = true;
    state.showCount++;

    overlay.classList.add('active');

    overlay.querySelectorAll('.gg-btn').forEach(btn => {
      btn.onclick = (e) => handleButtonClick(e, btn.dataset.action, overlay);
    });

    overlay.querySelector('.gg-close').onclick = hide;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('gg-backdrop')) hide();
    });

    const escHandler = (e) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', escHandler);

    const textEl = overlay.querySelector('#gg-mica-text');
    const responseEl = overlay.querySelector('#gg-response');
    const recsEl = overlay.querySelector('#gg-recommendations');
    responseEl.textContent = '';
    recsEl.classList.remove('active');
    typewriter(textEl, '¿Juegas?', 80);

    utils.trackInteraction('show');
  }

  function hide() {
    if (!overlay || !state.shown) return;
    state.shown = false;
    overlay.classList.remove('active');
    setTimeout(() => {
      if (overlay) {
        const textEl = overlay.querySelector('#gg-mica-text');
        if (textEl) textEl.textContent = '';
      }
    }, 500);
  }

  window.GameGateway = {
    init,
    show,
    hide,
    getState: () => ({ ...state }),
    version: '3.0.0-organic'
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
