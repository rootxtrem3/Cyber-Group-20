# app/enricher.py
import geoip2.database
import maxminddb
from ipaddress import ip_address, IPv4Address
import logging
import os

logger = logging.getLogger(__name__)

class DataEnricher:
    def __init__(self):
        self.geoip_reader = None
        self._init_geoip()
        
        # Known malicious username/password combinations
        self.malicious_creds = [
            ('admin', 'admin'),
            ('root', 'root'),
            ('admin', '1234'),
            ('admin', 'password'),
            ('root', 'password'),
            ('user', 'user'),
            ('test', 'test'),
            ('guest', 'guest'),
            ('support', 'support')
        ]
        
        # Suspicious commands often used in attacks
        self.suspicious_commands = [
            'wget', 'curl', 'chmod', 'rm ', 'mkdir', 'cd /', 'passwd', 
            'cat /etc/passwd', 'chroot', 'dd if=', 'nc ', 'netcat',
            'python -c', 'perl -e', 'php ', 'exec ', 'eval(', 'base64 -d'
        ]
    
    def _init_geoip(self):
        """Initialize GeoIP database reader"""
        try:
            geoip_path = os.getenv('GEOIP_DB_PATH', '/data/GeoLite2-City.mmdb')
            self.geoip_reader = geoip2.database.Reader(geoip_path)
            logger.info("GeoIP database initialized successfully")
        except (FileNotFoundError, maxminddb.InvalidDatabaseError) as e:
            logger.warning(f"Could not load GeoIP database: {e}")
            self.geoip_reader = None
    
    def enrich_event(self, event):
        """Add enrichment data to event"""
        if not event or 'source_ip' not in event:
            return event
        
        # Add GeoIP information
        event = self._add_geoip_data(event)
        
        # Calculate risk score
        event['risk_score'] = self._calculate_risk_score(event)
        
        # Add additional metadata
        event['enriched_at'] = datetime.utcnow().isoformat()
        
        return event
    
    def _add_geoip_data(self, event):
        """Add geographical information based on IP address"""
        if not self.geoip_reader:
            return event
        
        try:
            ip = event['source_ip']
            # Skip private IP addresses
            if ip_address(ip).is_private:
                event['geoip'] = {'error': 'Private IP address'}
                return event
            
            response = self.geoip_reader.city(ip)
            event['geoip'] = {
                'country': response.country.name,
                'country_code': response.country.iso_code,
                'city': response.city.name,
                'latitude': response.location.latitude,
                'longitude': response.location.longitude,
                'accuracy_radius': response.location.accuracy_radius
            }
        except Exception as e:
            logger.debug(f"Could not geolocate IP {event['source_ip']}: {e}")
            event['geoip'] = {'error': str(e)}
        
        return event
    
    def _calculate_risk_score(self, event):
        """Calculate a risk score for the event (0-100)"""
        score = 0
        
        # Login attempts with known malicious credentials
        if (event.get('event_type') == 'login_attempt' and 
            'credentials' in event):
            username = event['credentials'].get('username', '')
            password = event['credentials'].get('password', '')
            
            if (username, password) in self.malicious_creds:
                score += 30
                
            if username in ['root', 'admin']:
                score += 20
                
            if not username or not password:
                score += 10
        
        # SSH connection attempts
        if event.get('protocol') == 'ssh':
            score += 10
            
        # Telnet connection attempts (often more suspicious)
        if event.get('protocol') == 'telnet':
            score += 15
        
        # Command execution
        if event.get('event_type') == 'command_input':
            score += 20
            
            # Check for suspicious commands
            cmd = event.get('input', '').lower()
            for suspicious_cmd in self.suspicious_commands:
                if suspicious_cmd in cmd:
                    score += 25
                    break
        
        # HTTP requests to sensitive paths
        if event.get('event_type') == 'http_request':
            url = event.get('url', '').lower()
            sensitive_paths = ['/admin', '/config', '/login', '/shell', '/cmd']
            if any(path in url for path in sensitive_paths):
                score += 20
            
            # Suspicious user agents
            ua = event.get('user_agent', '').lower()
            if 'sqlmap' in ua or 'nikto' in ua or 'nessus' in ua:
                score += 30
        
        # Cap at 100
        return min(score, 100)
    
    def close(self):
        """Clean up resources"""
        if self.geoip_reader:
            self.geoip_reader.close()
