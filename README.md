# Naroa 2026 - Portafolio Estático

> 🎨 Portafolio digital de Naroa Gutiérrez Gil | Artista Visual | Bilbao

## 🚀 Despliegue

Desplegado automáticamente en [Vercel](https://vercel.com) con cada push a `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/D0mainsale/naroa-2026)

## 📁 Estructura del Proyecto

```
naroa-2026/
├── css/                   # Estilos modulares (Sistema Stitch)
│   ├── variables.css      # Design Tokens (YInMn)
│   ├── typography-2026.css # Tipografía Satoshi + Switzer
│   ├── soty-effects.css   # Efectos Premium
│   └── wow-effects.css    # Interacciones de Alto Impacto
├── js/
│   ├── core/              # Router, App Core
│   ├── features/          # Galería, Lightbox
│   └── effects/           # Efectos Cinéticos, Magnéticos, Cursor
├── images/artworks/       # 64 obras optimizadas (.webp)
├── data/                  # JSON de obras y taxonomía
└── index.html             # Punto de entrada SPA
```

## ⚡ Rendimiento (Soberanía de Velocidad)

| Métrica | Objetivo | Estrategia |
|---------|----------|------------|
| LCP | < 2.5s | WebP optimizados, carga perezosa (lazy loading) |
| FID | < 100ms | JS modular, scripts diferidos |
| CLS | < 0.1 | Ratios de aspecto definidos explícitamente |
| Cache | 1 año | Activos inmutables con hash |

## 🎨 Tipografía 2026

- **Display:** Switzer (Fontshare)
- **Cuerpo:** Satoshi (Fontshare)
- **Fallback:** system-ui, sans-serif

## 🔧 Desarrollo Local

```bash
# Servidor local con Node
npx serve .

# O alternativa con Python
python3 -m http.server 8000
```

## 📦 Despliegue Manual

```bash
# Con Vercel CLI
npx vercel --prod
```

---

**© 2026 Naroa Gutiérrez Gil** | [naroa.online](https://naroa.online)
