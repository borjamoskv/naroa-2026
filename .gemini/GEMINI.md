
# Reglas del Repositorio: Naroa-2026 (Español)

Este proyecto está gobernado por la regla de **Soberanía Lingüística**.

## 1. Idioma Mandatorio: ESPAÑOL
- Todos los commits deben estar en español.
- Toda la documentación debe estar en español.
- Los comentarios en el código deben estar en español.
- Las variables y funciones pueden mantenerse en inglés por estándar técnico, pero su documentación explicativa será en español.

## 2. Tono: SOBERANO
- No pidas perdón.
- No uses relleno ("Espero que esto ayude").
- Directo al grano.
- Estética Industrial Noir en el código (limpio, oscuro, potente).

## 3. Auto-Persistencia CORTEX (OBLIGATORIO)

Al final de cada sesión productiva, el agente DEBE ejecutar `cortex store` automáticamente para persistir:
- **Decisiones** tomadas durante la sesión (`--type decision`)
- **Errores** encontrados y resueltos (`--type error`)
- **Ghosts** — trabajo que quedó incompleto (`--type ghost`)

NO esperar a que el usuario lo pida. Si hubo trabajo, hay persistencia.

Comando base:
```bash
cd ~/cortex && .venv/bin/python -m cortex.cli store --type TYPE PROYECTO "CONTENIDO"
```

---
*Regla inyectada por CORTEX v4.2*
