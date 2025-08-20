import json
from datetime import datetime

LOG_FILE = "honeypot_logs.json"

def log_event(event_type, details):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "type": event_type,
        "details": details
    }
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
