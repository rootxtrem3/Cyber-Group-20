import sqlite3
import os
import json
from datetime import datetime, timedelta

def init_database():
    # Extract database path from environment variable or use default
    db_url = os.getenv('DATABASE_URL', 'sqlite:///./data/honeypot.db')
    if db_url.startswith('sqlite:///'):
        db_path = db_url.replace('sqlite:///', '')
    else:
        db_path = db_url
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    print(f"Initializing database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Drop existing tables if they exist (for clean start)
    c.execute('DROP TABLE IF EXISTS events')
    c.execute('DROP TABLE IF EXISTS captures')
    c.execute('DROP TABLE IF EXISTS settings')
    
    # Create events table (for connection logs)
    c.execute('''
        CREATE TABLE events
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         timestamp DATETIME,
         source_ip TEXT,
         port INTEGER,
         service TEXT,
         country TEXT,
         city TEXT,
         latitude REAL,
         longitude REAL,
         event_data TEXT)
    ''')
    
    # Create captures table (for file uploads from HTTP honeypot)
    c.execute('''
        CREATE TABLE captures
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         ts DATETIME,
         src_ip TEXT,
         src_port INTEGER,
         http_path TEXT,
         method TEXT,
         headers TEXT,
         query_string TEXT,
         meta TEXT,
         files TEXT,
         created_at DATETIME)
    ''')
    
    # Create settings table (for application configuration)
    c.execute('''
        CREATE TABLE settings
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         key TEXT UNIQUE,
         value TEXT)
    ''')
    
    # Insert default settings
    default_settings = [
        ('geoip_enabled', 'true'),
        ('email_alerts_enabled', 'false'),
        ('smtp_configured', 'false'),
        ('bind_addr', '0.0.0.0'),
        ('ssh_port', '22222'),
        ('http_port', '8080'),
        ('backend_port', '8000'),
        ('frontend_port', '3000')
    ]
    
    for key, value in default_settings:
        c.execute('''
            INSERT INTO settings (key, value) 
            VALUES (?, ?)
        ''', (key, value))
    
    # Create sample events data
    sample_events = [
        {
            'timestamp': datetime.now() - timedelta(hours=2),
            'source_ip': '192.168.1.100',
            'port': 22222,
            'service': 'ssh',
            'country': 'United States',
            'city': 'New York',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'event_data': json.dumps({
                'client_version': 'SSH-2.0-OpenSSH_8.2',
                'session_data': {
                    'authenticated': False,
                    'username': 'root',
                    'duration': 5.2,
                    'transcript': [
                        {
                            'timestamp': datetime.now().isoformat(),
                            'event_type': 'connection_made',
                            'data': {'client_ip': '192.168.1.100', 'client_port': 37742}
                        },
                        {
                            'timestamp': datetime.now().isoformat(),
                            'event_type': 'connection_lost', 
                            'data': {'duration': 5.2, 'error': 'Connection reset by peer'}
                        }
                    ]
                }
            })
        },
        {
            'timestamp': datetime.now() - timedelta(hours=1),
            'source_ip': '10.0.0.50',
            'port': 8080,
            'service': 'http',
            'country': 'Germany',
            'city': 'Berlin',
            'latitude': 52.5200,
            'longitude': 13.4050,
            'event_data': json.dumps({
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'path': '/admin',
                'method': 'GET',
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            })
        },
        {
            'timestamp': datetime.now() - timedelta(minutes=30),
            'source_ip': '172.16.0.25',
            'port': 22222,
            'service': 'ssh',
            'country': 'China',
            'city': 'Beijing',
            'latitude': 39.9042,
            'longitude': 116.4074,
            'event_data': json.dumps({
                'client_version': 'SSH-2.0-OpenSSH_7.4',
                'session_data': {
                    'authenticated': True,
                    'username': 'admin',
                    'password': 'password123',
                    'duration': 12.7,
                    'transcript': [
                        {
                            'timestamp': datetime.now().isoformat(),
                            'event_type': 'connection_made',
                            'data': {'client_ip': '172.16.0.25', 'client_port': 54231}
                        },
                        {
                            'timestamp': datetime.now().isoformat(),
                            'event_type': 'login_attempt',
                            'data': {'username': 'admin', 'password': 'password123'}
                        },
                        {
                            'timestamp': datetime.now().isoformat(),
                            'event_type': 'connection_lost', 
                            'data': {'duration': 12.7, 'error': 'Connection closed'}
                        }
                    ]
                }
            })
        },
        {
            'timestamp': datetime.now() - timedelta(minutes=15),
            'source_ip': '203.0.113.45',
            'port': 8080,
            'service': 'http',
            'country': 'Russia',
            'city': 'Moscow',
            'latitude': 55.7558,
            'longitude': 37.6173,
            'event_data': json.dumps({
                'user_agent': 'curl/7.68.0',
                'path': '/upload',
                'method': 'POST',
                'headers': {
                    'User-Agent': 'curl/7.68.0',
                    'Content-Type': 'multipart/form-data'
                }
            })
        }
    ]
    
    for event in sample_events:
        c.execute('''
            INSERT INTO events 
            (timestamp, source_ip, port, service, country, city, latitude, longitude, event_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            event['timestamp'].isoformat(),
            event['source_ip'],
            event['port'],
            event['service'],
            event['country'],
            event['city'],
            event['latitude'],
            event['longitude'],
            event['event_data']
        ))
    
    # Sample capture data
    sample_captures = [
        {
            'ts': datetime.now() - timedelta(hours=3),
            'src_ip': '192.168.1.100',
            'src_port': 8080,
            'http_path': '/upload',
            'method': 'POST',
            'headers': json.dumps({
                'User-Agent': 'curl/7.68.0', 
                'Content-Type': 'multipart/form-data',
                'Content-Length': '1024'
            }),
            'query_string': json.dumps({}),
            'meta': json.dumps({
                'user_agent': 'curl/7.68.0',
                'content_type': 'multipart/form-data'
            }),
            'files': json.dumps([{
                'filename': 'malware.exe',
                'size': 1024,
                'sha256': 'a1b2c3d4e5f678901234567890123456789012345678901234567890123456'
            }]),
            'created_at': datetime.now() - timedelta(hours=3)
        },
        {
            'ts': datetime.now() - timedelta(hours=1),
            'src_ip': '10.0.0.50',
            'src_port': 8080,
            'http_path': '/upload',
            'method': 'POST',
            'headers': json.dumps({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'multipart/form-data',
                'Content-Length': '2048'
            }),
            'query_string': json.dumps({}),
            'meta': json.dumps({
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'content_type': 'multipart/form-data'
            }),
            'files': json.dumps([{
                'filename': 'suspicious.pdf',
                'size': 2048,
                'sha256': 'b2c3d4e5f678901234567890123456789012345678901234567890123456a1'
            }]),
            'created_at': datetime.now() - timedelta(hours=1)
        }
    ]
    
    for capture in sample_captures:
        c.execute('''
            INSERT INTO captures 
            (ts, src_ip, src_port, http_path, method, headers, query_string, meta, files, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            capture['ts'].isoformat(),
            capture['src_ip'],
            capture['src_port'],
            capture['http_path'],
            capture['method'],
            capture['headers'],
            capture['query_string'],
            capture['meta'],
            capture['files'],
            capture['created_at'].isoformat()
        ))
    
    conn.commit()
    
    # Verify tables were created and count records
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = c.fetchall()
    print("Created tables:", [table[0] for table in tables])
    
    c.execute("SELECT COUNT(*) FROM events")
    event_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM captures")
    capture_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM settings")
    setting_count = c.fetchone()[0]
    
    print(f"Sample data inserted: {event_count} events, {capture_count} captures, {setting_count} settings")
    
    # Show some sample data
    print("\nSample Events:")
    c.execute("SELECT id, source_ip, service, timestamp FROM events LIMIT 3")
    for row in c.fetchall():
        print(f"  ID: {row[0]}, IP: {row[1]}, Service: {row[2]}, Time: {row[3]}")
    
    print("\nSample Captures:")
    c.execute("SELECT id, src_ip, http_path FROM captures LIMIT 2")
    for row in c.fetchall():
        print(f"  ID: {row[0]}, IP: {row[1]}, Path: {row[2]}")
    
    print("\nSettings:")
    c.execute("SELECT key, value FROM settings")
    for row in c.fetchall():
        print(f"  {row[0]}: {row[1]}")
    
    conn.close()
    print(f"\nDatabase initialized successfully at: {db_path}")

if __name__ == "__main__":
    init_database()