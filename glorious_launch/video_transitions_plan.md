# Plan de Transiciones de Video - Serie Rocks
## Naroa Art Launch Campaign

**Modelo:** Veo 3.1  
**Formato:** 16:9 | 8 segundos | 1080p  
**Fecha:** 2026-02-08  

---

## Transiciones BRIDGE (5 videos)

Transiciones suaves entre cuadros consecutivos de la serie Rocks. Cada video comienza con el cuadro A y termina en el cuadro B, con una transformación orgánica de elementos compartidos (lentejuelas, expresiones, energía rock).

### BRIDGE-01: Amy Rocks → Johnny Rocks (IV)
**Archivos:** `amy-rocks.webp` → `johnny-rocks-hq-4.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Inicio** | `public/images/artworks/amy-rocks.webp` |
| **Imagen Final** | `public/images/artworks/johnny-rocks-hq-4.webp` |

**Prompt Veo 3.1:**
```
Cinematic seamless transition from an artwork of Amy Winehouse with dramatic eye makeup and flowing hair surrounded by golden sequins and rock energy, to Johnny Cash portrait with intense gaze, black attire and country-rock aesthetic. The golden sequins morph and cascade like liquid metal across the frame, carrying the rock spirit from one icon to another. Smooth camera movement, 24fps film grain, dramatic side lighting, consistent mixed-media collage texture throughout. No cuts, one continuous morphing shot.
```

---

### BRIDGE-02: Johnny Rocks (IV) → Johnny Rocks (V)
**Archivos:** `johnny-rocks-hq-4.webp` → `johnny-rocks-hq-5.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Inicio** | `public/images/artworks/johnny-rocks-hq-4.webp` |
| **Imagen Final** | `public/images/artworks/johnny-rocks-hq-5.webp` |

**Prompt Veo 3.1:**
```
Seamless metamorphosis between two portraits of Johnny Cash in mixed-media collage style. First portrait with intense frontal gaze transforms into second portrait with three-quarter view. Black textures and shadows ripple like velvet fabric in slow motion. The sequined elements shift and reorganize, maintaining the dark rock aesthetic. Camera slowly orbits around the transforming face. Consistent chiaroscuro lighting, filmic quality, no cuts.
```

---

### BRIDGE-03: Johnny Rocks (V) → Johnny Rocks (VI)
**Archivos:** `johnny-rocks-hq-5.webp` → `johnny-rocks-hq-6.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Inicio** | `public/images/artworks/johnny-rocks-hq-5.webp` |
| **Imagen Final** | `public/images/artworks/johnny-rocks-hq-6.webp` |

**Prompt Veo 3.1:**
```
Fluid transformation between two Johnny Cash portrait variations. The sequined texture of the face gently dissolves and reconfigures, revealing different angles of the same iconic persona. Shadow patterns dance across the canvas like stage lights. Elements of country-rock iconography - guitars, vinyl textures - subtly emerge and fade. Slow cinematic zoom maintaining center composition. Mixed-media collage aesthetic preserved throughout, no abrupt cuts.
```

---

### BRIDGE-04: Johnny Rocks (VI) → Marilyn Rocks (V)
**Archivos:** `johnny-rocks-hq-6.webp` → `marilyn-rocks-hq-5.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Inicio** | `public/images/artworks/johnny-rocks-hq-6.webp` |
| **Imagen Final** | `public/images/artworks/marilyn-rocks-hq-5.webp` |

**Prompt Veo 3.1:**
```
Dramatic gender-bending transition from Johnny Cash to Marilyn Monroe, both in rock-glam mixed-media collage style. Dark masculine shadows gradually give way to platinum blonde luminosity. Sequins transform from black velvet sparkles to diamond-bright glimmers. The camera glides through a tunnel of shifting glitter and collage elements. Lighting evolves from moody chiaroscuro to Hollywood golden hour glow. One continuous morph, no cuts, maintaining artistic texture.
```

---

### BRIDGE-05: Marilyn Rocks (V) → James Rocks (III)
**Archivos:** `marilyn-rocks-hq-5.webp` → `james-rocks-hq-3.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Inicio** | `public/images/artworks/marilyn-rocks-hq-5.webp` |
| **Imagen Final** | `public/images/artworks/james-rocks-hq-3.webp` |

**Prompt Veo 3.1:**
```
High-energy transition from Marilyn Monroe's glamorous sequined portrait to James Dean's rebellious rock persona. Blonde waves and diamond sparkles cascade into leather jacket textures and brooding shadows. The mixed-media collage elements - newspaper clippings, paint strokes, glitter - swirl in a vortex of 1950s Hollywood meets rock revolution. Camera pushes forward through the transformation. Consistent film grain, dramatic lighting evolution from bright glam to moody rebel aesthetic.
```

---

## Loops OUROBOROS (3 videos)

Videos en bucle perfecto que comienzan y terminan en la misma imagen, creando una experiencia infinita de transformación sin principio ni fin.

### OUROBOROS-01: The Rock Cycle (Amy → Johnny → Marilyn → James → Amy)
**Archivo Base:** `amy-rocks.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Loop** | `public/images/artworks/amy-rocks.webp` |
| **Tipo** | Loop perfecto (frame 0 = frame último) |

**Prompt Veo 3.1:**
```
Infinite loop video of rock music icons transforming in continuous cycle: Amy Winehouse with beehive hair and dramatic makeup morphs into Johnny Cash in black, then Marilyn Monroe with platinum hair, then James Dean in rebel leather, and seamlessly back to Amy Winehouse. Golden sequins and mixed-media collage textures flow continuously. The transformation never stops - frame 0 must match frame 192 exactly for perfect loop. Cinematic lighting, 24fps film quality, swirling glitter particles, consistent artistic style throughout the eternal cycle.
```

**Notas técnicas:**
- Generar 9s y recortar a 8s para asegurar loop perfecto
- Verificar match de primer y último frame

---

### OUROBOROS-02: Johnny Variations Eternal
**Archivo Base:** `johnny-rocks-hq-5.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Loop** | `public/images/artworks/johnny-rocks-hq-5.webp` |
| **Tipo** | Loop perfecto (frame 0 = frame último) |

**Prompt Veo 3.1:**
```
Seamless infinite loop of Johnny Cash portrait subtly transforming and returning to original state. The Man in Black's face gently shifts through expressions, angles, and sequin patterns while maintaining his iconic essence. Shadows breathe and dance like smoke. Black velvet textures ripple. Mixed-media collage elements - newspaper print, guitar strings, vinyl grooves - float and reorganize in eternal cycle. Frame must loop perfectly: start and end on identical composition. Slow hypnotic motion, cinematic film grain, moody chiaroscuro lighting throughout.
```

**Notas técnicas:**
- Generar 9s y recortar a 8s
- Testear loop en reproductor

---

### OUROBOROS-03: Glitter Immortality (Marilyn Eternal)
**Archivo Base:** `marilyn-rocks-hq-5.webp`

| Parámetro | Valor |
|-----------|-------|
| **Aspect Ratio** | 16:9 |
| **Duración** | 8s |
| **Resolución** | 1080p |
| **Imagen Loop** | `public/images/artworks/marilyn-rocks-hq-5.webp` |
| **Tipo** | Loop perfecto (frame 0 = frame último) |

**Prompt Veo 3.1:**
```
Hypnotic infinite loop of Marilyn Monroe portrait in mixed-media collage style with diamond sequins and platinum glamour. Sequins sparkle and cascade in eternal falling motion that loops perfectly. Her iconic expression subtly breathes - eyes opening slightly, lips parting, then returning to original pose. Golden light pulses gently. Collage elements - diamond shapes, fabric textures, Hollywood starlight - swirl in continuous circular motion. Frame 0 identical to frame 192. Dreamlike quality, soft focus background, cinematic 24fps, no beginning or end.
```

**Notas técnicas:**
- Generar 9s y recortar a 8s
- Verificar consistencia de loop

---

## Especificaciones Técnicas Comunes

### Para todas las transiciones:

| Parámetro | Valor |
|-----------|-------|
| **Modelo** | Veo 3.1 (Google AI) |
| **Aspect Ratio** | 16:9 landscape |
| **Duración** | 8 segundos |
| **Resolución** | 1920x1080 (1080p) |
| **FPS** | 24fps nativo |
| **Estilo** | Mixed-media collage cinematográfico |
| **Referencias de imagen** | Incluir imágenes de artworks originales |

### Tips de prompting para Veo 3.1:

1. **Imagen de referencia:** Adjuntar siempre la imagen .webp correspondiente
2. **Movimiento de cámara:** Especificar "slow cinematic movement", "gentle orbit", "smooth push"
3. **Continuidad:** Incluir "no cuts", "seamless", "one continuous shot"
4. **Texturas:** Mencionar "mixed-media collage", "sequins", "film grain"
5. **Loops:** Para Ouroboros, enfatizar "frame 0 matches frame final", "perfect loop", "infinite cycle"

### Workflow de generación:

```
1. Preparar imágenes de referencia (1920x1080 canvas con artwork centrado)
2. Subir imagen a Veo 3.1
3. Pegar prompt correspondiente
4. Generar 9s (para loops) o 8s (para bridges)
5. Descargar MP4
6. Para loops: trim final para match perfecto
7. Verificar en reproductor
8. Subir a /videos/transitions/
```

---

## Metadatos para Naming

**Convención de archivos:**
```
{tipo}-{serie}-{orden}-{timestamp}.mp4

Ejemplos:
- bridge-rocks-01-20260208.mp4
- bridge-rocks-02-20260208.mp4
- ouroboros-rocks-01-20260208.mp4
```

---

*Plan generado: 2026-02-08*  
*Total videos: 8 (5 Bridge + 3 Ouroboros)*
