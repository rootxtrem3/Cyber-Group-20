# app/parser.py
import json
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class LogParser:
    def __init__(self):
        self.cowrie_patterns = {
            'login_attempt': r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z).*?login attempt \[(.*?)/(.*?)\]',
            'command_input': r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z).*?CMD: (.*?)',
            'session_closed': r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z).*?Connection lost',
        }
    
    def parse_cowrie_line(self, line):
        """
        Parse a line from Cowrie log
        Returns a dictionary with parsed data or None if not a valid log entry
        """
        try:
            # Try to parse as JSON first (newer Cowrie versions)
            if line.strip().startswith('{'):
                return self._parse_json_log(line)
            
            # Fall back to text parsing (older Cowrie versions)
            return self._parse_text_log(line)
            
        except Exception as e:
            logger.error(f"Error parsing log line: {e}")
            return None
    
    def _parse_json_log(self, line):
        """Parse JSON-formatted Cowrie log entry"""
        try:
            data = json.loads(line)
            event = {
                'timestamp': datetime.fromtimestamp(data['timestamp']),
                'event_type': data['eventid'],
                'source_ip': data['src_ip'],
                'source_port': data['src_port'],
                'session': data['session'],
                'protocol': data.get('protocol', 'unknown'),
                'raw': data
            }
            
            # Add specific fields based on event type
            if data['eventid'] == 'cowrie.login.success':
                event['credentials'] = {
                    'username': data.get('username'),
                    'password': data.get('password')
                }
            elif data['eventid'] == 'cowrie.command.input':
                event['input'] = data.get('input', '')
            elif data['eventid'] == 'cowrie.session.closed':
                event['duration'] = data.get('duration', 0)
            
            return event
            
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse JSON log line: {line}")
            return None
    
    def _parse_text_log(self, line):
        """Parse text-based Cowrie log entry"""
        # Check for login attempts
        login_match = re.search(self.cowrie_patterns['login_attempt'], line)
        if login_match:
            return {
                'timestamp': datetime.strptime(login_match.group(1), '%Y-%m-%dT%H:%M:%S.%fZ'),
                'event_type': 'login_attempt',
                'credentials': {
                    'username': login_match.group(2),
                    'password': login_match.group(3)
                },
                'raw': line
            }
        
        # Check for command input
        cmd_match = re.search(self.cowrie_patterns['command_input'], line)
        if cmd_match:
            return {
                'timestamp': datetime.strptime(cmd_match.group(1), '%Y-%m-%dT%H:%M:%S.%fZ'),
                'event_type': 'command_input',
                'input': cmd_match.group(2),
                'raw': line
            }
        
        # Check for session closed
        session_match = re.search(self.cowrie_patterns['session_closed'], line)
        if session_match:
            return {
                'timestamp': datetime.strptime(session_match.group(1), '%Y-%m-%dT%H:%M:%S.%fZ'),
                'event_type': 'session_closed',
                'raw': line
            }
        
        logger.debug(f"Unrecognized log format: {line}")
        return None
    
    def parse_http_log(self, line):
        """
        Parse HTTP honeypot log line
        Expected format: JSON log entries from the HTTP honeypot
        """
        try:
            data = json.loads(line)
            event = {
                'timestamp': datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')),
                'event_type': 'http_request',
                'source_ip': data['ip'],
                'method': data['method'],
                'url': data['url'],
                'headers': data.get('headers', {}),
                'user_agent': data.get('headers', {}).get('user-agent', ''),
                'raw': data
            }
            return event
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Error parsing HTTP log: {e}")
            return None
