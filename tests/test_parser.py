# tests/test_parser.py
import unittest
from datetime import datetime
from app.parser import LogParser

class TestParser(unittest.TestCase):
    def setUp(self):
        self.parser = LogParser()
    
    def test_parse_cowrie_json_log(self):
        log_line = '{"timestamp": 1640995200, "eventid": "cowrie.login.success", "src_ip": "192.168.1.1", "src_port": 54321, "session": "abc123", "protocol": "ssh", "username": "admin", "password": "password"}'
        
        result = self.parser.parse_cowrie_line(log_line)
        
        self.assertIsNotNone(result)
        self.assertEqual(result['event_type'], 'cowrie.login.success')
        self.assertEqual(result['source_ip'], '192.168.1.1')
        self.assertEqual(result['credentials']['username'], 'admin')
        self.assertEqual(result['credentials']['password'], 'password')
    
    def test_parse_http_log(self):
        log_line = '{"timestamp": "2022-01-01T12:00:00Z", "ip": "192.168.1.1", "method": "GET", "url": "/admin", "headers": {"user-agent": "Mozilla/5.0"}}'
        
        result = self.parser.parse_http_log(log_line)
        
        self.assertIsNotNone(result)
        self.assertEqual(result['event_type'], 'http_request')
        self.assertEqual(result['source_ip'], '192.168.1.1')
        self.assertEqual(result['method'], 'GET')
        self.assertEqual(result['url'], '/admin')

if __name__ == '__main__':
    unittest.main()
