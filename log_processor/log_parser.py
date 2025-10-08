# log_processor/log_parser.py
import json
import re
import logging
from datetime import datetime
from typing import Dict, Any, Optional

class LogParser:
    def __init__(self):
        self.cowrie_patterns = {
            'login_success': r'cowrie\.login\.success',
            'login_failed': r'cowrie\.login\.failed',
            'command_input': r'cowrie\.command\.input',
            'session_closed': r'cowrie\.session\.closed',
            'direct_tcpip': r'cowrie\.direct-tcpip'
        }
        
    def parse_cowrie_log(self, log_line: str) -> Optional[Dict[str, Any]]:
        """
        Parse Cowrie JSON log lines into canonical event format
        """
        try:
            raw_event = json.loads(log_line.strip())
            return self._normalize_cowrie_event(raw_event)
        except json.JSONDecodeError as e:
            logging.warning(f"Failed to parse JSON log line: {e}")
            return None
        except Exception as e:
            logging.error(f"Unexpected error parsing log: {e}")
            return None
    
    def _normalize_cowrie_event(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize Cowrie event to canonical schema"""
        canonical_event = {
            "timestamp": raw_event.get("timestamp", datetime.now().isoformat()),
            "event_type": raw_event.get("eventid", "unknown"),
            "source_ip": raw_event.get("src_ip", "unknown"),
            "session": raw_event.get("session", ""),
            "protocol": raw_event.get("protocol", ""),
            "credentials": self._extract_credentials(raw_event),
            "commands": raw_event.get("input", ""),
            "payload": self._extract_payload(raw_event),
            "honeypot_type": "cowrie",
            "raw_data": raw_event  # Keep original for debugging
        }
        
        return canonical_event
    
    def _extract_credentials(self, event: Dict[str, Any]) -> Dict[str, str]:
        """Extract username and password from login events"""
        credentials = {}
        
        if event.get("eventid") in ["cowrie.login.success", "cowrie.login.failed"]:
            credentials = {
                "username": event.get("username", ""),
                "password": event.get("password", "")
            }
        
        return credentials
    
    def _extract_payload(self, event: Dict[str, Any]) -> str:
        """Extract relevant payload information"""
        payload_fields = ["message", "input", "request", "url"]
        payload = ""
        
        for field in payload_fields:
            if field in event and event[field]:
                payload = str(event[field])
                break
        
        return payload
    
    def parse_http_log(self, http_event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse HTTP honeypot events into canonical format
        """
        canonical_event = {
            "timestamp": http_event.get("timestamp", datetime.now().isoformat()),
            "event_type": f"http_{http_event.get('method', 'request').lower()}",
            "source_ip": http_event.get("ip", "unknown"),
            "session": http_event.get("session_id", ""),
            "protocol": "http",
            "credentials": self._extract_http_credentials(http_event),
            "commands": "",
            "payload": self._extract_http_payload(http_event),
            "honeypot_type": "http",
            "raw_data": http_event
        }
        
        return canonical_event
    
    def _extract_http_credentials(self, event: Dict[str, Any]) -> Dict[str, str]:
        """Extract credentials from HTTP requests"""
        credentials = {}
        body = event.get("body", {})
        
        if isinstance(body, dict):
            if "username" in body:
                credentials["username"] = body["username"]
            if "password" in body:
                credentials["password"] = body["password"]
        
        return credentials
    
    def _extract_http_payload(self, event: Dict[str, Any]) -> str:
        """Extract HTTP request payload"""
        payload_parts = []
        
        if event.get("url"):
            payload_parts.append(f"URL: {event['url']}")
        if event.get("method"):
            payload_parts.append(f"Method: {event['method']}")
        if event.get("userAgent"):
            payload_parts.append(f"User-Agent: {event['userAgent']}")
        
        return " | ".join(payload_parts)
