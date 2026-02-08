#!/bin/bash
ART="/Users/borjafernandezangulo/game/naroa-2026/public/images/artworks"
OUT="/Users/borjafernandezangulo/game/naroa-2026/public/videos/transitions"
IMG_A="$ART/amy-rocks.webp"
IMG_B="$ART/johnny-rocks-hq-4.webp"

mkdir -p "$OUT"

MODES="fade wipeleft wiperight wipeup wipedown slideleft slideright slideup slidedown circlecrop rectcrop distance fadeblack fadewhite radial smoothleft smoothright smoothup smoothdown circleopen circleclose vertopen vertclose horzopen horzclose dissolve pixelize diagtl diagtr diagbl diagbr hlslice hrslice vuslice vdslice squeezev squeezeh zoomin coverleft coverright coverup coverdown revealleft revealright revealup revealdown"

for MODE in $MODES; do
  echo "🎬 Generating: $MODE"
  ffmpeg -y -loop 1 -t 5 -i "$IMG_A" -loop 1 -t 5 -i "$IMG_B" \
    -filter_complex \
    "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0]; \
     [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1]; \
     [v0][v1]xfade=transition=${MODE}:duration=2:offset=3,format=yuv420p[out]" \
    -map "[out]" -c:v libx264 -preset fast -crf 23 -t 8 \
    "$OUT/transition-${MODE}.mp4" 2>/dev/null

  if [ $? -eq 0 ]; then
    echo "  ✅ $MODE OK"
  else
    echo "  ❌ $MODE FAILED"
  fi
done

echo ""
echo "=== DONE ==="
ls -lh "$OUT"/transition-*.mp4 | wc -l
echo " videos generated in $OUT"
