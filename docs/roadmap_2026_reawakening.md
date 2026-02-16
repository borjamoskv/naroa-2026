# NAROA 2026: THE REAWAKENING (Hoja de Ruta Estratégica)

> **"El problema como trampolín."** — Naroa Gutiérrez Gil

Basado en el análisis profundo del código (`mica-brain.js`, `game-gateway.js`, `infinite-canvas-360.js`) y la identidad consolidada "Artivista" (Bilbao/Sopela), propongo esta hoja de ruta para elevar `naroa.online` de una "web estática premium" a un **Ecosistema Vivo**.

---

## FASE 1: LA VERDAD (FOUNDATION) — ✅ COMPLETADA

*Objetivo: Que el código y la documentación reflejen la realidad.*

- [x] **Auditoría de Features:** Catálogo real de lo que existe vs. lo que es aspiracional.
- [x] **Deep Zoom:** Fix en `gallery.js` para detectar naming `*-hq-*.webp`.
- [x] **Master Source:** `notebooklm-source.md` v7.1.0 es ahora la fuente de verdad absoluta para alimentar IAs.
- [x] **Corrección Identitaria:** Fecha de nacimiento (1978) ajustada.

---

## FASE 2: CONEXIÓN VIVA (SOCIAL LAYER)

*Objetivo: Romper la cuarta pared digital. Que se note que hay una humana detrás.*

### 2.1. "Lataska" en Tiempo Real

- **Problema:** El `blog-engine.js` es estático (mock).
- **Propuesta:** Conectar una **Google Sheet** como CMS "low-code" para que Naroa pueda subir noticias del mercado de Sopela o Harilka sin tocar código.
- **Tech:** `sheet-db` -> `blog-engine.js`.

### 2.2. La Red Sorora (Harilka)

- **Propuesta:** Crear una sección visible "Comunidad" (no solo en texto oculto) donde se listen los proyectos de sus compañeras (Ainara, Sandra, Celia...).
- **Impacto:** Refuerza la identidad de "Artivista".

---

## FASE 3: DESPERTAR A MICA (INTELLIGENCE)

*Objetivo: Convertir el Mock en Mente.*

### 3.1. Cerebro Real (Gemini 2.5 Integration)

- **Estado Actual:** `mica-brain.js` tiene lógica simple y respuestas hardcoced.
- **Propuesta:** Implementar **Vercel AI SDK** en una Serverless Function.
- **Flujo:**
  1. User input -> `mica-brain.js`
  2. Serverless Call -> Gemini 2.5 Flash (System Prompt: `alma.md`)
  3. Contexto: Inyectar últimas 3 obras vistas.
  4. Respuesta Streaming -> UI.

### 3.2. Memoria de Elefante

- **Propuesta:** Evolucionar `mica-memory.js` de `localStorage` a una base de datos real (KV o Edge Config) para que MICA recuerde al usuario entre dispositivos si hay login (o fingerprinting ético).

---

## FASE 4: EL PATIO DE RECREO (IMMERSIVE)

*Objetivo: "Volver a jugar para volver a ser".*

### 4.1. Arcade Gateway (Activación)

- **Hallazgo:** Hay 27 juegos en `game-gateway.js` pero solo 9 en HTML.
- **Propuesta:** Crear un **"Arcade SOTY"** (Grid inmersivo) que revele los juegos ocultos (Snake Kintsugi, Tetris de Pizarra...).

### 4.2. Multiplayer Canvas

- **Propuesta:** Ver cursores de otros visitantes en `infinite-canvas-360.js` como "luciérnagas" (Partículas doradas). Sentir que no estás solo en la galería.

---

## ACCIONES INMEDIATAS (Siguientes 24h)

1. **Deploy de Correcciones:** Subir arreglos de `gallery.js` y textos.
2. **MICA Proto-Link:** Configurar una API Key de Gemini para probar `mica-brain.js` con inteligencia real (aunque sea en local).
3. **Visual Polish:** Revisar que los títulos "Kinetic" funcionen en móvil.

> *"No vamos a tapar las grietas del código antiguo, las vamos a dorar con IA nueva."*
