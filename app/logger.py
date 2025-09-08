import sqlite3
import json
import datetime
import os

DB_PATH = 'db/honeypot.db'
LOG_PATH = 'db/events.log'

def log_event(service, source_ip, source_port, event_type, details):
    """Logs an event to both SQLite and a JSON log file."""
    # Ensure db directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    timestamp = datetime.datetime.utcnow().isoformat()
    
    log_data = {
        "timestamp": timestamp,
        "service": service,
        "source_ip": source_ip,
        "source_port": source_port,
        "event_type": event_type,
        "details": details
    }
    
    # Log to SQLite
    try:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        c = conn.cursor()
        c.execute(
            "INSERT INTO events (timestamp, service, source_ip, source_port, event_type, event_data) VALUES (?, ?, ?, ?, ?, ?)",
            (timestamp, service, source_ip, source_port, event_type, json.dumps(details))
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"SQLite Error: {e}")

    # Log to JSON file
    try:
        with open(LOG_PATH, 'a') as f:
            f.write(json.dumps(log_data) + '\n')
    except Exception as e:
        print(f"JSON Log Error: {e}")
