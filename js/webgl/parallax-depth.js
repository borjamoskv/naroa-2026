/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PARALLAX DEPTH SHADER - WebGL Engine
 * Naroa Gutiérrez Gil 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../core/logger.js';

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_depth;
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;
  void main() {
    vec2 uv = v_texCoord;
    vec2 mouseOffset = (u_mouse - 0.5) * 2.0;
    vec2 parallax = mouseOffset * u_depth * 0.05;
    uv += parallax;
    gl_FragColor = texture2D(u_texture, uv);
  }
`;

const compositeVertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const compositeFragmentShader = `
  precision mediump float;
  uniform sampler2D u_layer0;
  uniform sampler2D u_layer1;
  uniform sampler2D u_layer2;
  uniform sampler2D u_layer3;
  uniform float u_opacity0;
  uniform float u_opacity1;
  uniform float u_opacity2;
  uniform float u_opacity3;
  uniform int u_layerCount;
  varying vec2 v_texCoord;
  void main() {
    vec4 color = vec4(0.0);
    if (u_layerCount > 0) color = texture2D(u_layer0, v_texCoord) * u_opacity0;
    if (u_layerCount > 1) {
      vec4 l1 = texture2D(u_layer1, v_texCoord) * u_opacity1;
      color = mix(color, l1, l1.a);
    }
    if (u_layerCount > 2) {
      vec4 l2 = texture2D(u_layer2, v_texCoord) * u_opacity2;
      color = mix(color, l2, l2.a);
    }
    if (u_layerCount > 3) {
      vec4 l3 = texture2D(u_layer3, v_texCoord) * u_opacity3;
      color = mix(color, l3, l3.a);
    }
    gl_FragColor = color;
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    Logger.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    Logger.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export class ParallaxDepthShader {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    }) || canvas.getContext('experimental-webgl');

    if (!this.gl) throw new Error('WebGL Not Supported');

    this.layers = [];
    this.layerDepths = [];
    this.maxLayers = options.maxLayers || 4;
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.currentMouse = { x: 0.5, y: 0.5 };
    this.mouseVelocity = 0.2;
    this.time = 0;
    this.framebuffers = [];
    this.textures = [];
    this.isInitialized = false;
  }

  init() {
    const gl = this.gl;
    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    this.compProgram = createProgram(gl, compositeVertexShader, compositeFragmentShader);

    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);

    this.setupLocations();
    this.setupFramebuffers();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    this.resize();
    this.isInitialized = true;
    return this;
  }

  setupLocations() {
    const gl = this.gl;
    this.locs = {
      pos: gl.getAttribLocation(this.program, 'a_position'),
      uv: gl.getAttribLocation(this.program, 'a_texCoord'),
      time: gl.getUniformLocation(this.program, 'u_time'),
      res: gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: gl.getUniformLocation(this.program, 'u_mouse'),
      depth: gl.getUniformLocation(this.program, 'u_depth'),
      tex: gl.getUniformLocation(this.program, 'u_texture')
    };

    this.compLocs = {
      pos: gl.getAttribLocation(this.compProgram, 'a_position'),
      uv: gl.getAttribLocation(this.compProgram, 'a_texCoord'),
      layerCount: gl.getUniformLocation(this.compProgram, 'u_layerCount')
    };

    for (let i = 0; i < 4; i++) {
      this.compLocs[`layer${i}`] = gl.getUniformLocation(this.compProgram, `u_layer${i}`);
      this.compLocs[`opacity${i}`] = gl.getUniformLocation(this.compProgram, `u_opacity${i}`);
    }
  }

  setupFramebuffers() {
    const gl = this.gl;
    for (let i = 0; i < this.maxLayers; i++) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      
      this.framebuffers.push(fb);
      this.textures.push(tex);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resize() {
    const gl = this.gl;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      gl.viewport(0, 0, w, h);
      this.textures.forEach(tex => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      });
    }
  }

  addLayer(img, depth = 0) {
    if (this.layers.length >= this.maxLayers) return -1;
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const idx = this.layers.length;
    this.layers.push({ texture: tex });
    this.layerDepths[idx] = depth;
    return idx;
  }

  update(dt) {
    const friction = 0.15;
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * friction;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * friction;
    this.time += dt * 0.001;
  }

  render() {
    if (!this.isInitialized || this.layers.length === 0) return;
    this.resize();
    const gl = this.gl;
    
    // Pass 1: Draw layers to FBOs with parallax
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.vertexAttribPointer(this.locs.pos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locs.pos);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(this.locs.uv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locs.uv);

    this.layers.forEach((layer, i) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[i]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(this.locs.time, this.time);
      gl.uniform2f(this.locs.res, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.locs.mouse, this.currentMouse.x, this.currentMouse.y);
      gl.uniform1f(this.locs.depth, this.layerDepths[i]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, layer.texture);
      gl.uniform1i(this.locs.tex, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

    // Pass 2: Composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.compProgram);
    gl.uniform1i(this.compLocs.layerCount, this.layers.length);
    
    for (let i = 0; i < 4; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        gl.uniform1i(this.compLocs[`layer${i}`], i);
        gl.uniform1f(this.compLocs[`opacity${i}`], i < this.layers.length ? 1.0 : 0.0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  destroy() {
    const gl = this.gl;
    this.layers.forEach(l => gl.deleteTexture(l.texture));
    this.textures.forEach(t => gl.deleteTexture(t));
    this.framebuffers.forEach(fb => gl.deleteFramebuffer(fb));
    gl.deleteBuffer(this.posBuffer);
    gl.deleteBuffer(this.uvBuffer);
    gl.deleteProgram(this.program);
    gl.deleteProgram(this.compProgram);
  }
}

export default ParallaxDepthShader;
