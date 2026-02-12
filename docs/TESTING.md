# 🧪 Protocolo de Pruebas: Naroa 2026

Este documento formaliza el proceso de **Testing con gente que conozca la lógica de negocio** (Error 9), permitiendo que Naroa valide cada actualización.

## 1. Verificación de Lógica de Negocio (Artista)

Antes de cada salida a producción, Naroa debe validar:

### 🖼️ Galería y Catálogo

- [ ] ¿Están todas las obras nuevas en su categoría correcta?
- [ ] ¿Los metadatos (título, año, técnica) coinciden con la obra real?
- [ ] ¿El "Modo Caos" respeta la estética disruptiva acordada?

### 🕹️ Juegos y Experiencias

- [ ] ¿El "Restaurador Desastroso" es suficientemente satírico?
- [ ] ¿MICA responde coherentemente a los prompts artísticos?
- [ ] ¿El sistema de puntuación del Arcade es justo?

## 2. Verificación Técnica Básica (QA)

- [ ] **Rendimiento:** ¿La web carga en menos de 2s en móvil?
- [ ] **Secretos:** ¿Hay alguna API Key visible en la consola?
- [ ] **Observabilidad:** Abrir consola y escribir `NaroaObs.export()`. ¿Hay algún error inesperado en los logs?

## 3. Ambientes (Error 8)

- **Desarrollo:** Local (`localhost:3000`)
- **Pruebas:** Vercel Preview (URL de la Pull Request)
- **Producción:** `naroa.online`

> [!NOTE]
> Nunca publicar en produccion sin que Naroa haya dado el "Visto Bueno" final tras probar la URL de **Pruebas**.
