---
description: REGLA DE SEGURIDAD — Nunca editar el index.html equivocado en naroa-2026
---

# 🚨 Naroa File Safety Rule

## Contexto Crítico

El proyecto `naroa-2026` tiene **DOS archivos `index.html`**:

| Archivo | Rol | ¿Editar? |
|---------|-----|----------|
| `/index.html` (raíz) | **ENTRY POINT DE VITE** — Este es el archivo activo | ✅ SÍ |
| `/public/index.html` | Versión legacy/vieja — NO es servido por Vite | ❌ NUNCA |

## Regla Absoluta

**SIEMPRE editar `/index.html` en la RAÍZ del proyecto.** NUNCA editar `/public/index.html`.

## Verificación Rápida

Antes de editar cualquier `index.html` en naroa-2026, confirma:
1. El path NO contiene `/public/`
2. El archivo correcto es: `/Users/borjafernandezangulo/game/naroa-2026/index.html`

## Contexto Adicional

- Vite usa el `index.html` de la raíz como entry point
- Los assets estáticos (imágenes, fonts) están en `/public/` y se sirven desde la raíz
- Los CSS están en `/css/` (raíz), NO en `/public/css/`
- Los JS están en `/js/` (raíz), NO en `/public/js/`
