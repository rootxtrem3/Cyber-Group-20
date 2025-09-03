# app/redis_publisher.py
import redis
import json
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)

class RedisPublisher:
    def __init__(self):
        self.redis_client = None
        self.channel_name = os.getenv('REDIS_CHANNEL', 'honeypot-events')
        self._connect()
    
    def _connect(self):
        """Establish connection to Redis"""
        try:
            redis_host = os.getenv('REDIS_HOST', 'localhost')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_db = int(os.getenv('REDIS_DB', 0))
            
            self.redis_client = redis.Redis(
                host=redis_host, 
                port=redis_port, 
                db=redis_db,
                decode_responses=True
            )
            
            # Test connection
            self.redis_client.ping()
            logger.info(f"Connected to Redis at {redis_host}:{redis_port}")
            
        except redis.ConnectionError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def publish_event(self, event):
        """Publish event to Redis channel"""
        if not self.redis_client:
            logger.error("Cannot publish event: Not connected to Redis")
            return False
        
        try:
            # Add publishing timestamp
            event['published_at'] = datetime.utcnow().isoformat()
            
            # Serialize and publish
            serialized_event = json.dumps(event, default=str)
            self.redis_client.publish(self.channel_name, serialized_event)
            
            logger.debug(f"Published event to Redis channel {self.channel_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error publishing event to Redis: {e}")
            return False
    
    def close(self):
        """Close Redis connection"""
        if self.redis_client:
            self.redis_client.close()
            logger.info("Redis connection closed")
