# app/database.py
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017/')
            self.client = MongoClient(mongodb_url)
            self.db = self.client.honeypot
            
            # Test the connection
            self.client.admin.command('ismaster')
            logger.info("Successfully connected to MongoDB")
            
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        return self.db[collection_name]
    
    def insert_event(self, collection_name, event):
        """Insert an event into the specified collection"""
        try:
            collection = self.get_collection(collection_name)
            result = collection.insert_one(event)
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error inserting event: {e}")
            return None
    
    def close(self):
        """Close the database connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

# Singleton instance
db_manager = DatabaseManager()
