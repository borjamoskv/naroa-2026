/* ═══════════════════════════════════════════════════
   SpectrumAnalyzer v1 — Sovereign Visual Module
   Industrial Noir Aesthetic: Cyber Lime / Violet Gradients
   ═══════════════════════════════════════════════════ */

export class SpectrumAnalyzer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    
    // Sovereign Aesthetic State
    this.barCount = 64;
    this.gradient = null;
    
    this._resizeObserver = new ResizeObserver(() => this._resize());
    if(canvas) this._resizeObserver.observe(canvas);
  }

  _resize() {
    if(!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.width = rect.width;
    this.height = rect.height;
    
    // Regenerate gradient on resize
    this._createGradient();
  }

  _createGradient() {
    if (!this.ctx || this.height === 0) return;
    
    // Sovereign Gradient: Cyber Lime (Top) -> Electric Violet (Mid) -> Transparent
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    this.gradient.addColorStop(0.0, 'rgba(204, 255, 0, 0.9)');    // #CCFF00
    this.gradient.addColorStop(0.4, 'rgba(123, 47, 255, 0.7)');  // #7B2FFF
    this.gradient.addColorStop(1.0, 'rgba(10, 10, 10, 0.2)');     // Fade out
  }

  draw(frequencyData) {
    if (!this.canvas || !frequencyData) return;
    
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid Background (Industrial Feel)
    this._drawGrid();

    const barWidth = width / this.barCount;
    const step = Math.floor(frequencyData.length / this.barCount);

    for (let i = 0; i < this.barCount; i++) {
        // Average value for smoother display
        let sum = 0;
        for (let j = 0; j < step; j++) {
            sum += frequencyData[i * step + j];
        }
        const val = (sum / step) / 255;
        
        // Non-linear scaling for better bass visibility
        const scaledVal = Math.pow(val, 0.8); 
        const h = scaledVal * height;
        
        const x = i * barWidth;
        const y = height - h;

        // Draw Bar
        ctx.fillStyle = this.gradient || '#CCFF00';
        ctx.fillRect(x, y, barWidth - 1, h);

        // Peak Hint (Top Line)
        if (h > 2) {
             ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
             ctx.fillRect(x, y, barWidth - 1, 1);
        }
    }
  }

  _drawGrid() {
      const { ctx, width, height } = this;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Horizontal Lines (dB levels metaphor)
      ctx.beginPath();
      for (let i = 0.25; i < 1; i += 0.25) {
          const y = height * i;
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
      }
      ctx.stroke();
  }
}
