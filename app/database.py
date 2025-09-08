import sqlite3
import os

DB_PATH = 'db/honeypot.db'

def init_db():
    """Initializes the database and creates the events table if it doesn't exist."""
    # Ensure the directory for the database exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            service TEXT NOT NULL,
            source_ip TEXT NOT NULL,
            source_port INTEGER,
            event_type TEXT NOT NULL,
            event_data TEXT 
        )
    ''')
    conn.commit()
    conn.close()
    print("[*] Database initialized successfully.")
