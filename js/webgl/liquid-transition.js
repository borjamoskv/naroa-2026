/**
 * WebGL Liquid Transition Shader
 * Smooth image transitions with Perlin noise-based fluid distortion
 * Optimized for 60fps on mobile devices
 */

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform float u_time;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_intensity;

// Perlin noise functions
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
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

// Fractional Brownian Motion for more organic noise
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

// Smooth easing function
float smoothEase(float t) {
    return t < 0.5 
        ? 4.0 * t * t * t 
        : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    
    // Animated noise coordinates
    vec2 noiseCoord = uv * 3.0 + u_time * 0.15;
    
    // Multi-layered liquid distortion
    float noise1 = fbm(noiseCoord);
    float noise2 = fbm(noiseCoord * 1.5 + vec2(noise1 * 0.5, u_time * 0.1));
    float noise3 = snoise(noiseCoord * 2.0 + vec2(noise2, 0.0));
    
    // Combine noise layers for organic liquid effect
    float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    
    // Smooth progress with easing
    float easedProgress = smoothEase(u_progress);
    
    // Calculate distortion based on progress
    // Maximum distortion at progress = 0.5
    float distortionStrength = u_intensity * sin(easedProgress * 3.14159);
    
    // Create flowing liquid distortion
    vec2 distortion = vec2(
        combinedNoise * distortionStrength,
        fbm(noiseCoord + vec2(5.2, 1.3)) * distortionStrength
    );
    
    // Add wave-like motion
    float wave = sin(uv.y * 8.0 + u_time * 0.5 + combinedNoise * 2.0) * 0.02 * distortionStrength;
    distortion.x += wave;
    
    // Sample textures with distortion
    vec2 distortedUV1 = uv + distortion * (1.0 - easedProgress);
    vec2 distortedUV2 = uv - distortion * easedProgress;
    
    // Add ripple effect during transition
    float ripple = sin(length(uv - 0.5) * 20.0 - u_time * 2.0) * 0.01 * distortionStrength;
    distortedUV1 += ripple;
    distortedUV2 += ripple;
    
    vec4 tex1 = texture(u_texture1, clamp(distortedUV1, 0.0, 1.0));
    vec4 tex2 = texture(u_texture2, clamp(distortedUV2, 0.0, 1.0));
    
    // Liquid-like blending with noise-based mix
    float noiseMix = snoise(uv * 5.0 + u_time * 0.2) * 0.1;
    float mixFactor = smoothstep(0.0, 1.0, easedProgress + combinedNoise * 0.15 + noiseMix);
    
    // Add specular highlight during peak distortion
    float specular = pow(max(0.0, combinedNoise), 3.0) * distortionStrength * 0.3;
    
    vec4 finalColor = mix(tex1, tex2, mixFactor);
    finalColor.rgb += specular;
    
    fragColor = finalColor;
}
`;

export class LiquidTransition {
    constructor(options = {}) {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationId = null;
        
        // Transition state
        this.progress = 0;
        this.targetProgress = 0;
        this.transitionSpeed = 0.02;
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 1000;
        
        // Configuration
        this.intensity = options.intensity || 0.15;
        
        // WebGL resources
        this.positionBuffer = null;
        this.texCoordBuffer = null;
        this.texture1 = null;
        this.texture2 = null;
        this.currentTexture = null;
        this.nextTexture = null;
        
        // Uniform locations
        this.uniforms = {};
        
        // Bind methods
        this.update = this.update.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }
    
    /**
     * Initialize the WebGL context and shaders
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    init(canvas) {
        this.canvas = canvas;
        
        // Get WebGL2 context with performance optimizations
        this.gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
        });
        
        if (!this.gl) {
            throw new Error('WebGL2 not supported');
        }
        
        // Disable depth testing for 2D rendering
        this.gl.disable(this.gl.DEPTH_TEST);
        
        // Initialize shaders
        this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
        if (!this.program) {
            throw new Error('Failed to create shader program');
        }
        
        this.gl.useProgram(this.program);
        
        // Get uniform locations
        this.uniforms = {
            texture1: this.gl.getUniformLocation(this.program, 'u_texture1'),
            texture2: this.gl.getUniformLocation(this.program, 'u_texture2'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            progress: this.gl.getUniformLocation(this.program, 'u_progress'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity')
        };
        
        // Create geometry
        this.createBuffers();
        
        // Set initial viewport
        this.handleResize();
        
        // Handle resize
        window.addEventListener('resize', this.handleResize, { passive: true });
        
        return this;
    }
    
    /**
     * Create a shader from source
     */
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * Create shader program
     */
    createProgram(vsSource, fsSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        if (!vertexShader || !fragmentShader) return null;
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    /**
     * Create vertex buffers for a fullscreen quad
     */
    createBuffers() {
        // Position buffer (clip space)
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1
        ]);
        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Texture coordinate buffer
        const texCoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ]);
        
        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
        
        const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
        this.gl.enableVertexAttribArray(texCoordLocation);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    /**
     * Load an image into a WebGL texture
     */
    loadTexture(image) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        
        // Set texture parameters for quality
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        
        return texture;
    }
    
    /**
     * Start a transition between two images
     * @param {HTMLImageElement|HTMLCanvasElement} fromImage - Starting image
     * @param {HTMLImageElement|HTMLCanvasElement} toImage - Target image
     * @param {number} duration - Duration in milliseconds
     */
    transition(fromImage, toImage, duration = 1000) {
        if (!this.gl) return;
        
        // Clean up old textures
        if (this.texture1) {
            this.gl.deleteTexture(this.texture1);
        }
        if (this.texture2) {
            this.gl.deleteTexture(this.texture2);
        }
        
        // Load new textures
        this.texture1 = this.loadTexture(fromImage);
        this.texture2 = this.loadTexture(toImage);
        
        // Reset progress
        this.progress = 0;
        this.targetProgress = 1;
        this.transitionDuration = duration;
        this.transitionStartTime = performance.now();
        this.isTransitioning = true;
        
        // Start render loop if not already running
        if (!this.animationId) {
            this.update();
        }
        
        return this;
    }
    
    /**
     * Update and render frame
     */
    update() {
        if (!this.gl || !this.program) return;
        
        const now = performance.now();
        
        // Update transition progress
        if (this.isTransitioning) {
            const elapsed = now - this.transitionStartTime;
            this.progress = Math.min(elapsed / this.transitionDuration, 1);
            
            if (this.progress >= 1) {
                this.progress = 1;
                this.isTransitioning = false;
            }
        }
        
        // Convert to seconds for shader
        const time = now * 0.001;
        
        // Set uniforms
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform1f(this.uniforms.progress, this.progress);
        this.gl.uniform1f(this.uniforms.intensity, this.intensity);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        
        // Bind textures
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture1);
        this.gl.uniform1i(this.uniforms.texture1, 0);
        
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture2);
        this.gl.uniform1i(this.uniforms.texture2, 1);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        
        // Continue animation if transitioning
        if (this.isTransitioning) {
            this.animationId = requestAnimationFrame(this.update);
        } else {
            this.animationId = null;
        }
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        if (!this.canvas || !this.gl) return;
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = Math.floor(this.canvas.clientWidth * dpr);
        const displayHeight = Math.floor(this.canvas.clientHeight * dpr);
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }
    
    /**
     * Set transition intensity
     * @param {number} value - Intensity value (0.0 to 1.0)
     */
    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
        return this;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        if (this.gl) {
            if (this.texture1) this.gl.deleteTexture(this.texture1);
            if (this.texture2) this.gl.deleteTexture(this.texture2);
            if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
            if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);
            if (this.program) this.gl.deleteProgram(this.program);
        }
        
        this.gl = null;
        this.program = null;
        this.canvas = null;
    }
}

export default LiquidTransition;
