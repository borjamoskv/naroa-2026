# 🎬 MICA NOIR - Video Prompts para Veo 3.1

> Usar en gemini.google.com o Flow cuando la quota se restablezca

---

## Keyframe START (Estado inicial)

```text
Dark cinematic interface design, MICA AI chatbot avatar emerging from pure black void, 
glowing laser green circuit patterns forming a mystical forest spirit face, 
scattered mica mineral crystals with iridescent highlights, 
subtle blood red accent on the eyes, 
95% pure black background with mineral texture overlay, 
ultra minimal typography in white "MICA", 
professional UI design, 16:9 aspect ratio, 
dramatic lighting from below, kodachrome film aesthetic, 
high contrast noir style
```

---

## Keyframe END (Estado final)

```text
Dark cinematic interface design, MICA AI chatbot fully materialized 
as an elegant forest spirit made of mica crystals and moss, 
laser green glow emanating from the figure, 
chat bubble appearing with artistic Spanish text, 
blood red CTA button glowing, 
95% pure black background with subtle mineral texture, 
premium glassmorphism UI elements, 
digital art meets ancient forest spirit, 16:9 aspect ratio, 
dramatic volumetric lighting, kodachrome film grain, 
high contrast noir aesthetic
```

---

## Prompt Veo 3.1 (Transición)

```text
Cinematic 8s transition between keyframes.
Frame A: MICA emerging from darkness, laser green circuits.
Frame B: MICA fully materialized with chat bubble.
Interpolation: Crystalline particles coalescing into form.
Camera: Slow dolly in with subtle focus pull.
Motion intensity: 0.5
Audio: Ethereal forest ambience with digital glitch accents.
```

---

## Prompt Veo 3.1 (Loop)

```text
Seamless 8s loop of MICA idle state.
Image anchoring: Forest spirit breathing, particle effects.
Internal motion: Mica crystals floating, subtle moss movement.
Camera: Locked position with micro-sway.
Motion intensity: 0.3
Negative: No cuts, no scene changes, locked exposure.
```

---

## Workflow

1. Abrir https://gemini.google.com (con Ultra)
2. Subir keyframes como first/last frame
3. Usar prompts de arriba
4. Descargar y post-procesar:

```bash
ffmpeg -i veo_output.mp4 -c:v libx264 -crf 18 mica_intro.mp4
ffmpeg -stream_loop 3 -i mica_loop.mp4 -c copy mica_loop_extended.mp4
```
