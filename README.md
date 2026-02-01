# Naroa Gutiérrez Gil — Portfolio 2026

Portafolio artístico vanilla SPA para [naroa.online](https://naroa.online).

## Stack

- **HTML5** semántico
- **CSS** modular con variables (design tokens)
- **JavaScript** vanilla (ES6+, hash-based routing)
- **Vercel** para deploy

## Estructura

```
naroa-2026/
├── index.html              # Entry point
├── css/
│   ├── reset.css           # CSS reset
│   ├── variables.css       # Design tokens
│   ├── base.css            # Typography, body
│   ├── layout.css          # Views, hero, containers
│   ├── components.css      # Nav, buttons, cards
│   ├── gallery.css         # Gallery grid, lightbox
│   └── animations.css      # Keyframes, utilities
├── js/
│   ├── core/
│   │   ├── router.js       # Hash-based SPA routing
│   │   └── app.js          # Bootstrap, initialization
│   ├── features/
│   │   ├── gallery.js      # Image grid, lazy loading
│   │   └── lightbox.js     # Fullscreen viewer
│   └── systems/            # Ritual effects (WebGL, shaders)
├── images/
│   ├── artworks/           # Optimized WebP images
│   └── thumbnails/         # 400px thumbnails
├── assets/
│   ├── fonts/
│   └── textures/
└── scripts/                # Build utilities
```

## Comandos

```bash
# Servidor local
python3 -m http.server 8889

# Deploy
git push origin main  # Auto-deploy Vercel
```

## Rutas

| Ruta | Vista |
|------|-------|
| `#/` | Home |
| `#/portfolio` | Portfolio curado |
| `#/galeria` | Galería completa |
| `#/about` | Sobre la artista |
| `#/contacto` | Contacto |

## Filosofía

1. **Performance First** — 0 frameworks, HTML/CSS/JS puro
2. **Dark Aesthetic** — Paleta "Piel Bajo Carboncillo"
3. **Ceremonial UX** — Lazy loading contemplativo
4. **Accessibility** — WCAG 2.1 AA compliant

## Próximos pasos

- [ ] Integrar 237 assets desde `naroa-assets-master/`
- [ ] WebGL shaders (delegado a Kimi 2.5 CLI)
- [ ] PWA manifest
- [ ] SEO meta tags
