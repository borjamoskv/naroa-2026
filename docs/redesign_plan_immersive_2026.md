---
title: Naroa Immersive Experience 2026 (Mica Beach Redesign)
type: implementation_plan
status: pending_user_review
created: 2026-02-02
---

# 🌊 Naroa Immersive Experience 2026 (Mica Beach)

**Objetivo**: Rediseñar `naroa.online` como una experiencia web inmersiva de vanguardia (Feb 2026), basada en "scrollytelling" dimensional, estética "Mica Beach" minimalista y ausencia casi total de texto convencional, reemplazado por palíndromos y quiasmos estructurales.

## 1. Filosofía de Diseño: "Mica Beach" 🏖️
*   **Visual**: Tonos arena (#fdfcf8, #f2efe9), texturas orgánicas (grano de película, mica), luz natural difusa.
*   **Interacción**: Física, táctil, líquida. Scroll 100% inmersivo (Snap).
*   **Contenido**: "Sin letras". La narrativa es visual y sonora. Texto limitado a títulos escultóricos (palíndromos).
*   **Factor WOW**: Sorpresas continuas cada X segundos o pixels de scroll.

## 2. Arquitectura de Navegación (Multidimensional)
El sitio se comporta como una "cinta de Moebius" o un viaje continuo.

*   **Eje Y (Vertical)**: Transición entre mundos (Home -> Galería -> Concepto -> Contacto). Scroll Snap 100%.
*   **Eje X (Horizontal)**: Exploración de contenido dentro de los mundos (Galería infinita).

### Estructura de Vistas (Slides)

| Vista | Concepto | Interacción WOW | Palíndromo Clave |
| :--- | :--- | :--- | :--- |
| **1. HERO** | *La Orilla* | Viento digital afecta al texto. Cursor deja huellas en la "arena". | **ANARO·ARAN** |
| **2. GALERÍA** | *El Océano* | Scroll horizontal líquido (WebGL distorsión). Las obras flotan. | **O·M·O** (Obra Maestra Obra) |
| **3. JUEGOS** | *El Espejo* | Reflejos en tiempo real. Interacción física con burbujas de juegos. | **S·O·L·O·S** |
| **4. FINAL** | *El Eco* | Audio-reactivo (Lo Inmanente). Glitch estético al final del scroll. | **A·CIF·I·C·A** (Pacifica) |

## 3. Plan de Implementación Técnica

### Fase 1: Core Inmersivo (`css/layout.css`)
- [x] Implementar `scroll-snap-type: y mandatory` en `html`. (Iniciado)
- [ ] Configurar secciones `.view` con `min-height: 100vh` y `scroll-snap-align: start`.
- [ ] Eliminar barras de scroll visibles (pero mantener funcionalidad).
- [ ] Implementar navegación por teclado y gestos touch avanzados.

### Fase 2: Estética Mica Beach (`css/mica-beach.css`)
- [ ] Definir paleta "Beach" sutil: Arena, Hueso, Oro, Azul Profundo.
- [ ] Crear efectos de "grano de arena" y "brillo de mica" con CSS/SVG filters.
- [ ] Reemplazar tipografía estándar por fuentes display gigantes (variable weight).

### Fase 3: Interacciones WOW (`js/wow-engine.js`)
- [ ] **Cursor Líquido**: Estela de distorsión (SVG filters) + partículas de oro.
- [ ] **Texto Cinético**: Los palíndromos reaccionan al movimiento del ratón/scroll (repulsión magnética).
- [ ] **Morphing**: Transiciones suaves entre secciones (no corte seco).
- [ ] **Spotify Stealth**: El player aparece solo si el usuario "bucea" (hover en zona inferior).

### Fase 4: "Sin Letras" & Palíndromos
- [ ] Auditar y eliminar el 90% del texto actual.
- [ ] Convertir menús en glifos o zonas interactivas invisibles.
- [ ] Integrar palíndromos gigantes como elementos arquitectónicos de fondo.

## 4. Sorpresas Programadas (The "Continuous WOW")
Un motor de eventos aleatorios (`wow-scheduler.js`) que inyecta sorpresas:
1.  **Solar Flare**: Destello dorado en la pantalla (cada 60s).
2.  **Tide**: El agua (overlay azul sutil) sube y baja.
3.  **Glitch**: Breve distorsión de la realidad (guiño a "Matrix" pero orgánico).

## 5. Next Steps
1.  Aprobar este plan.
2.  Ejecutar el CSS de "Mica Beach" (Fase 1 y 2).
3.  Limpiar el HTML de texto innecesario.
4.  Implementar el `wow-engine.js`.
