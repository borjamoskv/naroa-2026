#!/bin/bash
# Script para descargar todos los videos 4K de Google Flow
# Proyecto: NAROA WEB
# https://labs.google/fx/es/tools/flow/project/8ba7e751-1bc5-45e5-86f3-7af1006d1eb0

set -e

# Directorio de destino
OUTPUT_DIR="./videos/flow-4k"
mkdir -p "$OUTPUT_DIR"

echo "🎬 Descargando videos 4K desde Google Flow..."
echo "Proyecto: NAROA WEB"
echo "Destino: $OUTPUT_DIR"
echo ""

# URLs de los videos (extraídas del proyecto Flow)
# Nota: Estas URLs tienen firma temporal de Google Cloud Storage
declare -A VIDEOS=(
    ["video-1-mus-batzoki"]="https://storage.googleapis.com/ai-sandbox-videofx/video/dfe92a18-f924-4aa0-9796-2e50f5e5b787"
    ["video-2-stripoker"]="https://storage.googleapis.com/ai-sandbox-videofx/video/21fef475-ccab-47cb-b18c-acf4990cff56"
    ["video-3-fondo-oscuro"]="https://storage.googleapis.com/ai-sandbox-videofx/video/1454c780-6136-482c-8d19-d47be34314a5"
    ["video-4-patatas"]="https://storage.googleapis.com/ai-sandbox-videofx/video/0f03add5-eca1-4799-a889-9ccb7300d856"
)

# Función para descargar con reintentos
download_video() {
    local name=$1
    local url=$2
    local output="$OUTPUT_DIR/${name}.mp4"
    
    echo "📥 Descargando: $name"
    
    if [ -f "$output" ]; then
        echo "   ⚠️  Ya existe, saltando..."
        return 0
    fi
    
    # Usar curl con barra de progreso
    if curl -L --fail --retry 3 --retry-delay 5 \
         -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
         -o "$output" "$url"; then
        echo "   ✅ Descargado correctamente"
        
        # Mostrar tamaño
        local size=$(du -h "$output" | cut -f1)
        echo "   📦 Tamaño: $size"
    else
        echo "   ❌ Error al descargar"
        rm -f "$output"
        return 1
    fi
}

# Descargar todos los videos
for name in "${!VIDEOS[@]}"; do
    download_video "$name" "${VIDEOS[$name]}" || echo "   ⚠️  Continuando con el siguiente..."
    echo ""
done

echo "======================================"
echo "✅ Proceso de descarga completado"
echo "======================================"
echo ""
echo "Videos disponibles en: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"

# Opcional: Convertir a diferentes formatos
read -p "¿Convertir a WebM para web? (y/n): " convert
if [ "$convert" = "y" ]; then
    echo ""
    echo "🔄 Convirtiendo a WebM optimizado para web..."
    
    for video in "$OUTPUT_DIR"/*.mp4; do
        if [ -f "$video" ]; then
            basename=$(basename "$video" .mp4)
            output_webm="$OUTPUT_DIR/${basename}.webm"
            
            echo "   Procesando: $basename"
            
            # Convertir con ffmpeg (VP9 + Opus, optimizado web)
            ffmpeg -i "$video" \
                -c:v libvpx-vp9 -crf 30 -b:v 0 \
                -c:a libopus -b:a 128k \
                -threads 4 \
                "$output_webm" \
                -y -loglevel warning
            
            echo "   ✅ WebM creado"
        fi
    done
fi

echo ""
echo "🎉 ¡Listo! Todos los videos descargados."
