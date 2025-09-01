# app/models.py
from datetime import datetime
from pymongo import IndexModel, ASCENDING, DESCENDING
from app.database import db_manager

class EventModel:
    def __init__(self):
        self.collection = db_manager.get_collection('events')
        self._create_indexes()
    
    def _create_indexes(self):
        """Create necessary indexes for efficient querying"""
        indexes = [
            IndexModel([('timestamp', DESCENDING)]),
            IndexModel([('source_ip', ASCENDING)]),
            IndexModel([('event_type', ASCENDING)]),
            IndexModel([('risk_score', DESCENDING)]),
            IndexModel([('geoip.country_code', ASCENDING)]),
            IndexModel([('timestamp', ASCENDING), ('source_ip', ASCENDING)])
        ]
        self.collection.create_indexes(indexes)
    
    def insert(self, event_data):
        """Insert a new event"""
        # Add timestamp if not present
        if 'timestamp' not in event_data:
            event_data['timestamp'] = datetime.utcnow()
        
        return db_manager.insert_event('events', event_data)
    
    def get_events(self, filters=None, limit=100, skip=0):
        """Retrieve events with optional filters"""
        if filters is None:
            filters = {}
        
        return list(self.collection.find(filters).sort('timestamp', -1).limit(limit).skip(skip))
    
    def get_event_count(self, filters=None):
        """Count events matching filters"""
        if filters is None:
            filters = {}
        
        return self.collection.count_documents(filters)
    
    def get_unique_ips(self, time_range_hours=24):
        """Get count of unique IP addresses in the specified time range"""
        from datetime import datetime, timedelta
        
        time_threshold = datetime.utcnow() - timedelta(hours=time_range_hours)
        pipeline = [
            {'$match': {'timestamp': {'$gte': time_threshold}}},
            {'$group': {'_id': '$source_ip'}},
            {'$count': 'unique_ips'}
        ]
        
        result = list(self.collection.aggregate(pipeline))
        return result[0]['unique_ips'] if result else 0
