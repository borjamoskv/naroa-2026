# Kimi 2.5 CLI — WebGL Task Spec for Naroa 2026

## Objetivo

Implementar efectos WebGL/shader para el portafolio de Naroa Gutiérrez Gil, siguiendo la estética "Piel Bajo Carboncillo".

## Tareas para Kimi

### 1. Shader de Carboncillo (Charcoal Effect)
- Efecto de textura carboncillo sobre las imágenes al hover
- Parámetros: intensidad, grain size, contrast
- Target: `js/systems/charcoal-shader.js`

### 2. Mica Reactive
- Efecto de shimmer/brillo mineral que reacciona al cursor
- Similar a mica natural bajo luz indirecta
- Target: `js/systems/mica-reactive.js`

### 3. Parallax Texture Layer
- Capa de textura de papel escanneado con parallax sutil
- Profundidad: 5-10px máximo
- Target: `js/systems/paper-parallax.js`

### 4. Cursor Trail (Pigment)
- Rastro de "pigmento" que sigue al cursor
- Colores: tonos tierra, ocres, sienas
- Target: `js/systems/pigment-trail.js`

## Contexto

```
Proyecto: /Users/borjafernandezangulo/game/naroa-2026
Assets: /Users/borjafernandezangulo/game/naroa-assets-master
Stack: Vanilla JS, no build tools
```

## Comando Sugerido

```bash
kimi --task "Implementar charcoal-shader.js para Naroa 2026" \
     --context "/game/naroa-2026/js/systems/" \
     --reference "/game/.agent/skills/wow-effects-2026/SKILL.md"
```

## Criterios de Aceptación

- [ ] WebGL fallback graceful a CSS
- [ ] Performance: 60fps en Chrome/Safari
- [ ] Mobile: efectos reducidos o desactivados
- [ ] No dependencias externas (Three.js opcional)
