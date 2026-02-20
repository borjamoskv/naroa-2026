
import json
import os
import re

DATABASE_PATH = 'data/database.json'

def main():
    with open(DATABASE_PATH, 'r') as f:
        database = json.load(f)
    
    # Create a map of normalized "base" names to entries
    # e.g. "portrait-2" -> [entry_hq, entry_web]
    base_map = {}
    
    # Helper to get base name
    def get_base_name(id_str):
        if id_str.startswith('hq-'):
            return id_str[3:]
        if id_str.startswith('web-'):
            return id_str[4:]
        return id_str

    for entry in database:
        base = get_base_name(entry['id'])
        if base not in base_map:
            base_map[base] = []
        base_map[base].append(entry)

    new_database = []
    removed_count = 0
    renamed_count = 0

    for base, entries in base_map.items():
        if len(entries) == 1:
            # Only one version, keep it. 
            # But clean title if it starts with "Hq " or "Web "
            entry = entries[0]
            if entry['title'].lower().startswith('hq '):
                entry['title'] = entry['title'][3:]
                renamed_count += 1
            elif entry['title'].lower().startswith('web '):
                entry['title'] = entry['title'][4:]
                renamed_count += 1
            
            # Clean timestamped titles e.g. "Cantinflas 1770253699032" -> "Cantinflas (Var)"
            if re.search(r'\d{10,}', entry['title']):
                entry['title'] = re.sub(r'\d{10,}', '(Var)', entry['title']).strip()
                renamed_count += 1

            new_database.append(entry)
        else:
            # Multiple versions. Prefer HQ > Web > Normal
            # Find HQ
            hq_entry = next((e for e in entries if e['id'].startswith('hq-')), None)
            web_entry = next((e for e in entries if e['id'].startswith('web-')), None)
            
            selected = hq_entry if hq_entry else (web_entry if web_entry else entries[0])
            
            # If we selected one, discard others
            removed_count += (len(entries) - 1)
            
            # Clean title of selected
            if selected['title'].lower().startswith('hq '):
                selected['title'] = selected['title'][3:]
                renamed_count += 1
            elif selected['title'].lower().startswith('web '):
                selected['title'] = selected['title'][4:]
                renamed_count += 1
            
            new_database.append(selected)

    base_ids = set()
    final_database = []
    # Deduplicate by ID just in case
    for entry in new_database:
        if entry['id'] not in base_ids:
            final_database.append(entry)
            base_ids.add(entry['id'])
    
    with open(DATABASE_PATH, 'w') as f:
        json.dump(final_database, f, indent=2, ensure_ascii=False)

    print(f"Cleanup complete.\nRemoved duplicates: {removed_count}\nRenamed/Cleaned: {renamed_count}\nTotal unique entries: {len(final_database)}")

if __name__ == "__main__":
    main()
