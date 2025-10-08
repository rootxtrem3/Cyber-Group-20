# log_processor/database_handler.py
import pymongo
from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
import json
import logging

class DatabaseHandler:
    def __init__(self, connection_string="mongodb://mongodb:27017/"):
        self.client = MongoClient(connection_string)
        self.db = self.client["honeypot"]
        self.setup_collections()
        self.setup_indexes()
        
    def setup_collections(self):
        """Ensure all required collections exist"""
        collections = ["raw_events", "events", "sessions", "ai_insights"]
        for collection in collections:
            if collection not in self.db.list_collection_names():
                self.db.create_collection(collection)
    
    def setup_indexes(self):
        """Create indexes for optimal query performance"""
        # Events collection indexes
        self.db.events.create_index([("timestamp", DESCENDING)])
        self.db.events.create_index([("source_ip", ASCENDING)])
        self.db.events.create_index([("risk_score", DESCENDING)])
        self.db.events.create_index([("enrichment.country", ASCENDING)])
        self.db.events.create_index([("event_type", ASCENDING)])
        
        # Raw events collection indexes
        self.db.raw_events.create_index([("timestamp", DESCENDING)])
        
        # Sessions collection indexes
        self.db.sessions.create_index([("session_id", ASCENDING)])
        self.db.sessions.create_index([("start_time", DESCENDING)])
        
        logging.info("Database indexes created successfully")
    
    def insert_event(self, event_data):
        """Insert a normalized event into the events collection"""
        try:
            result = self.db.events.insert_one(event_data)
            logging.debug(f"Event inserted with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logging.error(f"Error inserting event: {e}")
            return None
    
    def insert_raw_event(self, raw_data):
        """Store raw log data for backup and analysis"""
        try:
            result = self.db.raw_events.insert_one(raw_data)
            return result.inserted_id
        except Exception as e:
            logging.error(f"Error inserting raw event: {e}")
            return None
    
    def get_recent_events(self, limit=100):
        """Retrieve recent events for dashboard"""
        return list(self.db.events.find().sort("timestamp", DESCENDING).limit(limit))
    
    def get_events_by_time_range(self, start_time, end_time):
        """Get events within a specific time range"""
        return list(self.db.events.find({
            "timestamp": {"$gte": start_time, "$lte": end_time}
        }).sort("timestamp", DESCENDING))
    
    def get_attack_statistics(self, hours=24):
        """Calculate attack statistics for dashboard"""
        cutoff_time = datetime.now().isoformat()
        
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$gte": cutoff_time}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_attacks": {"$sum": 1},
                    "unique_ips": {"$addToSet": "$source_ip"},
                    "high_risk_count": {
                        "$sum": {
                            "$cond": [{"$gt": ["$risk_score", 70]}, 1, 0]
                        }
                    },
                    "top_commands": {"$push": "$commands"}
                }
            }
        ]
        
        result = list(self.db.events.aggregate(pipeline))
        if result:
            stats = result[0]
            return {
                "total_attacks": stats["total_attacks"],
                "unique_ips": len(stats["unique_ips"]),
                "high_risk_count": stats["high_risk_count"],
                "top_commands": self._extract_top_commands(stats["top_commands"])
            }
        return {"total_attacks": 0, "unique_ips": 0, "high_risk_count": 0, "top_commands": []}
    
    def _extract_top_commands(self, commands_list):
        """Extract and count top commands from events"""
        from collections import Counter
        all_commands = []
        
        for cmd in commands_list:
            if cmd and isinstance(cmd, str):
                all_commands.append(cmd.strip())
        
        return Counter(all_commands).most_common(10)
