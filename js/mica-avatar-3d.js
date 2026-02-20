/**
 * MICA AVATAR 3D - Three.js Interactive Avatar
 * Avatar procedural que reacciona a voz y mouse con materia dorada
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

class MicaAvatar {
    constructor(containerId = 'avatar-container') {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.container = document.getElementById(containerId);
        if (!this.container) {
            Logger.error('Container not found:', containerId);
            return;
        }
        
        this.renderer.setSize(400, 400);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        this.mouse = { x: 0, y: 0 };
        this.habla = false;
        this.tiempo = 0;
        
        this.crearMica();
        this.eventos();
        this.animar();
    }
    
    crearMica() {
        // Grupo principal
        this.mica = new THREE.Group();
        
        // Núcleo esférico (cara abstracta)
        const geometriaNucleo = new THREE.IcosahedronGeometry(1, 4);
        const materialNucleo = new THREE.MeshPhysicalMaterial({
            color: 0xFFD700,
            metalness: 0.1,
            roughness: 0.2,
            transmission: 0.6,
            thickness: 0.5,
            emissive: 0xFFA500,
            emissiveIntensity: 0.2,
            clearcoat: 1.0
        });
        this.nucleo = new THREE.Mesh(geometriaNucleo, materialNucleo);
        this.mica.add(this.nucleo);
        
        // Ojos (partículas brillantes)
        const geometriaOjo = new THREE.SphereGeometry(0.12, 32, 32);
        const materialOjo = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFD700,
            emissiveIntensity: 2
        });
        
        this.ojoIzq = new THREE.Mesh(geometriaOjo, materialOjo);
        this.ojoIzq.position.set(-0.3, 0.1, 0.85);
        this.mica.add(this.ojoIzq);
        
        this.ojoDer = new THREE.Mesh(geometriaOjo, materialOjo);
        this.ojoDer.position.set(0.3, 0.1, 0.85);
        this.mica.add(this.ojoDer);
        
        // "Aura" de partículas doradas orbitando
        const particulasGeo = new THREE.BufferGeometry();
        const count = 200;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for(let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.5 + Math.random() * 0.5;
            
            positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i*3+2] = r * Math.cos(phi);
            sizes[i] = Math.random();
        }
        
        particulasGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particulasGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particulasMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xFFD700) }
            },
            vertexShader: `
                uniform float uTime;
                attribute float size;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    float angle = uTime * 0.5;
                    pos.x = position.x * cos(angle) - position.z * sin(angle);
                    pos.z = position.x * sin(angle) + position.z * cos(angle);
                    pos.y += sin(uTime + position.x) * 0.1;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * 15.0 * (1.0 / -mvPosition.z);
                    vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + size * 10.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    float glow = 1.0 - (r * 2.0);
                    gl_FragColor = vec4(uColor, vAlpha * glow);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.aura = new THREE.Points(particulasGeo, particulasMat);
        this.mica.add(this.aura);
        
        this.scene.add(this.mica);
        this.camera.position.z = 4;
        
        // Iluminación
        const luz1 = new THREE.PointLight(0xFFD700, 1, 10);
        luz1.position.set(2, 2, 2);
        this.scene.add(luz1);
        
        const luz2 = new THREE.PointLight(0xFF69B4, 0.5, 10);
        luz2.position.set(-2, -2, 2);
        this.scene.add(luz2);
    }
    
    eventos() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Escuchar eventos de MICA
        document.addEventListener('mica-habla', () => this.activarHabla());
        
        // Integración con emotion engine
        window.addEventListener('mica-mood-change', (e) => {
            this.actualizarMood(e.detail.mood);
        });
    }
    
    actualizarMood(mood) {
        // Cambiar color del aura según mood
        const colores = {
            'ENERGETIC': 0x00FF88,
            'TIRED': 0x8B8BFF,
            'GRUMPY': 0xFF4444,
            'PLAYFUL': 0xFF69B4,
            'SOUL': 0xFFD700,
            'NEUTRAL': 0xFFD700
        };
        
        const color = colores[mood] || 0xFFD700;
        this.aura.material.uniforms.uColor.value.setHex(color);
    }
    
    animar() {
        requestAnimationFrame(() => this.animar());
        
        this.tiempo += 0.01;
        
        // Movimiento suave según mouse (mirada)
        this.mica.rotation.y += (this.mouse.x * 0.5 - this.mica.rotation.y) * 0.05;
        this.mica.rotation.x += (this.mouse.y * 0.3 - this.mica.rotation.x) * 0.05;
        
        // Efecto de "respiración"
        const respiracion = 1 + Math.sin(this.tiempo * 2) * 0.02;
        this.nucleo.scale.set(respiracion, respiracion, respiracion);
        
        // Cuando habla: vibración y escala
        if(this.habla) {
            const vibracion = Math.sin(this.tiempo * 20) * 0.02;
            this.nucleo.scale.set(
                1.1 + vibracion, 
                1.1 + vibracion, 
                1.1 + vibracion
            );
            this.ojoIzq.scale.setScalar(1.2);
            this.ojoDer.scale.setScalar(1.2);
        } else {
            this.ojoIzq.scale.setScalar(1);
            this.ojoDer.scale.setScalar(1);
        }
        
        // Actualizar shader del aura
        this.aura.material.uniforms.uTime.value = this.tiempo;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Método público para activar desde el chat
    activarHabla() {
        this.habla = true;
        setTimeout(() => this.habla = false, 3000);
    }
    
    destroy() {
        cancelAnimationFrame(this.animationId);
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}

// Auto-inicializar si existe el container
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('avatar-container')) {
            window.micaAvatar = new MicaAvatar();
        }
    });
}

export default MicaAvatar;
