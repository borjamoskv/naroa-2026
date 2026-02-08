/**
 * Reinas del Arte - Naroa 2026
 * Agent A18: Portrait reveal animation, hint glow, result confetti
 */
(function() {
  'use strict';

  const QUEENS = [
    { name: 'Frida Kahlo', hint: 'Pintora mexicana, cejas icónicas', fact: 'Sufrió un grave accidente a los 18 años que marcó su arte.' },
    { name: 'Artemisia Gentileschi', hint: 'Barroca italiana, Judith y Holofernes', fact: 'Primera mujer admitida en la Accademia di Arte del Disegno.' },
    { name: 'Georgia O\'Keeffe', hint: 'Flores gigantes, desierto americano', fact: 'Conocida como la "Madre del modernismo americano".' },
    { name: 'Yayoi Kusama', hint: 'Lunares infinitos, calabazas', fact: 'Vive voluntariamente en un hospital psiquiátrico desde 1977.' },
    { name: 'Louise Bourgeois', hint: 'Arañas gigantes, "Maman"', fact: 'No tuvo reconocimiento masivo hasta los 70 años.' },
    { name: 'Tamara de Lempicka', hint: 'Art Deco, retratos glamurosos', fact: 'Sus obras son las más caras del período Art Deco.' },
    { name: 'Hilma af Klint', hint: 'Abstracciones antes que Kandinsky', fact: 'Pidió que su obra no se mostrara hasta 20 años después de su muerte.' },
    { name: 'Marina Abramović', hint: 'Performance art, "The Artist is Present"', fact: 'Permaneció sentada inmóvil 736 horas en el MoMA.' }
  ];

  let state = { current: 0, score: 0, revealed: false, answers: [] };

  function init() {
    const container = document.getElementById('reinas-container');
    if (!container) return;
    state.current = 0;
    state.score = 0;
    state.revealed = false;
    state.answers = shuffle([...QUEENS]);

    container.innerHTML = `
      <div class="reinas-ui">
        <div class="reinas-info">
          <span>Pregunta: <strong id="reinas-q">1</strong>/${QUEENS.length}</span>
          <span>Puntos: <strong id="reinas-score" style="color:#d4af37">0</strong></span>
        </div>
        <div id="reinas-hint" class="reinas-hint"></div>
        <div id="reinas-options" class="reinas-options"></div>
        <div id="reinas-fact" class="reinas-fact"></div>
      </div>
    `;
    showQuestion();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showQuestion() {
    if (state.current >= state.answers.length) { endGame(); return; }
    const q = state.answers[state.current];
    document.getElementById('reinas-q').textContent = state.current + 1;
    document.getElementById('reinas-hint').innerHTML = `<p style="font-size:1.2rem">💡 Pista: <em>${q.hint}</em></p>`;
    document.getElementById('reinas-fact').textContent = '';

    // Generate 4 options (1 correct + 3 random)
    const options = [q];
    const others = QUEENS.filter(r => r.name !== q.name);
    while (options.length < 4 && others.length > 0) {
      const idx = Math.floor(Math.random() * others.length);
      options.push(others.splice(idx, 1)[0]);
    }
    shuffle(options);

    const optEl = document.getElementById('reinas-options');
    optEl.innerHTML = options.map(o => `<button class="game-btn reinas-btn" data-name="${o.name}">${o.name}</button>`).join('');
    optEl.querySelectorAll('.reinas-btn').forEach(btn => {
      btn.addEventListener('click', () => checkAnswer(btn, q));
    });
  }

  function checkAnswer(btn, correct) {
    const allBtns = document.querySelectorAll('.reinas-btn');
    allBtns.forEach(b => b.disabled = true);

    if (btn.dataset.name === correct.name) {
      btn.style.background = 'rgba(212, 175, 55, 0.3)';
      btn.style.borderColor = '#d4af37';
      state.score += 100;
      document.getElementById('reinas-score').textContent = state.score;
      if (window.GameEffects) {
        GameEffects.confettiBurst(btn);
        GameEffects.scorePopAnimation(document.getElementById('reinas-score'), '+100');
      }
    } else {
      btn.style.background = 'rgba(255, 0, 60, 0.3)';
      btn.style.borderColor = '#ff003c';
      // Highlight correct
      allBtns.forEach(b => { if (b.dataset.name === correct.name) { b.style.background = 'rgba(212, 175, 55, 0.2)'; b.style.borderColor = '#d4af37'; } });
    }

    document.getElementById('reinas-fact').innerHTML = `<p style="color:#ffd700;margin-top:10px">📖 ${correct.fact}</p>`;

    setTimeout(() => {
      state.current++;
      showQuestion();
    }, 2500);
  }

  function endGame() {
    const container = document.getElementById('reinas-container');
    container.innerHTML = `
      <div class="reinas-result" style="text-align:center;padding:40px">
        <h2 style="color:#d4af37">🏆 Resultado Final</h2>
        <p style="font-size:2rem;color:#ffd700">${state.score} / ${QUEENS.length * 100}</p>
        <p>${state.score >= 600 ? '¡Eres una experta en Reinas del Arte!' : state.score >= 400 ? '¡Buen conocimiento!' : 'Sigue aprendiendo sobre estas artistas increíbles.'}</p>
        <button class="game-btn" onclick="window.ReinasGame.init()">Jugar de nuevo</button>
      </div>
    `;
    if (window.GameEffects) GameEffects.confettiBurst(container);
  }

  window.ReinasGame = { init };
})();
