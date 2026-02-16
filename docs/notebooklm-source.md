# NAROA GUTIÉRREZ GIL — NotebookLM Master Source v7.1.0

> Última actualización: Feb 16, 2026 | Fuente: IA Alliance Protocol + Codebase Audit (Deep Dive)

---

## 1. PROJECT SOUL & VISUAL LANGUAGE

### 1.1 Identidad: La "Artivista"

**Naroa Gutiérrez Gil** (Bilbao, 1978) — Artivista (Artista + Activista), Artesana Emocional.
**Wikidata ID:** `Q137970281`
**Asociación:** Harilka Elkartea, Bilbao.

**Pilares Creativos:**

- **Cyber-Kintsugi**: Las grietas se doran con neón y luz láser. "El problema como trampolín".
- **Manipulación del Caos**: Inspirada en Cantinflas; el error es método. "SOTY Effects" (scroll-driven chaos).
- **MICA Mineral**: Uso de mica natural en los ojos de los retratos para "perseguir" al espectador con la mirada.
- **El ReCreo**: La reinvención constante a través del juego.

### 1.2 Estética: MICA NOIR (Definitiva)

| Token | Valor | Uso |
| :--- | :--- | :--- |
| **Negro Absoluto** | `#000000` | 95% del canvas. Void. |
| **Verde Láser** | `#00ff41` | Acento técnico, Matrix-feel. |
| **Rojo Sangre** | `#cc0000` | CTAs, pasión, alertas. |
| **Oro Mineral** | `#d4af37` | Kintsugi, lujo, divinidad. |

---

## 2. FEATURE CATALOG (TECHNICAL STATUS)

Análisis profundo del código fuente (`js/features/` & `js/core/`).

### 2.1 MICA Intelligence (The Brain)

> **Status:** Advanced Mock (v1.0) — Architecture Target: Gemini 2.5 Streaming

- **File:** `js/core/mica-brain.js`
- **Capacidades Implementadas:**
  - **Intent Detection:** Router simple para `sales`, `art_expert`, `chat`.
  - **Emotional State:** Variables `mood` (neutral/excited) y `energy` (0-100) que evolucionan con la interacción.
  - **Delegation:** Funciones placeholder para agentes especializados (`delegateToSalesAgent`).
- **Admin Panel:** `js/features/mica-dashboard.js` permite visualizar métricas (User/Bot messages, Satisfaction) y ajustar la personalidad (Tono, Verbosidad).

### 2.2 Immersive Navigation

- **Infinite Canvas 360°:** `js/features/infinite-canvas-360.js`
  - **Status:** Fully Implemented.
  - **Tech:** Parallax de 3 capas (Back/Mid/Front) + Loop matemático infinito + Efecto Niebla (Fog).
  - **Input:** Mouse Drag, Touch, Wheel Zoom.
- **Exhibitions Timeline v2.0:** `js/features/exposiciones-timeline.js`
  - **Status:** WOW Edition.
  - **Tech:** 3D Tilt Cards, Kinney Typography, Partículas en Canvas, Navegación Magnética por años.

### 2.3 Interactive Modules

- **Game Gateway (v3.0):** `js/features/game-gateway.js`
  - **Status:** Logic Implemented.
  - **Config:** 27 Juegos definidos (Snake, Tetris, MICA Viva, Kintsugi...).
  - **Triggers:** Scroll threshold (60%) o Tiempo (45s).
  - **Recommendation:** Sugiere juegos basados en obras vistas (`localStorage`).
- **Blog Engine (v2.0):** `js/features/blog-engine.js`
  - **Status:** Local CMS Mock.
  - **Content:** 3 Posts ("Los Rocks & Mica", "Filosofía Kintsugi", "Invertir en Arte").
  - **Tech:** Markdown rendering simple + Búsqueda por tags.

---

## 3. DATA SCHEMA & ASSETS

### 3.1 Series Artísticas (Taxonomy v4.0)

| Serie | Emoji | Concepto |
| :--- | :--- | :--- |
| **Rocks** | 🤟 | Iconos del rock con ojos de mica. |
| **DiviNos** | ✨ | Figuras divinas humanizadas. |
| **Tributos Musicales** | 🎤 | Homenajes sonoros visuales. |
| **Espejos del Alma** | 🪞 | Retratos psicológicos profundos. |
| **En.lata.das** | 🥫 | Arte en latas de conserva (emociones enlatadas). |

### 3.2 High-Res / Deep Zoom

**Protocolo de Activación:**
OpenSeadragon se activa si el archivo cumple:

1. **Prefijo:** `hq-*` (ej: `hq-amy.webp`)
2. **Sufijo/Infix:** `*-hq-*` (ej: `johnny-rocks-hq-4.webp`)

### 3.3 Obras Destacadas (Inventory Check)

| ID | Archivo | Estado |
| :--- | :--- | :--- |
| `amy-rocks` | `amy-rocks.webp` | ✅ OK |
| `cantinflas-0` | `cantinflas-0.webp` | ✅ OK |
| `johnny-rocks` | `johnny-rocks-hq-4.webp` | ✅ High-Res |
| `multidimensional-love` | `multidimensional-love.webp` | ✅ OK |
| `the-world-is-yours` | — | ❌ MISSING |
| `frida-divina` | — | ❌ MISSING |

### 3.4 Exposiciones (Datos Maestros)

**Total Verificado:** 28 registros (2011–2025).

**Highlights:**

- 2025: *Verhoeven x12* (Online)
- 2025: *DiviNos VaiVenes* (Sopela)
- 2024: *Siarte y El Bosque de Oma* (Bilbao)

---

## 4. SOCIAL & CONNECTIVITY

Datos de contacto oficiales extraídos del código base:

- **Email:** [`naroa@naroa.eu`](mailto:naroa@naroa.eu)
- **Instagram:** [`@naroagutierrezgil`](https://instagram.com/naroagutierrezgil)
- **Facebook:** [Naroa Gutiérrez](https://facebook.com/naroagutierrez) (Albums: Buena Fuente, Marian de Miranda...)
- **Ubicación:** Bilbao, País Vasco.

---

## 5. ARCHITECTURAL STACK

| Capa | Tecnología | Notas |
| :--- | :--- | :--- |
| **Core** | HTML5/JS ES6+ | Sin frameworks, rendimiento puro. |
| **Effects** | Custom WebGL | Shaders propios (`js/webgl/`). |
| **Router** | Hash-Router | SPA ligera (`router.js`). |
| **Data** | JSON + LocalStorage | Persistencia local sin backend complejo. |
| **IA** | MICA v6.0 | Simulation Layer sobre lógica determinista. |

---
*Generado automáticamente por Antigravity Agent para NotebookLM Grounding.*
