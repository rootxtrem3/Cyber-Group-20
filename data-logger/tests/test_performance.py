# tests/test_performance.py
import time
import asyncio
import unittest
from log_processor.log_parser import LogParser
from log_processor.data_enricher import DataEnricher

class TestPerformance(unittest.TestCase):
    def setUp(self):
        self.parser = LogParser()
        self.enricher = DataEnricher()
        self.test_events = self._generate_test_events(1000)
    
    def _generate_test_events(self, count):
        """Generate test events for performance testing"""
        events = []
        for i in range(count):
            events.append({
                "timestamp": f"2024-01-01T10:00:{i:02d}Z",
                "eventid": "cowrie.login.success",
                "src_ip": f"192.168.1.{i % 255}",
                "session": f"session_{i}",
                "username": "admin",
                "password": "password123"
            })
        return events
    
    def test_parsing_performance(self):
        """Test log parsing performance"""
        start_time = time.time()
        
        for event in self.test_events:
            log_line = json.dumps(event)
            self.parser.parse_cowrie_log(log_line)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Should process 1000 events in under 1 second
        self.assertLess(processing_time, 1.0)
        print(f"Parsed 1000 events in {processing_time:.3f} seconds")
    
    def test_enrichment_performance(self):
        """Test data enrichment performance"""
        parsed_events = []
        for event in self.test_events[:100]:  # Use subset for GeoIP testing
            log_line = json.dumps(event)
            parsed = self.parser.parse_cowrie_log(log_line)
            if parsed:
                parsed_events.append(parsed)
        
        start_time = time.time()
        
        for event in parsed_events:
            self.enricher.enrich_event(event)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Should process 100 events in under 2 seconds (including GeoIP lookups)
        self.assertLess(processing_time, 2.0)
        print(f"Enriched 100 events in {processing_time:.3f} seconds")

if __name__ == "__main__":
    unittest.main()
