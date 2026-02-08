#!/bin/bash
ART="/Users/borjafernandezangulo/game/naroa-2026/public/images/artworks"
OUT="/Users/borjafernandezangulo/game/naroa-2026/public/videos/transitions"
A="$ART/amy-rocks.webp"
B="$ART/johnny-rocks-hq-4.webp"
mkdir -p "$OUT"

for MODE in fade wipeleft wiperight slideleft slideright circlecrop rectcrop fadeblack fadewhite radial smoothleft smoothright circleopen circleclose dissolve pixelize diagtl diagtr squeezev squeezeh zoomin coverleft revealleft revealright; do
  ffmpeg -y -loop 1 -t 3 -i "$A" -loop 1 -t 3 -i "$B" \
    -filter_complex "[0:v]scale=960:540,setsar=1,fps=24[v0];[1:v]scale=960:540,setsar=1,fps=24[v1];[v0][v1]xfade=transition=${MODE}:duration=1.5:offset=1.5,format=yuv420p[out]" \
    -map "[out]" -c:v libx264 -preset ultrafast -crf 28 -t 4 "$OUT/t-${MODE}.mp4" 2>/dev/null &
done
wait
echo "DONE"
ls "$OUT"/t-*.mp4 | wc -l
