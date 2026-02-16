import { Renderer, Camera, Program, Mesh, Plane, Texture, Vec2 } from 'ogl';

/**
 * Liquid Distortion Engine v2.0 — "Awwwards Edition"
 * Features: Chromatic Aberration, SDF Distortion, Texture Cover Logic
 * Powered by OGL
 */

export class LiquidDistortion {
    constructor() {
        this.container = document.querySelector('.hero-immersive__image-wrapper');
        this.img = document.querySelector('.hero-immersive__image');
        
        if (!this.container || !this.img) return;

        this.renderer = null;
        this.gl = null;
        this.camera = null;
        this.scene = null;
        this.mouse = new Vec2(0, 0);
        this.lastMouse = new Vec2(0, 0);
        this.mouseVelocity = new Vec2(0, 0);
        this.targetVelo = 0;
        this.currentVelo = 0;
        
        if (this.img.complete) {
            this.init();
        } else {
            this.img.onload = () => this.init();
        }
    }

    init() {
        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.addEventListeners();
        this.onResize();
        this.update(0);
        
        this.img.style.opacity = '0';
        console.log('💧 [Divinity] Liquid Engine v2.0 Active');
    }

    createRenderer() {
        this.renderer = new Renderer({ 
            alpha: true, 
            dpr: Math.min(window.devicePixelRatio, 2),
            antialias: true
        });
        
        this.gl = this.renderer.gl;
        this.gl = this.renderer.gl;
        
        if (this.renderer.canvas) {
            this.renderer.canvas.classList.add('liquid-canvas');
            Object.assign(this.renderer.canvas.style, {
                position: 'absolute',
                inset: '0',
                width: '100%',
                height: '100%',
                zIndex: '1',
                pointerEvents: 'none'
            });
        }
        
        this.container.appendChild(this.renderer.canvas);
    }

    createCamera() {
        this.camera = new Camera(this.gl);
        this.camera.position.z = 5;
    }

    createScene() {
        const texture = new Texture(this.gl, {
            image: this.img,
            generateMipmaps: false,
        });

        // Optimized segments for rock-solid 60fps on mobile
        const geometry = new Plane(this.gl, { widthSegments: 48, heightSegments: 48 });

        const vertex = /* glsl */ `
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float uTime;
            uniform float uVelo;
            uniform vec2 uMouse;
            varying vec2 vUv;

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Subtle organic wave based on time and global velocity
                float wave = sin(pos.x * 2.0 + uTime * 2.0) * cos(pos.y * 2.0 + uTime * 1.5) * 0.04 * uVelo;
                pos.z += wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const fragment = /* glsl */ `
            precision highp float;
            uniform sampler2D tMap;
            uniform vec2 uMouse;
            uniform float uVelo;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform vec2 uImageResolution;
            varying vec2 vUv;

            vec2 getUV(vec2 uv, vec2 res, vec2 imgRes) {
                float screenAspect = res.x / res.y;
                float imageAspect = imgRes.x / imgRes.y;
                vec2 ratio = vec2(
                    min(screenAspect / imageAspect, 1.0),
                    min(imageAspect / screenAspect, 1.0)
                );
                return uv * ratio + (1.0 - ratio) * 0.5;
            }

            void main() {
                vec2 uv = vUv;
                vec2 correctedUv = getUV(uv, uResolution, uImageResolution);
                
                vec2 mouseDirection = correctedUv - uMouse;
                float dist = length(mouseDirection);
                
                float radius = 0.45;
                float strength = smoothstep(radius, 0.0, dist);
                
                vec2 distortion = mouseDirection * strength * uVelo * 1.5;
                
                // Final UV with clamping to avoid black edge artifacts
                vec2 targetUv = correctedUv + distortion;
                
                // Slight offset for chromatic aberration
                float r = texture2D(tMap, clamp(targetUv + distortion * 0.05, 0.0, 1.0)).r;
                float g = texture2D(tMap, clamp(targetUv, 0.0, 1.0)).g;
                float b = texture2D(tMap, clamp(targetUv - distortion * 0.05, 0.0, 1.0)).b;
                
                vec3 color = vec3(r, g, b);
                
                // [NEXUS CONFIG] Industrial Noir Tint (#0a1f3a)
                vec3 tintColor = vec3(0.039, 0.122, 0.227); // #0a1f3a converted to 0-1
                color = mix(color, tintColor, 0.1 * strength); // Adaptive tint
                
                float noise = fract(sin(dot(correctedUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.015;
                
                // Progressive Vignette Bloom (UX Enhancement)
                float vignette = smoothstep(radius * 1.2, radius, dist);
                color *= mix(1.0, 1.15, vignette * uVelo); // Bloom on movement
                
                // Subtle edge mask
                float edgeMask = smoothstep(0.0, 0.05, uv.x) * smoothstep(1.0, 0.95, uv.x) *
                                smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
                
                gl_FragColor = vec4((color + noise) * edgeMask, edgeMask);
            }
        `;

        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tMap: { value: texture },
                uMouse: { value: this.mouse },
                uVelo: { value: 0 },
                uTime: { value: 0 },
                uResolution: { value: new Vec2() },
                uImageResolution: { value: new Vec2(this.img.naturalWidth, this.img.naturalHeight) },
            },
            transparent: true
        });

        this.mesh = new Mesh(this.gl, { geometry, program: this.program });
        this.renderer.canvas.style.willChange = 'opacity, transform';
    }

    addEventListeners() {
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onMouseMove(e) {
        const x = e.clientX / window.innerWidth;
        const y = 1.0 - (e.clientY / window.innerHeight);
        
        const velX = Math.abs(x - this.lastMouse.x);
        const velY = Math.abs(y - this.lastMouse.y);
        
        // Multiplier for punchier distortion
        this.targetVelo = Math.min((velX + velY) * 2.0, 0.8);
        this.mouse.set(x, y);
        this.lastMouse.set(x, y);
    }

    onResize() {
        const { width, height } = this.container.getBoundingClientRect();
        this.renderer.setSize(width, height);
        
        if (this.program) {
            this.program.uniforms.uResolution.value.set(width, height);
        }
        
        const fov = 45 * (Math.PI / 180);
        const visibleHeight = 2 * Math.tan(fov / 2) * this.camera.position.z;
        const visibleWidth = visibleHeight * (width / height);
        this.mesh.scale.set(visibleWidth, visibleHeight, 1);
    }

    update(t) {
        requestAnimationFrame(this.update.bind(this));
        
        if (this.program) {
            this.program.uniforms.uTime.value = t * 0.001;
            
            this.currentVelo += (this.targetVelo - this.currentVelo) * 0.06;
            this.program.uniforms.uVelo.value = this.currentVelo;
            
            this.program.uniforms.uMouse.value.lerp(this.mouse, 0.12);
            
            this.targetVelo *= 0.96;
        }
        
        this.renderer.render({ scene: this.mesh, camera: this.camera });
    }
}

// Auto-start
new LiquidDistortion();


