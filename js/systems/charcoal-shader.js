/**
 * CHARCOAL SHADER SYSTEM (Sovereign Implementation)
 * Renders a dynamic charcoal/paper texture effect using WebGL2.
 * Defines the "Industrial Noir" aesthetic through procedural noise.
 */
export class CharcoalShader {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.uniforms = {};
        this.time = 0;
        
        // Configuration
        this.config = {
            grainScale: 2.0,
            roughness: 0.8,
            contrast: 1.2,
            speed: 0.1
        };

        this.init();
    }

    init() {
        const vs = `#version 300 es
            in vec2 position;
            in vec2 uv;
            out vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fs = `#version 300 es
            precision highp float;
            
            in vec2 vUv;
            uniform float uTime;
            uniform float uGrainScale;
            uniform float uRoughness;
            uniform float uContrast;
            uniform vec2 uResolution;
            
            out vec4 fragColor;

            // Simplex 2D noise
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = vUv * uGrainScale;
                
                // Animated noise layers
                float n1 = snoise(uv + uTime * 0.1);
                float n2 = snoise(uv * 2.0 - uTime * 0.15);
                float n3 = snoise(uv * 4.0 + uTime * 0.05);
                
                // Mix for paper texture
                float noise = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
                
                // Contrast and roughness curve
                float texture = smoothstep(0.5 - uRoughness * 0.5, 0.5 + uRoughness * 0.5, 0.5 + noise * 0.5);
                texture = pow(texture, uContrast);
                
                // Charcoal color (Industrial Noir Black to Grey)
                vec3 color = mix(vec3(0.05, 0.05, 0.05), vec3(0.2, 0.2, 0.2), texture);
                
                // Vignette
                float dist = length(vUv - 0.5);
                float vignette = smoothstep(0.8, 0.2, dist);
                color *= vignette;

                fragColor = vec4(color, 1.0);
            }
        `;

        this.program = this.createProgram(vs, fs);
        this.uniforms = {
            uTime: this.gl.getUniformLocation(this.program, 'uTime'),
            uGrainScale: this.gl.getUniformLocation(this.program, 'uGrainScale'),
            uRoughness: this.gl.getUniformLocation(this.program, 'uRoughness'),
            uContrast: this.gl.getUniformLocation(this.program, 'uContrast'),
            uResolution: this.gl.getUniformLocation(this.program, 'uResolution')
        };
    }

    createProgram(vsSource, fsSource) {
        const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vs, vsSource);
        this.gl.compileShader(vs);
        
        if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
            console.error('Vertex Shader Error:', this.gl.getShaderInfoLog(vs));
            return null;
        }

        const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fs, fsSource);
        this.gl.compileShader(fs);

        if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
            console.error('Fragment Shader Error:', this.gl.getShaderInfoLog(fs));
            return null;
        }

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program Link Error:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    render(dt) {
        if (!this.program) return;

        this.time += dt * this.config.speed;
        this.gl.useProgram(this.program);
        
        this.gl.uniform1f(this.uniforms.uTime, this.time);
        this.gl.uniform1f(this.uniforms.uGrainScale, this.config.grainScale);
        this.gl.uniform1f(this.uniforms.uRoughness, this.config.roughness);
        this.gl.uniform1f(this.uniforms.uContrast, this.config.contrast);
        this.gl.uniform2f(this.uniforms.uResolution, this.gl.canvas.width, this.gl.canvas.height);
        
        // Expected to be drawn as a fullscreen quad (handled by renderer)
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}
