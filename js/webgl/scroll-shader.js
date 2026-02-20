/**
 * WebGL Scroll Shader - Aurora Noise Effect
 * Auto-inicializando, fullscreen, z-index:-1
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        canvasZIndex: -1,
        pointerEvents: 'none',
        resizeDelay: 100
    };

    // Color palette stops
    const COLORS = {
        black: [0.0, 0.0, 0.0],
        gold: [0.831, 0.686, 0.216],  // #d4af37
        red: [1.0, 0.0, 0.235]        // #ff003c
    };

    // Vertex Shader
    const VERTEX_SHADER_SOURCE = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment Shader - Organic Aurora Noise
    const FRAGMENT_SHADER_SOURCE = `
        precision mediump float;
        
        uniform float u_time;
        uniform float u_scroll;
        uniform vec2 u_resolution;
        
        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                               -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                   + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                   dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
        
        // Fractional Brownian Motion
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for(int i = 0; i < 5; i++) {
                value += amplitude * snoise(p * frequency);
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            return value;
        }
        
        // Color interpolation
        vec3 palette(float t) {
            vec3 black = vec3(0.0, 0.0, 0.0);
            vec3 gold = vec3(0.831, 0.686, 0.216);
            vec3 red = vec3(1.0, 0.0, 0.235);
            
            if(t < 0.3) {
                float localT = t / 0.3;
                return mix(black, gold, smoothstep(0.0, 1.0, localT));
            } else if(t < 0.6) {
                float localT = (t - 0.3) / 0.3;
                return mix(gold, red, smoothstep(0.0, 1.0, localT));
            } else {
                float localT = (t - 0.6) / 0.4;
                return mix(red, black, smoothstep(0.0, 1.0, localT));
            }
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
            
            // Create flowing coordinates
            vec2 flowUV = uv * 2.0;
            flowUV.x *= aspect.x;
            
            // Time-based animation
            float time = u_time * 0.15;
            
            // Multiple noise layers for aurora effect
            float n1 = fbm(flowUV + vec2(time * 0.5, time * 0.3));
            float n2 = fbm(flowUV * 1.5 - vec2(time * 0.3, time * 0.5) + n1 * 0.5);
            float n3 = fbm(flowUV * 0.5 + vec2(time * 0.2, -time * 0.4) + n2 * 0.3);
            
            // Combine noise layers
            float noise = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
            
            // Scroll influence - warp noise based on scroll
            float scrollWarp = u_scroll * 3.14159;
            float scrollInfluence = sin(uv.y * 3.0 + scrollWarp) * 0.3 * u_scroll;
            noise += scrollInfluence;
            
            // Normalize and enhance contrast
            noise = noise * 0.5 + 0.5;
            noise = pow(noise, 1.2);
            
            // Get base color from palette based on scroll
            vec3 baseColor = palette(u_scroll);
            
            // Create aurora bands
            float bands = sin(uv.y * 8.0 + noise * 4.0 + time) * 0.5 + 0.5;
            bands = pow(bands, 3.0);
            
            // Secondary color for variation
            vec3 secondaryColor;
            if(u_scroll < 0.3) {
                secondaryColor = vec3(0.4, 0.3, 0.1);
            } else if(u_scroll < 0.6) {
                secondaryColor = vec3(0.9, 0.5, 0.1);
            } else {
                secondaryColor = vec3(0.6, 0.0, 0.15);
            }
            
            // Mix colors based on noise and bands
            vec3 color = mix(baseColor * 0.3, baseColor, noise);
            color = mix(color, secondaryColor, bands * 0.4);
            
            // Add subtle glow
            float glow = exp(-noise * 2.0) * 0.3;
            color += baseColor * glow;
            
            // Vignette
            vec2 center = uv - 0.5;
            float vignette = 1.0 - dot(center, center) * 0.8;
            vignette = clamp(vignette, 0.0, 1.0);
            color *= vignette;
            
            // Scroll-based intensity
            float intensity = 0.6 + sin(u_scroll * 3.14159) * 0.4;
            color *= intensity;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    class ScrollShader {
        constructor() {
            this.canvas = null;
            this.gl = null;
            this.program = null;
            this.animationId = null;
            this.startTime = performance.now();
            this.scrollRatio = 0;
            this.resizeTimeout = null;
            
            this.uniforms = {
                time: null,
                scroll: null,
                resolution: null
            };
            
            this.init();
        }
        
        init() {
            this.createCanvas();
            this.initWebGL();
            this.createGeometry();
            this.getUniformLocations();
            this.addEventListeners();
            this.start();
        }
        
        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed;
                inset: 0;
                width: 100%;
                height: 100%;
                z-index: ${CONFIG.canvasZIndex};
                pointer-events: ${CONFIG.pointerEvents};
                background: #000;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
        }
        
        initWebGL() {
            this.gl = this.canvas.getContext('webgl', {
                alpha: false,
                antialias: false,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance'
            });
            
            if(!this.gl) {
                Logger.warn('WebGL not supported, skipping scroll shader');
                return;
            }
            
            const gl = this.gl;
            
            // Create shaders
            const vertexShader = this.createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
            const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
            
            if(!vertexShader || !fragmentShader) {
                console.error('Failed to create shaders');
                return;
            }
            
            // Create program
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);
            
            if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Program link error:', gl.getProgramInfoLog(this.program));
                return;
            }
            
            gl.useProgram(this.program);
            
            // Set viewport
            this.resize();
        }
        
        createShader(type, source) {
            const gl = this.gl;
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        }
        
        createGeometry() {
            const gl = this.gl;
            
            // Fullscreen quad (clip space)
            const positions = new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                -1,  1,
                 1, -1,
                 1,  1
            ]);
            
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            
            const positionLocation = gl.getAttribLocation(this.program, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        }
        
        getUniformLocations() {
            const gl = this.gl;
            this.uniforms.time = gl.getUniformLocation(this.program, 'u_time');
            this.uniforms.scroll = gl.getUniformLocation(this.program, 'u_scroll');
            this.uniforms.resolution = gl.getUniformLocation(this.program, 'u_resolution');
        }
        
        addEventListeners() {
            // Scroll listener
            window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
            this.handleScroll();
            
            // Resize listener (debounced)
            window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        }
        
        handleScroll() {
            const scrollY = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const maxScroll = Math.max(1, docHeight - winHeight);
            this.scrollRatio = Math.max(0, Math.min(1, scrollY / maxScroll));
        }
        
        handleResize() {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.resize(), CONFIG.resizeDelay);
        }
        
        resize() {
            if(!this.gl) return;
            
            const dpr = Math.min(window.devicePixelRatio, 2);
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.canvas.width = Math.floor(width * dpr);
            this.canvas.height = Math.floor(height * dpr);
            
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        start() {
            if(!this.gl) return;
            this.loop();
        }
        
        loop() {
            this.animationId = requestAnimationFrame(this.loop.bind(this));
            this.render();
        }
        
        render() {
            const gl = this.gl;
            const time = (performance.now() - this.startTime) / 1000;
            
            gl.uniform1f(this.uniforms.time, time);
            gl.uniform1f(this.uniforms.scroll, this.scrollRatio);
            gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
            
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        
        destroy() {
            if(this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            
            clearTimeout(this.resizeTimeout);
            
            if(this.gl) {
                this.gl.deleteProgram(this.program);
                this.gl = null;
            }
            
            if(this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                this.canvas = null;
            }
            
            window.removeEventListener('scroll', this.handleScroll);
            window.removeEventListener('resize', this.handleResize);
        }
    }

    // Auto-initialize when DOM is ready
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.scrollShader = new ScrollShader();
        });
    } else {
        window.scrollShader = new ScrollShader();
    }
})();
