/**
 * DISPLACEMENT DEPTH PARALLAX
 * Efecto de desplazamiento 3D con mapas de profundidad
 * Inspirado en: Tympanus/Codrops WebGPU Scanning Effect, Progressive Blur
 * 
 * Técnicas:
 * - Canvas-based depth displacement
 * - UV coordinate distortion based on mouse position
 * - Dynamic depth maps (simulate 3D from 2D)
 */

class DisplacementDepthParallax {
  constructor(options = {}) {
    this.config = {
      canvas: null,
      image: null,
      depthMap: null, // If not provided, we auto-generate a gradient-based one
      intensity: options.intensity || 0.05,
      smoothing: options.smoothing || 0.1,
      perspective: options.perspective || 0.5,
      enableHover: options.enableHover !== false,
      ...options
    };

    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.gl = null;
    this.program = null;
    this.textures = {};

    if (this.config.canvas) {
      this.init();
    }
  }

  async init() {
    const canvas = typeof this.config.canvas === 'string' 
      ? document.querySelector(this.config.canvas)
      : this.config.canvas;

    if (!canvas) {
      console.error('DisplacementParallax: Canvas not found');
      return;
    }

    this.canvas = canvas;
    
    // Try WebGL2 first, fallback to WebGL1
    this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!this.gl) {
      Logger.warn('DisplacementParallax: WebGL not supported, falling back to CSS');
      this.useCSSFallback();
      return;
    }

    await this.setupShaders();
    await this.loadTextures();
    this.bindEvents();
    this.startLoop();

  }

  async setupShaders() {
    const gl = this.gl;

    // Vertex Shader
    const vsSource = `
      attribute vec4 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      
      void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
      }
    `;

    // Fragment Shader with depth displacement
    const fsSource = `
      precision highp float;
      
      varying vec2 vTexCoord;
      
      uniform sampler2D uImage;
      uniform sampler2D uDepthMap;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uTime;
      uniform float uPerspective;
      
      void main() {
        // Get depth value (grayscale)
        float depth = texture2D(uDepthMap, vTexCoord).r;
        
        // Calculate displacement based on mouse position and depth
        vec2 mouseOffset = (uMouse - 0.5) * 2.0;
        vec2 displacement = mouseOffset * depth * uIntensity;
        
        // Add subtle parallax perspective
        float perspectiveFactor = 1.0 + (depth - 0.5) * uPerspective;
        vec2 perspectiveOffset = (vTexCoord - 0.5) * (perspectiveFactor - 1.0);
        
        // Combined UV with displacement
        vec2 uv = vTexCoord + displacement + perspectiveOffset * 0.1;
        
        // Chromatic aberration based on depth
        float chromaOffset = depth * 0.003 * length(mouseOffset);
        vec4 colorR = texture2D(uImage, uv + vec2(chromaOffset, 0.0));
        vec4 colorG = texture2D(uImage, uv);
        vec4 colorB = texture2D(uImage, uv - vec2(chromaOffset, 0.0));
        
        gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Shader program failed:', gl.getProgramInfoLog(this.program));
      return;
    }

    // Setup geometry (fullscreen quad)
    const positions = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.useProgram(this.program);

    const aPosition = gl.getAttribLocation(this.program, 'aPosition');
    const aTexCoord = gl.getAttribLocation(this.program, 'aTexCoord');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    // Store uniform locations
    this.uniforms = {
      uImage: gl.getUniformLocation(this.program, 'uImage'),
      uDepthMap: gl.getUniformLocation(this.program, 'uDepthMap'),
      uMouse: gl.getUniformLocation(this.program, 'uMouse'),
      uIntensity: gl.getUniformLocation(this.program, 'uIntensity'),
      uTime: gl.getUniformLocation(this.program, 'uTime'),
      uPerspective: gl.getUniformLocation(this.program, 'uPerspective')
    };
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  async loadTextures() {
    const gl = this.gl;

    // Load main image
    if (this.config.image) {
      this.textures.image = await this.createTexture(this.config.image);
    }

    // Load or generate depth map
    if (this.config.depthMap) {
      this.textures.depth = await this.createTexture(this.config.depthMap);
    } else {
      // Auto-generate radial depth map (center = closer, edges = further)
      this.textures.depth = this.generateRadialDepthMap();
    }
  }

  async createTexture(src) {
    const gl = this.gl;
    const texture = gl.createTexture();

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        resolve(texture);
      };
      img.src = src;
    });
  }

  generateRadialDepthMap() {
    const gl = this.gl;
    const size = 256;
    const data = new Uint8Array(size * size * 4);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x / size - 0.5) * 2;
        const dy = (y / size - 0.5) * 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Center is white (close), edges are black (far)
        const value = Math.max(0, Math.min(255, (1 - distance) * 255));
        
        const i = (y * size + x) * 4;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  bindEvents() {
    if (this.config.enableHover) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouse.x = (e.clientX - rect.left) / rect.width;
        this.targetMouse.y = 1 - (e.clientY - rect.top) / rect.height;
      }, { passive: true });

      this.canvas.addEventListener('mouseleave', () => {
        this.targetMouse.x = 0.5;
        this.targetMouse.y = 0.5;
      });
    }

    // Gyroscope for mobile
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null) {
          this.targetMouse.x = 0.5 + (e.gamma / 90);
          this.targetMouse.y = 0.5 + (e.beta / 90);
        }
      }, { passive: true });
    }

    // Resize handler
    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  startLoop() {
    const gl = this.gl;
    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth mouse interpolation
      this.mouse.x += (this.targetMouse.x - this.mouse.x) * this.config.smoothing;
      this.mouse.y += (this.targetMouse.y - this.mouse.y) * this.config.smoothing;

      gl.clear(gl.COLOR_BUFFER_BIT);

      // Bind textures
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.image);
      gl.uniform1i(this.uniforms.uImage, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.depth);
      gl.uniform1i(this.uniforms.uDepthMap, 1);

      // Set uniforms
      gl.uniform2f(this.uniforms.uMouse, this.mouse.x, this.mouse.y);
      gl.uniform1f(this.uniforms.uIntensity, this.config.intensity);
      gl.uniform1f(this.uniforms.uTime, time);
      gl.uniform1f(this.uniforms.uPerspective, this.config.perspective);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      this.animationFrame = requestAnimationFrame(render);
    };

    render();
  }

  useCSSFallback() {
    // Fallback to CSS-only parallax
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    // Cleanup WebGL resources
    if (this.gl) {
      this.gl.deleteProgram(this.program);
    }
  }

  // Static factory method
  static create(canvas, image, options = {}) {
    return new DisplacementDepthParallax({
      canvas,
      image,
      ...options
    });
  }
}

// Export
window.DisplacementDepthParallax = DisplacementDepthParallax;
