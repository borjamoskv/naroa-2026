#!/bin/bash
# =============================================================================
# NAROA 2026 — Artwork Upscale Pipeline
# Upscales artwork images using best available sources
# =============================================================================

set -e

ARTWORKS_DIR="public/images/artworks"
INTRO_DIR="public/img/artworks-intro"
THUMBNAILS_DIR="public/images/thumbnails"
BACKUP_DIR="public/images/artworks-320px-backup"
TARGET_SIZE=1600
THUMB_SIZE=400

echo "🎨 Naroa Artwork Upscale Pipeline"
echo "=================================="

# Create backup of originals
mkdir -p "$BACKUP_DIR"
echo "📦 Backing up original 320px images..."
cp "$ARTWORKS_DIR"/*.webp "$BACKUP_DIR/" 2>/dev/null || true

# =============================================================================
# STEP 1: Replace artworks with intro versions (800px → upscale to 1600px)
# =============================================================================
echo ""
echo "🔄 Step 1: Replacing with higher-res intro versions..."

# Direct name matches
declare -a MATCHES=(
  "amy-rocks:amy-rocks"
  "james-rocks-hq-3:james-rocks"
  "johnny-rocks-hq-4:johnny-rocks"
  "marilyn-rocks-hq-5:marilyn-rocks"
  "el-gran-dakari:el-gran-dakari-nino"
  "peter-rowan:peter-rowan"
)

replaced=0
for match in "${MATCHES[@]}"; do
  artwork_name="${match%%:*}"
  intro_name="${match##*:}"
  
  if [ -f "$INTRO_DIR/$intro_name.webp" ]; then
    cp "$INTRO_DIR/$intro_name.webp" "$ARTWORKS_DIR/$artwork_name.webp"
    echo "  ✅ $artwork_name ← $intro_name (800px)"
    ((replaced++))
  fi
done
echo "  Replaced: $replaced artworks with 800px versions"

# =============================================================================
# STEP 2: Upscale all images to target size
# =============================================================================
echo ""
echo "📐 Step 2: Upscaling all artworks to ${TARGET_SIZE}px..."

upscaled=0
for img in "$ARTWORKS_DIR"/*.webp; do
  basename=$(basename "$img")
  
  # Get current dimensions
  width=$(sips -g pixelWidth "$img" 2>/dev/null | awk '/pixelWidth/{print $2}')
  height=$(sips -g pixelHeight "$img" 2>/dev/null | awk '/pixelHeight/{print $2}')
  
  if [ -z "$width" ] || [ -z "$height" ]; then
    echo "  ⚠️  Skipping $basename (cannot read dimensions)"
    continue
  fi
  
  # Determine max dimension
  max_dim=$width
  if [ "$height" -gt "$width" ]; then
    max_dim=$height
  fi
  
  # Only upscale if smaller than target
  if [ "$max_dim" -lt "$TARGET_SIZE" ]; then
    sips --resampleHeightWidthMax "$TARGET_SIZE" "$img" > /dev/null 2>&1
    new_width=$(sips -g pixelWidth "$img" 2>/dev/null | awk '/pixelWidth/{print $2}')
    new_height=$(sips -g pixelHeight "$img" 2>/dev/null | awk '/pixelHeight/{print $2}')
    echo "  📐 $basename: ${width}x${height} → ${new_width}x${new_height}"
    ((upscaled++))
  else
    echo "  ✓  $basename already ${width}x${height} (≥${TARGET_SIZE}px)"
  fi
done
echo "  Upscaled: $upscaled artworks"

# =============================================================================
# STEP 3: Generate thumbnails at 400px
# =============================================================================
echo ""
echo "🖼️  Step 3: Generating ${THUMB_SIZE}px WebP thumbnails..."

mkdir -p "$THUMBNAILS_DIR"
thumbs=0
for img in "$ARTWORKS_DIR"/*.webp; do
  basename_noext=$(basename "$img" .webp)
  thumb_path="$THUMBNAILS_DIR/${basename_noext}.webp"
  
  # Create thumbnail copy
  cp "$img" "$thumb_path"
  sips --resampleHeightWidthMax "$THUMB_SIZE" "$thumb_path" > /dev/null 2>&1
  ((thumbs++))
done
echo "  Generated: $thumbs thumbnails"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "✨ Pipeline Complete!"
echo "===================="
echo "  Replaced with 800px:  $replaced"
echo "  Upscaled to ${TARGET_SIZE}px:  $upscaled"  
echo "  Thumbnails at ${THUMB_SIZE}px: $thumbs"
echo ""
echo "  Backup of 320px originals: $BACKUP_DIR/"

# Show sample results
echo ""
echo "📊 Sample results:"
for sample in espejos-del-alma amy-rocks marilyn-rocks-hq-5 el-gran-dakari; do
  if [ -f "$ARTWORKS_DIR/$sample.webp" ]; then
    w=$(sips -g pixelWidth "$ARTWORKS_DIR/$sample.webp" 2>/dev/null | awk '/pixelWidth/{print $2}')
    h=$(sips -g pixelHeight "$ARTWORKS_DIR/$sample.webp" 2>/dev/null | awk '/pixelHeight/{print $2}')
    echo "  $sample: ${w}x${h}"
  fi
done
