import threading
import socket
import json
import sqlite3
from flask import Flask, render_template, jsonify, request
from database import init_db
from logger import log_event
from honeypots import run_telnet_honeypot, run_http_honeypot, run_mqtt_honeypot

app = Flask(__name__)
DB_PATH = 'db/honeypot.db'

# --- API Endpoints ---

@app.route('/')
def index():
    """Serves the main dashboard page."""
    return render_template('index.html')

@app.route('/api/events')
def get_events():
    """Provides the latest events for the live log."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM events ORDER BY timestamp DESC LIMIT 100")
        events = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(events)
    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats')
def get_stats():
    """Provides aggregated statistics for the dashboard charts."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        # Total events
        c.execute("SELECT COUNT(*) as total_events FROM events")
        total_events = c.fetchone()['total_events']

        # Unique IPs
        c.execute("SELECT COUNT(DISTINCT source_ip) as unique_ips FROM events")
        unique_ips = c.fetchone()['unique_ips']

        # Events by service
        c.execute("SELECT service, COUNT(*) as count FROM events GROUP BY service")
        events_by_service = {row['service']: row['count'] for row in c.fetchall()}

        # Events in the last 24 hours (by hour)
        c.execute("""
            SELECT strftime('%Y-%m-%d %H:00:00', timestamp) as hour, COUNT(*) as count
            FROM events
            WHERE timestamp >= datetime('now', '-24 hours')
            GROUP BY hour
            ORDER BY hour
        """)
        events_over_time = {row['hour']: row['count'] for row in c.fetchall()}
        
        # Top 5 source IPs
        c.execute("SELECT source_ip, COUNT(*) as count FROM events GROUP BY source_ip ORDER BY count DESC LIMIT 5")
        top_ips = {row['source_ip']: row['count'] for row in c.fetchall()}


        conn.close()

        stats = {
            "total_events": total_events,
            "unique_ips": unique_ips,
            "events_by_service": events_by_service,
            "events_over_time": events_over_time,
            "top_ips": top_ips
        }
        return jsonify(stats)
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": str(e)}), 500

# --- Main Execution ---

if __name__ == '__main__':
    # Initialize the database
    init_db()

    # Start honeypot threads
    honeypot_threads = {
        'telnet': threading.Thread(target=run_telnet_honeypot, daemon=True),
        'http': threading.Thread(target=run_http_honeypot, daemon=True),
        'mqtt': threading.Thread(target=run_mqtt_honeypot, daemon=True),
    }

    for service, thread in honeypot_threads.items():
        print(f"[*] Starting {service} honeypot...")
        thread.start()

    # Run Flask app
    # Host 0.0.0.0 is crucial for Docker to expose the port correctly
    app.run(host='0.0.0.0', port=5000, debug=False)
