# main.py
import asyncio
import logging
import time
from datetime import datetime
from log_processor.log_parser import LogParser
from log_processor.data_enricher import DataEnricher
from log_processor.database_handler import DatabaseHandler
from log_processor.websocket_server import WebSocketServer

class LogProcessor:
    def __init__(self):
        self.setup_logging()
        
        # Initialize components
        self.db_handler = DatabaseHandler()
        self.log_parser = LogParser()
        self.data_enricher = DataEnricher()
        self.websocket_server = WebSocketServer()
        
        # Statistics
        self.stats = {
            "events_processed": 0,
            "events_failed": 0,
            "last_processed": None
        }
    
    def setup_logging(self):
        """Configure logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/app/logs/processor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    async def process_cowrie_logs(self):
        """Process Cowrie log files (simulated - replace with actual log monitoring)"""
        self.logger.info("Starting Cowrie log processing...")
        
        # In production, this would watch log files
        # For now, we'll simulate by polling the database for new raw events
        last_check = datetime.now()
        
        while True:
            try:
                # Check for new raw events (simulated from Cowrie)
                new_events = self._get_new_raw_events(last_check)
                
                for raw_event in new_events:
                    await self.process_single_event(raw_event)
                
                last_check = datetime.now()
                
                # Update statistics every 30 seconds
                if self.stats["events_processed"] % 10 == 0:
                    await self.broadcast_statistics()
                
                await asyncio.sleep(2)  # Poll every 2 seconds
                
            except Exception as e:
                self.logger.error(f"Error in log processing loop: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    def _get_new_raw_events(self, since_time):
        """Simulate getting new raw events (replace with actual log file reading)"""
        # This is a simulation - in real implementation, you would:
        # 1. Watch Cowrie log files using watchdog or similar
        # 2. Parse new lines as they appear
        # 3. Convert to raw event format
        
        # For now, return empty list - actual implementation depends on Cowrie setup
        return []
    
    async def process_single_event(self, raw_event):
        """Process a single raw event through the entire pipeline"""
        try:
            # Parse the event
            if raw_event.get("honeypot_type") == "cowrie":
                parsed_event = self.log_parser.parse_cowrie_log(raw_event.get("log_line", ""))
            else:
                parsed_event = self.log_parser.parse_http_log(raw_event)
            
            if not parsed_event:
                self.stats["events_failed"] += 1
                return
            
            # Store raw event for backup
            self.db_handler.insert_raw_event(raw_event)
            
            # Enrich with GeoIP and risk scoring
            enriched_event = self.data_enricher.enrich_event(parsed_event)
            
            # Store in database
            event_id = self.db_handler.insert_event(enriched_event)
            
            if event_id:
                self.stats["events_processed"] += 1
                self.stats["last_processed"] = datetime.now().isoformat()
                
                # Broadcast via WebSocket for real-time dashboard
                await self.websocket_server.broadcast_event(enriched_event)
                
                self.logger.info(f"Processed event: {enriched_event.get('event_type')} from {enriched_event.get('source_ip')}")
            else:
                self.stats["events_failed"] += 1
                self.logger.error("Failed to store event in database")
                
        except Exception as e:
            self.stats["events_failed"] += 1
            self.logger.error(f"Error processing event: {e}")
    
    async def broadcast_statistics(self):
        """Broadcast current statistics to dashboard"""
        try:
            stats = self.db_handler.get_attack_statistics(hours=24)
            stats.update({
                "events_processed": self.stats["events_processed"],
                "events_failed": self.stats["events_failed"],
                "last_processed": self.stats["last_processed"],
                "connected_clients": len(self.websocket_server.connected_clients)
            })
            
            await self.websocket_server.broadcast_stats(stats)
            
        except Exception as e:
            self.logger.error(f"Error broadcasting statistics: {e}")
    
    async def run(self):
        """Main entry point"""
        self.logger.info("Starting Data Logger & Parser service...")
        
        # Start WebSocket server
        ws_task = asyncio.create_task(self.websocket_server.start_server())
        
        # Start log processing
        processing_task = asyncio.create_task(self.process_cowrie_logs())
        
        # Wait for both tasks (they should run indefinitely)
        try:
            await asyncio.gather(ws_task, processing_task)
        except KeyboardInterrupt:
            self.logger.info("Shutdown signal received...")
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}")
        finally:
            await self.websocket_server.stop_server()
            self.logger.info("Data Logger & Parser service stopped.")

if __name__ == "__main__":
    processor = LogProcessor()
    asyncio.run(processor.run())
