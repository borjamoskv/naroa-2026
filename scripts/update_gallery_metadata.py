
import json
import os
import re

DATABASE_PATH = 'data/database.json'
IMAGES_DIR = 'images/artworks'

def normalize_id(filename):
    return os.path.splitext(filename)[0].lower()

def title_from_filename(filename):
    name = os.path.splitext(filename)[0]
    # Replace hyphens/underscores with spaces and capitalize
    return name.replace('-', ' ').replace('_', ' ').title()

def main():
    with open(DATABASE_PATH, 'r') as f:
        database = json.load(f)

    existing_images = set()
    for entry in database:
        if entry.get('image'):
            existing_images.add(os.path.basename(entry['image']))

    # Map ID to entry index for updates
    id_map = {entry['id']: i for i, entry in enumerate(database)}

    available_images = [f for f in os.listdir(IMAGES_DIR) if f.endswith(('.webp', '.jpg', '.png'))]
    
    updated_count = 0
    added_count = 0

    print(f"Found {len(available_images)} images in {IMAGES_DIR}")

    for image_file in available_images:
        image_id = normalize_id(image_file)
        
        # 1. Update existing placeholder entries
        if image_id in id_map:
            idx = id_map[image_id]
            entry = database[idx]
            if 'placeholder' in entry.get('image', ''):
                entry['image'] = f"images/artworks/{image_file}"
                print(f"✅ Updated placeholder for: {entry['title']}")
                updated_count += 1
                continue
        
        # 2. Add new entries for unused images (skipping special ones like 'placeholder.webp')
        if image_file not in existing_images and image_file != 'placeholder.webp':
            # Skip if ID exists but filename didn't match (already handled above roughly, but double check)
            if image_id in id_map: 
                 # This case might happen if image path in DB was different but ID matches.
                 # If it wasn't a placeholder, we skipped it. If it was, we handled it.
                 # So this is for when ID exists but image is NOT placeholder and mismatch?
                 # Let's assume if ID exists, we trust DB unless it's placeholder.
                 continue

            new_entry = {
                "id": image_id,
                "title": title_from_filename(image_file),
                "series": "obras individuales", # Default, can be refined manually
                "year": 2026,
                "technique": "Mixta",
                "image": f"images/artworks/{image_file}",
                "altText": f"Obra {title_from_filename(image_file)} de Naroa Gutiérrez Gil",
                "metaDescription": f"{title_from_filename(image_file)} - Arte por Naroa Gutiérrez Gil.",
                "category": "Obras Individuales",
                "style": "Mixed Media",
                "featured": False
            }
            database.append(new_entry)
            print(f"✨ Added new entry: {new_entry['title']}")
            added_count += 1

    with open(DATABASE_PATH, 'w') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    print(f"\nSummary:\nUpdated: {updated_count}\nAdded: {added_count}")

if __name__ == "__main__":
    main()
