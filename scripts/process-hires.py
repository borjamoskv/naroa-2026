import os
import sys
from PIL import Image

# Config
TARGET_SIZE = 3840  # 4K resolution for "Ultra Premium"
QUALITY = 95        # High quality WebP
SOURCES = {
    # New Batch (Feb 8 2026)
    "public/images/artworks/source-marilyn.png": "public/images/artworks/marilyn-rocks-hq-5.webp",
    "public/images/artworks/source-amy.png": "public/images/artworks/amy-rocks.webp",
    "public/images/artworks/source-james.png": "public/images/artworks/james-rocks-hq-3.webp",
    "public/images/artworks/source-johnny.png": "public/images/artworks/johnny-rocks-hq-5.webp",
    
    # Previous Batch (Keeping for reference)
    "public/images/artworks/cantinflas-platos-source.png": "public/images/artworks/cantinflas-0.webp",
    "public/images/artworks/source-portrait-1.png": "public/images/artworks/cantinflas-1.webp",
    "public/images/artworks/source-portrait-2.png": "public/images/artworks/johnny-rocks-hq-4.webp"
}

def process_image(source_path, dest_path):
    if not os.path.exists(source_path):
        print(f"❌ Source not found: {source_path}")
        return

    try:
        print(f"🔄 Processing {source_path}...")
        
        # Disable decompression bomb checks for huge images
        Image.MAX_IMAGE_PIXELS = None
        
        with Image.open(source_path) as img:
            # Get dimensions
            width, height = img.size
            print(f"   Original size: {width}x{height}")

            # Calculate new size (max dimension = TARGET_SIZE)
            # Only resize down if larger
            if width > TARGET_SIZE or height > TARGET_SIZE:
                ratio = min(TARGET_SIZE / width, TARGET_SIZE / height)
                new_width = int(width * ratio)
                new_height = int(height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"   Resized to: {new_width}x{new_height}")
            else:
                print("   Size within target limits, keeping original.")

            # Save as WebP
            img.save(dest_path, 'WEBP', quality=QUALITY)
            print(f"✅ Saved to {dest_path}")
            
            # Generate Thumbnail (500px)
            thumb_path = dest_path.replace("/artworks/", "/thumbnails-webp/")
            thumb_dir = os.path.dirname(thumb_path)
            if not os.path.exists(thumb_dir):
                os.makedirs(thumb_dir)
            
            # Create a copy for thumbnail
            thumb_img = img.copy()
            thumb_img.thumbnail((500, 500))
            thumb_img.save(thumb_path, 'WEBP', quality=85)
            print(f"   Thumbnail created at {thumb_path}")

    except Exception as e:
        print(f"🚨 Error processing {source_path}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print(f"🎨 Naroa High-Res Processing (Target: {TARGET_SIZE}px)")
    print("==================================================")
    for src, dest in SOURCES.items():
        process_image(src, dest)
