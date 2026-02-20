import sqlite3
import os
from cortex.schema import ALL_SCHEMA, get_init_meta

DB_PATH = os.path.expanduser("~/.cortex/cortex.db")

def init():
    print(f"Initializing CORTEX DB at {DB_PATH}")
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    try:
        for stmt in ALL_SCHEMA:
            # Skip vec0 virtual table if extension not loaded
            if "USING vec0" in stmt:
                print("Skipping vector table (sqlite-vec extension not available in this script)")
                continue
            conn.executescript(stmt)
        
        # Initial metadata
        for key, value in get_init_meta():
            conn.execute("INSERT OR REPLACE INTO cortex_meta (key, value) VALUES (?, ?)", (key, value))
        
        conn.commit()
        print("CORTEX DB initialized successfully.")
    except Exception as e:
        print(f"Initialization failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init()
