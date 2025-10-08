db = db.getSiblingDB('honeypot');

// Create collections
db.createCollection('events');
db.createCollection('raw_events');
db.createCollection('insights');
db.createCollection('sessions');

// Create indexes for better performance
db.events.createIndex({ "timestamp": -1 });
db.events.createIndex({ "source_ip": 1 });
db.events.createIndex({ "risk_score": -1 });
db.events.createIndex({ "enrichment.country": 1 });

db.raw_events.createIndex({ "timestamp": -1 });
db.insights.createIndex({ "timestamp": -1 });
db.sessions.createIndex({ "session_id": 1 });

print('✅ MongoDB initialized for IoT Honeypot');
