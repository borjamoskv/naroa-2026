# 🏆 Naroa 2026 — Guía para Ganar Premios Web

## Premios Objetivo

| Premio | Dificultad | Puntuación Mínima |
|--------|------------|-------------------|
| **Awwwards SOTD** | ⭐⭐⭐⭐⭐ | Jury: 8+ |
| **Awwwards Honorable Mention** | ⭐⭐⭐ | Jury: 6.5+ |
| **CSS Design Awards WOTD** | ⭐⭐⭐⭐ | Avg: 8+ |
| **CSS Design Awards Public** | ⭐⭐ | Avg: 6+, 20+ votes |

---

## 📊 Criterios de Evaluación Awwwards

| Criterio | Peso | Estado Actual | Mejoras Necesarias |
|----------|------|---------------|-------------------|
| **Design** | 40% | 🟡 Base | Tipografía premium, grid dinámico |
| **Usability** | 30% | 🟡 Base | Navegación fluida, feedback táctil |
| **Creativity** | 20% | 🟢 Alto | Shaders WebGL, concepto artístico |
| **Content** | 10% | 🟡 Medio | Textos poéticos, storytelling |

---

## 🎯 Requisitos Técnicos para 2025

### Obligatorios ✅
- [ ] **Lighthouse Score 90+** (Performance, Accessibility, SEO)
- [ ] **WCAG 2.2 Compliance** (contraste, teclado, screen reader)
- [ ] **Mobile-first** responsive design
- [ ] **Page Transitions** suaves entre vistas
- [ ] **Smooth Scroll** implementado
- [ ] **Microinteracciones** en todos los elementos interactivos

### Diferenciadores 🚀
- [ ] **WebGL/Shaders** originales
- [ ] **Parallax** sutil
- [ ] **Cursor Effects** personalizados
- [ ] **Staggered Animations** en listas/grid
- [ ] **Loading States** creativos
- [ ] **Easter Eggs** ocultos

### Tendencias 2025 (Awwwards)
- [ ] **Ethical Design** — hosting bajo en carbono
- [ ] **Low-energy Animations** — optimizadas para batería
- [ ] **Transparent AI Integration** — si aplica
- [ ] **Scroll-driven Storytelling** — narrativa con scroll

---

## 🎨 Checklist Visual para Naroa

### Tipografía
- [ ] Font premium (no system fonts)
- [ ] Tamaños grandes en hero (80px+)
- [ ] Jerarquía clara (h1 > h2 > body)
- [ ] Espaciado generoso (line-height 1.5+)

### Color
- [ ] Paleta cohesiva (ya tenemos "Piel Bajo Carboncillo")
- [ ] Modo oscuro como base ✅
- [ ] Acentos de color intencionados
- [ ] Gradientes sutiles (no saturados)

### Layout
- [ ] Grid asimétrico/dinámico
- [ ] Whitespace generoso
- [ ] Ruptura intencional de reglas
- [ ] Full-bleed images

### Imágenes
- [ ] Optimizadas WebP ✅
- [ ] Lazy loading ✅
- [ ] Hover effects únicos
- [ ] Lightbox premium

---

## 🔧 Implementación Específica para Naroa

### 1. Page Transitions (Prioridad Alta)
```javascript
// Añadir en router.js
beforeEach: () => {
  document.body.classList.add('page-transitioning');
},
afterEach: () => {
  setTimeout(() => {
    document.body.classList.remove('page-transitioning');
  }, 500);
}
```

### 2. Cursor Effect (Ya en desarrollo)
- `pigment-trail.js` ✅ Creado
- Activar en producción

### 3. Smooth Scroll
```css
html {
  scroll-behavior: smooth;
}
```

### 4. Staggered Gallery
```css
.gallery__item:nth-child(1) { animation-delay: 0.05s; }
.gallery__item:nth-child(2) { animation-delay: 0.10s; }
/* ... */
```

### 5. Loading State Artístico
- Sketch animado de carboncillo mientras carga

---

## 📝 Contenido Narrativo

### About Section
> "Entre el error y el trazo, entre la espera y la revelación, 
> cada obra es un ritual de transformación."

### Concepto Artístico (para submission)
> "Portfolio digital de Naroa Gutiérrez Gil que reimagina 
> la textura del carboncillo en el espacio web. Cada interacción 
> es un gesto pictórico."

---

## 🚀 Plan de Acción

### Semana 1: Fundamentos
1. Lighthouse audit y fixes
2. Accessibility audit (axe-core)
3. Page transitions
4. Smooth scroll

### Semana 2: Efectos
1. Activar shaders WebGL
2. Cursor trail en producción
3. Parallax paper texture
4. Staggered animations

### Semana 3: Polish
1. Loading states
2. Easter eggs
3. Contenido narrativo
4. Testing cross-browser

### Semana 4: Submission
1. Screenshots de alta calidad
2. Video demo (opcional)
3. Descripción del proyecto
4. Submit a Awwwards + CSSDA

---

## 💰 Costos de Submission

| Premio | Costo | Beneficio |
|--------|-------|-----------|
| Awwwards (Review) | $75 | Feedback del jury |
| Awwwards (Speed) | $149 | Review rápido + feedback |
| CSS Design Awards | Gratis | Visibilidad básica |
| CSS Design Awards (Featured) | $39 | Mayor exposición |

---

## 📚 Referencias

- [Awwwards Scoring System](https://www.awwwards.com/about-the-awards/)
- [CSS Design Awards Criteria](https://www.cssdesignawards.com/about/)
- [Awwwards 2025 Trends](https://www.awwwards.com/blog/)
