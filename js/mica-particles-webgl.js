/**
 * MICA PARTICLE SYSTEM - WebGL2 Shaders Emocionales
 * Polvo dorado reactivo con fallback Canvas 2D
 * Optimizado para 800+ partículas @ 60fps en móviles
 */

class MICAParticleSystem {
  constructor(canvasId = 'particle-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      Logger.warn('Canvas not found:', canvasId);
      return;
    }

    this.gl = this.canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: false });
    
    if (!this.gl) {
      this.fallbackMode = true;
      this.initFallback();
      return;
    }
    
    this.maxParticles = 800; // Límite GPU mobile-friendly
    this.particles = new Float32Array(this.maxParticles * 6); // x,y,vx,vy,life,size
    this.activeCount = 0;
    this.lastFrameTime = 0;
    
    this.initShaders();
    this.initBuffers();
    this.resize();
    
    // Paletas tritono por mood (RGB normalizado)
    this.palettes = {
      ENERGETIC: new Float32Array([0.9, 0.64, 0.48, 1.0, 0.97, 0.95]), // Naranja/Crema
      TIRED: new Float32Array([0.4, 0.4, 0.45, 0.6, 0.6, 0.65]),      // Gris azulado
      GRUMPY: new Float32Array([0.9, 0.2, 0.2, 0.1, 0.1, 0.8]),       // Rojo/Azul
      PLAYFUL: new Float32Array([0.9, 0.64, 0.48, 0.2, 0.8, 0.6]),    // Naranja/Verde
      SOUL: new Float32Array([1.0, 0.84, 0.0, 1.0, 1.0, 1.0]),        // Oro puro
      NEUTRAL: new Float32Array([0.9, 0.64, 0.48, 0.18, 0.18, 0.18])  // Naranja/Negro
    };
    
    this.currentPalette = this.palettes.NEUTRAL;
    this.mousePosition = { x: 0, y: 0 };
    
    // Setup mouse tracking para modo GRUMPY (repulsión)
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });
    
    // Resize handler
    window.addEventListener('resize', () => this.resize());
    
  }

  initShaders() {
    const vsSource = `#version 300 es
      precision mediump float;
      
      in vec2 a_position;
      in vec2 a_velocity;
      in float a_life;
      in float a_size;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform int u_mood;
      
      out float v_life;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 pos = a_position;
        
        // Comportamiento por mood
        if (u_mood == 2) { // TIRED: Levitación lenta
          pos.y += sin(u_time * 0.5 + a_position.x * 0.1) * 20.0;
          pos.y -= u_time * 10.0; // Suben
        } else if (u_mood == 3) { // GRUMPY: Turbulencia caótica
          pos.x += sin(u_time * 5.0 + a_position.y * 0.02) * 30.0;
          pos.y += cos(u_time * 4.0 + a_position.x * 0.02) * 30.0;
        } else if (u_mood == 4) { // PLAYFUL: Órbita circular
          float angle = u_time * 0.5 + length(a_position) * 0.001;
          float radius = 100.0;
          pos.x += cos(angle) * radius;
          pos.y += sin(angle) * radius;
        } else if (u_mood == 1) { // ENERGETIC: Explosión radial
          vec2 center = u_resolution * 0.5;
          vec2 dir = normalize(a_position - center);
          pos += dir * u_time * 50.0;
        }
        
        // Convertir a clip space
        vec2 clipSpace = ((pos / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        
        // Tamaño variable según vida
        gl_PointSize = a_size * mix(0.5, 1.0, a_life);
        
        v_life = a_life;
      }
    `;

    const fsSource = `#version 300 es
      precision mediump float;
      
      in float v_life;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      
      out vec4 outColor;
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) discard;
        
        // Gradiente radial suave
        float alpha = 1.0 - (dist * 2.0);
        alpha = pow(alpha, 1.5) * v_life;
        
        // Mezcla de colores tritono
        vec3 color = mix(u_color1, u_color2, v_life);
        
        outColor = vec4(color, alpha * 0.8);
      }
    `;

    this.program = this.createProgram(vsSource, fsSource);
    this.gl.useProgram(this.program);
    
    // Localizar uniforms
    this.locations = {
      a_position: this.gl.getAttribLocation(this.program, 'a_position'),
      a_velocity: this.gl.getAttribLocation(this.program, 'a_velocity'),
      a_life: this.gl.getAttribLocation(this.program, 'a_life'),
      a_size: this.gl.getAttribLocation(this.program, 'a_size'),
      resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      mood: this.gl.getUniformLocation(this.program, 'u_mood'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2')
    };
  }

  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
    }
    return program;
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  initBuffers() {
    const gl = this.gl;
    
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
    // Setup atributos
    const stride = 6 * 4; // 6 floats, 4 bytes cada uno
    
    gl.enableVertexAttribArray(this.locations.a_position);
    gl.vertexAttribPointer(this.locations.a_position, 2, gl.FLOAT, false, stride, 0);
    
    gl.enableVertexAttribArray(this.locations.a_velocity);
    gl.vertexAttribPointer(this.locations.a_velocity, 2, gl.FLOAT, false, stride, 8);
    
    gl.enableVertexAttribArray(this.locations.a_life);
    gl.vertexAttribPointer(this.locations.a_life, 1, gl.FLOAT, false, stride, 16);
    
    gl.enableVertexAttribArray(this.locations.a_size);
    gl.vertexAttribPointer(this.locations.a_size, 1, gl.FLOAT, false, stride, 20);
    
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  emit(x, y, count = 1) {
    if (this.fallbackMode) {
      this.emitFallback(x, y, count);
      return;
    }
    
    for (let i = 0; i < count && this.activeCount < this.maxParticles; i++) {
      const idx = this.activeCount * 6;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      
      this.particles[idx] = x + (Math.random() - 0.5) * 20;
      this.particles[idx + 1] = y + (Math.random() - 0.5) * 20;
      this.particles[idx + 2] = Math.cos(angle) * speed;
      this.particles[idx + 3] = Math.sin(angle) * speed;
      this.particles[idx + 4] = 1.0;
      this.particles[idx + 5] = Math.random() * 15 + 5;
      
      this.activeCount++;
    }
  }

  emitAtElement(element, count = 20) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    this.emit(x, y, count);
  }

  update(deltaTime) {
    if (this.fallbackMode) {
      this.updateFallback(deltaTime);
      return;
    }
    
    const mood = window.MICA?.getState()?.mood || 'NEUTRAL';
    let writeIndex = 0;
    
    for (let i = 0; i < this.activeCount; i++) {
      const idx = i * 6;
      let life = this.particles[idx + 4];
      
      life -= deltaTime * 0.5;
      
      if (life > 0) {
        this.particles[idx] += this.particles[idx + 2];
        this.particles[idx + 1] += this.particles[idx + 3];
        
        // Gravedad según mood
        if (mood === 'TIRED') {
          this.particles[idx + 3] -= 0.02; // Anti-gravedad
        } else if (mood !== 'PLAYFUL') {
          this.particles[idx + 3] += 0.08; // Gravedad normal
        }
        
        this.particles[idx + 4] = life;
        
        if (writeIndex !== i) {
          const writeIdx = writeIndex * 6;
          for (let j = 0; j < 6; j++) {
            this.particles[writeIdx + j] = this.particles[idx + j];
          }
        }
        writeIndex++;
      }
    }
    
    this.activeCount = writeIndex;
  }

  render(time) {
    if (this.fallbackMode) {
      this.renderFallback();
      return;
    }
    
    const gl = this.gl;
    
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    if (this.activeCount === 0) return;
    
    // Configurar uniforms
    gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.locations.time, time / 1000);
    
    // Mapear mood a int
    const moodMap = { 'NEUTRAL': 0, 'ENERGETIC': 1, 'TIRED': 2, 'GRUMPY': 3, 'PLAYFUL': 4, 'SOUL': 1 };
    const currentMood = window.MICA?.getState()?.mood || 'NEUTRAL';
    gl.uniform1i(this.locations.mood, moodMap[currentMood] || 0);
    
    // Actualizar buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.DYNAMIC_DRAW);
    
    // Colores
    const pal = this.currentPalette;
    gl.uniform3f(this.locations.color1, pal[0], pal[1], pal[2]);
    gl.uniform3f(this.locations.color2, pal[3], pal[4], pal[5]);
    
    // Dibujar
    gl.drawArrays(gl.POINTS, 0, this.activeCount);
  }

  setMood(mood) {
    this.currentPalette = this.palettes[mood] || this.palettes.NEUTRAL;
    
    // Explosión de partículas al cambiar mood
    if (this.activeCount < this.maxParticles - 50) {
      this.emit(this.canvas.width / 2, this.canvas.height / 2, 30);
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  // Fallback Canvas 2D
  initFallback() {
    this.ctx = this.canvas.getContext('2d');
    this.fallbackParticles = [];
  }

  emitFallback(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.fallbackParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        size: Math.random() * 10 + 2
      });
    }
  }

  updateFallback(deltaTime) {
    this.fallbackParticles = this.fallbackParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravedad
      p.life -= deltaTime * 0.5;
      return p.life > 0;
    });
  }

  renderFallback() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.fallbackParticles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229, 164, 123, ${p.life * 0.5})`;
      ctx.fill();
    });
  }
}

// Auto-inicializar y loop de animación
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Crear canvas si no existe
    if (!document.getElementById('particle-canvas')) {
      const canvas = document.createElement('canvas');
      canvas.id = 'particle-canvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
      document.body.appendChild(canvas);
    }
    
    window.MicaParticles = new MICAParticleSystem('particle-canvas');
    
    // Loop de animación
    function animate(time) {
      if (!window.MicaParticles.lastFrameTime) window.MicaParticles.lastFrameTime = time;
      
      const delta = (time - window.MicaParticles.lastFrameTime) / 1000;
      window.MicaParticles.lastFrameTime = time;
      
      window.MicaParticles.update(delta);
      window.MicaParticles.render(time);
      
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    
    // Escuchar cambios de mood
    window.addEventListener('mica-mood-change', (e) => {
      window.MicaParticles.setMood(e.detail.mood);
    });
  });
}

export default MICAParticleSystem;
