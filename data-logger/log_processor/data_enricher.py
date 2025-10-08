# log_processor/data_enricher.py
import geoip2.database
import geoip2.errors
from datetime import datetime
import logging
import os
from typing import Dict, Any

class DataEnricher:
    def __init__(self, geoip_db_path="/app/GeoLite2-City.mmdb"):
        self.geoip_reader = self._init_geoip(geoip_db_path)
        self.risk_rules = self._load_risk_rules()
    
    def _init_geoip(self, db_path: str) -> geoip2.database.Reader:
        """Initialize GeoIP database reader"""
        try:
            if os.path.exists(db_path):
                return geoip2.database.Reader(db_path)
            else:
                logging.warning(f"GeoIP database not found at {db_path}")
                return None
        except Exception as e:
            logging.error(f"Failed to initialize GeoIP database: {e}")
            return None
    
    def _load_risk_rules(self) -> Dict[str, Any]:
        """Define risk scoring rules"""
        return {
            "high_risk_commands": [
                "wget", "curl", "rm -rf", "chmod 777", "passwd",
                "useradd", "adduser", "iptables", "firewall-cmd"
            ],
            "suspicious_usernames": [
                "admin", "root", "user", "test", "guest"
            ],
            "bruteforce_indicators": {
                "max_attempts_per_ip": 5,
                "time_window_minutes": 10
            }
        }
    
    def enrich_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich event with GeoIP and risk scoring"""
        # GeoIP enrichment
        enriched_event = event.copy()
        enriched_event["enrichment"] = self._get_geoip_info(event.get("source_ip"))
        
        # Risk scoring
        enriched_event["risk_score"] = self._calculate_risk_score(enriched_event)
        enriched_event["risk_level"] = self._get_risk_level(enriched_event["risk_score"])
        
        return enriched_event
    
    def _get_geoip_info(self, ip_address: str) -> Dict[str, Any]:
        """Get GeoIP information for an IP address"""
        if not self.geoip_reader or not ip_address or ip_address == "unknown":
            return {"country": "Unknown", "city": "Unknown"}
        
        try:
            response = self.geoip_reader.city(ip_address)
            return {
                "country": response.country.name or "Unknown",
                "city": response.city.name or "Unknown",
                "latitude": response.location.latitude,
                "longitude": response.location.longitude,
                "timezone": response.location.time_zone or "Unknown"
            }
        except (geoip2.errors.AddressNotFoundError, ValueError):
            return {"country": "Unknown", "city": "Unknown"}
        except Exception as e:
            logging.error(f"GeoIP lookup error for {ip_address}: {e}")
            return {"country": "Unknown", "city": "Unknown"}
    
    def _calculate_risk_score(self, event: Dict[str, Any]) -> int:
        """Calculate risk score from 0-100"""
        score = 0
        
        # Event type scoring
        event_type = event.get("event_type", "")
        if "login.success" in event_type:
            score += 40
        elif "login.failed" in event_type:
            score += 20
        elif "command.input" in event_type:
            score += 30
        
        # Command risk scoring
        commands = event.get("commands", "").lower()
        for risky_cmd in self.risk_rules["high_risk_commands"]:
            if risky_cmd in commands:
                score += 25
                break
        
        # Credential risk scoring
        credentials = event.get("credentials", {})
        if credentials.get("username") in self.risk_rules["suspicious_usernames"]:
            score += 15
        
        # Protocol risk
        if event.get("protocol") in ["ssh", "telnet"]:
            score += 10
        
        return min(score, 100)  # Cap at 100
    
    def _get_risk_level(self, risk_score: int) -> str:
        """Convert risk score to level"""
        if risk_score >= 70:
            return "HIGH"
        elif risk_score >= 40:
            return "MEDIUM"
        elif risk_score >= 20:
            return "LOW"
        else:
            return "INFO"
