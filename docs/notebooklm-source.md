# Naroa Gutiérrez Gil - Portafolio Digital 2026

> Documentación técnica y artística para NotebookLM

## 🎨 Identidad Artística

**Naroa Gutiérrez Gil** es una artista visual afincada en Bilbao, especializada en:
- Retratos hiperrealistas con estilo pop art
- Murales de gran formato
- Ilustración editorial
- Obra gráfica personalizada

### Filosofía: "Renacimiento Táctil"

La web busca transmitir la **materialidad del arte físico** en formato digital:
- Texturas de papel escaneado a 8K
- Efecto MICA que simula reflejos minerales
- Paleta dual: Luz (Cloud Dancer) / Tiniebla (Carbón Profundo)

---

## 🏛️ Arquitectura Técnica

### Stack
- **Frontend:** Vanilla JS SPA (sin frameworks)
- **Hosting:** Vercel (auto-deploy desde GitHub)
- **Fuentes:** Fontshare (Satoshi body + Switzer display)
- **Imágenes:** WebP optimizado, lazy loading

### Estructura de Archivos

```
naroa-2026/
├── index.html          # SPA entry point
├── css/
│   ├── variables.css   # Design tokens
│   ├── typography-2026.css
│   ├── soty-effects.css
│   └── wow-effects.css
├── js/
│   ├── core/
│   │   ├── router.js   # Hash-based SPA routing
│   │   └── app.js      # Main initialization
│   ├── features/
│   │   ├── gallery.js  # Masonry grid + filters
│   │   └── lightbox.js
│   └── effects/
│       ├── kinetic-text.js
│       ├── magnetic-button.js
│       └── cursor-trail.js
├── images/artworks/    # 64 obras en .webp
└── data/
    └── artworks.json   # Catálogo completo
```

---

## 🖼️ Catálogo de Obras (64 piezas)

### Series Principales

| Serie | Obras | Descripción |
|-------|-------|-------------|
| **Rocks** | 15 | Iconos rock en estilo pop art (Amy, Johnny, Marilyn, James Dean) |
| **En.lata.das** | 8 | Retratos en latas de conserva |
| **Golden/Lágrimas** | 4 | Oro y pan de oro, técnica mixta |
| **Tributos Musicales** | 6 | Freddie Mercury, Celia Cruz, La Llorona |
| **Retratos Clásicos** | 10+ | Audrey Hepburn, James Dean, Marilyn |

### Obras Destacadas (Curated 15)

1. `lagrimas-de-oro.webp` - Lágrimas de Oro
2. `baroque-farrokh.webp` - Farrokh Bulsara (Freddie)
3. `amy-rocks.webp` - Amy Winehouse Rocks
4. `johnny-rocks-hq-1.webp` - Johnny Depp Rocks
5. `celia-cruz-asucar.webp` - Celia Cruz Azúcar
6. `marilyn-monroe.webp` - Marilyn Monroe
7. `audrey-hepburn.webp` - Audrey Hepburn
8. `james-dean.webp` - James Dean
9. `amor-en-conserva.webp` - Amor en Conserva
10. `el-gran-dakari.webp` - El Gran Dakari
11. `into-the-wild.webp` - Into the Wild
12. `la-llorona.webp` - La Llorona
13. `blonde-embroidery.webp` - Blonde Embroidery
14. `espejos-del-alma.webp` - Espejos del Alma
15. `me-parto-de-risa.webp` - Me Parto de Risa

---

## 🎭 Secciones de la Web

### 1. Home (/)
- Hero con nombre en tipografía kinética
- CTA "Ver Obra" con efecto magnético
- Fondo con partículas doradas

### 2. Obra Destacada (/destacada)
- Galería curada de 15 piezas
- Grid responsive
- Hover con shimmer dorado

### 3. Archivo (/archivo)
- Catálogo completo (64+ obras)
- Filtros por serie/técnica
- Masonry layout adaptativo

### 4. Sobre mí (/about)
- Bio artística
- Trayectoria y exposiciones
- Press kit descargable

### 5. Contacto (/contacto)
- Email: naroa@naroa.eu
- Formulario de encargos
- Links a redes sociales

---

## ✨ Efectos Visuales (SOTY 2026)

### CSS Effects
- **Gold Shimmer:** Reflejo dorado en hover
- **Glassmorphism:** Backdrop blur premium
- **Film Grain:** Textura analógica sutil
- **Liquid Glass:** Morphing blobs de fondo

### JS Interactions
- **Kinetic Typography:** Letras que reaccionan al cursor
- **Magnetic Buttons:** CTAs que atraen el cursor
- **Cursor Trail:** Estela de partículas doradas
- **Reveal on Scroll:** Aparición escalonada

---

## 🔧 Configuración de Desarrollo

### Servidor local
```bash
cd naroa-2026
npx serve .
# o
python3 -m http.server 8000
```

### Deploy manual
```bash
npx vercel --prod
```

### Variables CSS clave
```css
:root {
  --color-gold: #d4af37;
  --color-cream: #f5f5dc;
  --color-charcoal: #1a1a1a;
  --font-display: 'Switzer', system-ui;
  --font-body: 'Satoshi', system-ui;
}
```

---

## 📊 Performance Targets

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| LCP | < 2.5s | ✓ |
| FID | < 100ms | ✓ |
| CLS | < 0.1 | ✓ |
| Lighthouse | > 90 | En verificación |

---

## 🔗 URLs y Recursos

- **Producción:** https://naroa.online
- **GitHub:** https://github.com/D0mainsale/naroa-2026
- **Vercel Dashboard:** [Acceso interno]

---

*Documento generado para NotebookLM | Feb 2026*
