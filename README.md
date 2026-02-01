# Naroa 2026 - Static Portfolio

> 🎨 Portafolio digital de Naroa Gutiérrez Gil | Artista Visual | Bilbao

## 🚀 Deploy

Desplegado automáticamente en [Vercel](https://vercel.com) cada push a `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/D0mainsale/naroa-2026)

## 📁 Estructura

```
naroa-2026/
├── css/                   # Estilos modulares
│   ├── variables.css      # Custom properties
│   ├── typography-2026.css # Satoshi + Switzer
│   ├── soty-effects.css   # Efectos premium
│   └── wow-effects.css    # Interacciones WOW
├── js/
│   ├── core/              # Router, App
│   ├── features/          # Gallery, Lightbox
│   └── effects/           # Kinetic, Magnetic, Cursor
├── images/artworks/       # 64 obras optimizadas (.webp)
├── data/                  # JSON de obras y taxonomía
└── index.html             # SPA entry point
```

## ⚡ Performance

| Métrica | Objetivo | Estrategia |
|---------|----------|------------|
| LCP | < 2.5s | WebP optimizados, lazy loading |
| FID | < 100ms | JS modular, defer scripts |
| CLS | < 0.1 | Aspect ratios definidos |
| Cache | 1 año | Immutable assets con hash |

## 🎨 Tipografía 2026

- **Display:** Switzer (Fontshare)
- **Body:** Satoshi (Fontshare)
- **Fallback:** system-ui, sans-serif

## 🔧 Desarrollo Local

```bash
# Servidor local
npx serve .

# O con Python
python3 -m http.server 8000
```

## 📦 Deploy Manual

```bash
# Con Vercel CLI
npx vercel --prod
```

---

**© 2026 Naroa Gutiérrez Gil** | [naroa.online](https://naroa.online)
