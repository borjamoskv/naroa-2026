# NAROA GOLDEN STATE: RULES & SKILLS

## 1. Code Standards

- **Language**: All comments and documentation must be in **Spanish** (Español).
- **CSS**:
  - ZERO inline styles in HTML. Use classes defined in `css/naroa-overrides.css` or relevant stylesheets.
  - Prioritize native CSS variables (`--color-accent`, etc.).
  - Follow the "Golden Ratio" system already present in the project.
- **JS**:
  - Use ES Modules (import/export).
  - No legacy global variables unless strictly necessary for historical integration (like `MICA_EMERGENCY`).
  - Keep logic modular; follow the `MicaCrisisEngine` class structure for games.

## 2. Aesthetic Standards (Premium/Wow)

- **Pixel Art**: Use `image-rendering: pixelated` for retro/arcade elements.
- **CRT Effects**: Maintain scanlines, vignettes, and chromatic aberration in game overlays.
- **Micro-Animations**: Every interaction (hover, click, transition) must feel fluid and premium.

## 3. Workflow

- **Verification**: Always use the integrated browser to "see" the app before finalizing visual changes.
- **Parallelism**: Respect the "Enjambre" (Swarm) architecture. If multiple agents work here, maintain sync via updated `task.md` and artifacts.

---

*Codificado por Antigravity (Kimi Mode) - Febrero 2026*
