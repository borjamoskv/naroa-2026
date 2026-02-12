/**
 * MICA HEART - 3D Organic Heart of the Site
 * Tech: Three.js + Custom Shaders
 * Effects: Kintsugi gold cracks, mica procedural texture, audio-reactive pulse.
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.145.0';

class MicaHeart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });

        this.mesh = null;
        this.material = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    async init() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 2.5;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffd700, 2);
        pointLight.position.set(2, 3, 4);
        this.scene.add(pointLight);

        // Heart Geometry (using a deformed sphere for organic feel)
        const geometry = new THREE.IcosahedronGeometry(1, 64);

        // Custom Shader Material for Mica/Kintsugi effect
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uAudioEnergy: { value: 0 },
                uColorMica: { value: new THREE.Color('#1a1a1a') },
                uColorGold: { value: new THREE.Color('#ffd700') }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                uniform float uTime;
                uniform float uAudioEnergy;

                // Simple simplex noise like function
                float hash(float n) { return fract(sin(n) * 43758.5453123); }
                
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    
                    // Displacement for organic pulse
                    float pulse = sin(uTime * 2.0) * 0.05 + uAudioEnergy * 0.2;
                    vec3 newPosition = position + normal * pulse;
                    
                    // Add subtle noise wobble
                    newPosition.x += sin(newPosition.y * 5.0 + uTime) * 0.02;
                    
                    vPosition = newPosition;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                uniform float uTime;
                uniform float uAudioEnergy;
                uniform vec3 uColorMica;
                uniform vec3 uColorGold;

                void main() {
                    // Calculate "cracks" for kintsugi effect
                    float cracks = sin(vPosition.x * 20.0 + uTime * 0.5) * 
                                  cos(vPosition.y * 15.0 - uTime * 0.3) * 
                                  sin(vPosition.z * 10.0);
                    
                    float threshold = 0.85 - uAudioEnergy * 0.1;
                    float crackMask = smoothstep(threshold, threshold + 0.02, cracks);
                    
                    // Base mica color + gold highlights in cracks
                    vec3 finalColor = mix(uColorMica, uColorGold, crackMask);
                    
                    // Add Fresnel effect
                    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    finalColor += uColorGold * fresnel * 0.5;
                    
                    // Add metallic sparkle based on time
                    float sparkle = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
                    if (sparkle > 0.98) finalColor += 0.4;

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);

        // Handle Resize
        window.addEventListener('resize', () => this.onResize());

        // Listen to audio beats
        window.addEventListener('audiobeat', (e) => {
            if (this.material) {
                // Temporary boost on beat
                this.material.uniforms.uAudioEnergy.value = e.detail.energy.average * 2;
            }
        });

        this.animate();
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();
        
        if (this.material) {
            this.material.uniforms.uTime.value = elapsedTime;
            
            // Decay audio energy
            this.material.uniforms.uAudioEnergy.value *= 0.95;
            
            // Sync with global CSS if available
            const globalEnergy = parseFloat(document.documentElement.style.getPropertyValue('--audio-energy')) || 0;
            if (globalEnergy > 0) {
                this.material.uniforms.uAudioEnergy.value = Math.max(
                    this.material.uniforms.uAudioEnergy.value,
                    globalEnergy * 0.5
                );
            }
        }

        if (this.mesh) {
            this.mesh.rotation.y = elapsedTime * 0.15;
            this.mesh.rotation.z = elapsedTime * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

export const micaHeart = {
    init: (containerId) => new MicaHeart(containerId)
};

export default micaHeart;
