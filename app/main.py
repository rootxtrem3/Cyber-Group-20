# app/main.py
import time
import logging
import signal
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from app.parser import LogParser
from app.enricher import DataEnricher
from app.redis_publisher import RedisPublisher
from app.models import EventModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/data_processor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class LogFileHandler(FileSystemEventHandler):
    def __init__(self, file_path, parser, enricher, publisher, model):
        self.file_path = file_path
        self.parser = parser
        self.enricher = enricher
        self.publisher = publisher
        self.model = model
        self.position = 0
        
        # Start from the end of the file if it exists
        try:
            with open(self.file_path, 'r') as f:
                f.seek(0, 2)  # Seek to end
                self.position = f.tell()
        except FileNotFoundError:
            logger.warning(f"Log file {file_path} does not exist yet")
            self.position = 0
    
    def on_modified(self, event):
        if event.src_path == self.file_path:
            self.process_new_lines()
    
    def process_new_lines(self):
        """Process new lines in the log file"""
        try:
            with open(self.file_path, 'r') as f:
                f.seek(self.position)
                lines = f.readlines()
                
                if lines:
                    logger.info(f"Processing {len(lines)} new lines from {self.file_path}")
                    
                    for line in lines:
                        line = line.strip()
                        if line:
                            self.process_line(line)
                    
                    # Update position
                    self.position = f.tell()
                    
        except FileNotFoundError:
            logger.warning(f"Log file {self.file_path} not found")
        except Exception as e:
            logger.error(f"Error processing log file: {e}")
    
    def process_line(self, line):
        """Process a single log line"""
        try:
            # Parse the log line
            if 'cowrie' in self.file_path.lower():
                event = self.parser.parse_cowrie_line(line)
            else:
                event = self.parser.parse_http_log(line)
            
            if not event:
                return
            
            # Enrich the event
            enriched_event = self.enricher.enrich_event(event)
            
            # Store in database
            if enriched_event:
                self.model.insert(enriched_event)
                
                # Publish to Redis for real-time processing
                self.publisher.publish_event(enriched_event)
                
        except Exception as e:
            logger.error(f"Error processing log line: {e}")

def main():
    """Main application function"""
    # Initialize components
    parser = LogParser()
    enricher = DataEnricher()
    publisher = RedisPublisher()
    model = EventModel()
    
    # Define log files to monitor
    log_files = [
        '/app/logs/cowrie.json',
        '/app/logs/http-access.log'
    ]
    
    # Set up file observers
    observers = []
    for log_file in log_files:
        event_handler = LogFileHandler(log_file, parser, enricher, publisher, model)
        observer = Observer()
        observer.schedule(event_handler, path='/app/logs', recursive=False)
        observers.append(observer)
    
    # Start observers
    for observer in observers:
        observer.start()
        logger.info(f"Started monitoring {observer}")
    
    # Handle graceful shutdown
    def signal_handler(sig, frame):
        logger.info("Shutting down...")
        for observer in observers:
            observer.stop()
        enricher.close()
        publisher.close()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Initial processing of existing content
    for observer in observers:
        for handler in observer._handlers.values():
            for event_handler in handler:
                if hasattr(event_handler, 'process_new_lines'):
                    event_handler.process_new_lines()
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == '__main__':
    main()
