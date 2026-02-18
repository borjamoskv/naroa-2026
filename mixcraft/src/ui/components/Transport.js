/* ═══════════════════════════════════════════════════
   Transport Component — Temporal Control
   Neon-reactive buttons, BPM, Playhead
   ═══════════════════════════════════════════════════ */

export class Transport {
  constructor(app) {
    this.app = app;
    this.dom = {};
  }

  init() {
    this._cacheDOM();
    this._bindEvents();
    this.render();
  }

  _cacheDOM() {
    // Assumes new HTML structure or binds to existing
    this.dom.playBtn = document.getElementById('transport-play');
    this.dom.recBtn = document.getElementById('transport-rec');
    this.dom.timeDisplay = document.querySelector('.time-display');
    this.dom.bpmValue = document.querySelector('.bpm-value');
    this.dom.bpmTap = document.getElementById('bpm-tap');
  }

  _bindEvents() {
    if(this.dom.playBtn) {
        this.dom.playBtn.addEventListener('click', () => this.app.togglePlayback());
    }
    
    // Spacebar mapping
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        this.app.togglePlayback();
      }
    });

    if (this.dom.recBtn) {
        this.dom.recBtn.addEventListener('click', () => this.app.toggleRecording());
    }
  }

  update() {
    // Visual Pulse for Play Button
    if (this.app.audioEngine.isPlaying) {
      this.dom.playBtn?.classList.add('playing');
    } else {
      this.dom.playBtn?.classList.remove('playing');
    }

    // Time Display
    if (this.dom.timeDisplay) {
        const time = this.app.audioEngine.getCurrentTime();
        this.dom.timeDisplay.innerHTML = this._formatTime(time);
    }
  }

  render() {
    // Initial static render if not already in HTML
    // For MVP, we assume HTML exists, but we can enhance element classes
  }

  _formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    
    return `
      <span>${minutes.toString().padStart(2, '0')}</span>
      <span class="time-sep">:</span>
      <span>${seconds.toString().padStart(2, '0')}</span>
      <span class="time-sep" style="opacity:0.5">.</span>
      <span class="dim">${ms.toString().padStart(2, '0')}</span>
    `;
  }
}
