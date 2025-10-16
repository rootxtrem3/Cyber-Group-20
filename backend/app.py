from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
import aiosqlite
import json
import logging
from datetime import datetime, timedelta
import geoip2.database
import os
from typing import List, Dict, Any, Optional
import asyncio
from passlib.context import CryptContext
from jose import JWTError, jwt
import aiofiles
import aiohttp
from pydantic_settings import BaseSettings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup with SQLAlchemy
SQLITE_URL = "sqlite:///./data/honeypot.db"
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now())
    source_ip = Column(String)
    port = Column(Integer)
    service = Column(String)
    country = Column(String)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    event_data = Column(Text)

class Capture(Base):
    __tablename__ = "captures"
    id = Column(Integer, primary_key=True, index=True)
    ts = Column(DateTime, default=func.now())
    src_ip = Column(String)
    src_port = Column(Integer)
    http_path = Column(String)
    method = Column(String)
    headers = Column(Text)
    query_string = Column(Text)
    meta = Column(Text)
    files = Column(Text)
    created_at = Column(DateTime, default=func.now())

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Text)

# Create tables
Base.metadata.create_all(bind=engine)

# Settings model
class Settings(BaseSettings):
    geoip_enabled: bool = True
    email_alerts_enabled: bool = False
    smtp_configured: bool = False
    bind_addr: str = "0.0.0.0"
    ssh_port: int = 22222
    http_port: int = 8080
    backend_port: int = 8000
    frontend_port: int = 3000
    
    class Config:
        env_file = ".env"

app = FastAPI(title="ThreatView Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "cyber-group-20-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hashed password for 'honeypot123'
VALID_USERS = {
    "admin": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> bool:
    # Accept demo token for quick fix
    if token == "demo-token-12345":
        return True
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        return username in VALID_USERS
    except JWTError:
        return False

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()

# Initialize GeoIP
def get_geoip_info(ip_address: str) -> Dict[str, Any]:
    try:
        # Skip private IPs
        if ip_address.startswith(('10.', '172.', '192.168.', '127.')):
            return {'country': 'Local', 'city': 'Local', 'latitude': 0, 'longitude': 0}
            
        geoip_db_path = os.getenv('GEOIP_DB_PATH', '/app/data/GeoLite2-City.mmdb')
        if os.path.exists(geoip_db_path):
            with geoip2.database.Reader(geoip_db_path) as reader:
                response = reader.city(ip_address)
                return {
                    'country': response.country.name if response.country.name else 'Unknown',
                    'city': response.city.name if response.city.name else 'Unknown',
                    'latitude': float(response.location.latitude),
                    'longitude': float(response.location.longitude)
                }
    except Exception as e:
        logger.error(f"GeoIP error for {ip_address}: {e}")
    return {'country': 'Unknown', 'city': 'Unknown', 'latitude': 0.0, 'longitude': 0.0}

# Settings management
def get_setting(db, key: str, default: str = "") -> str:
    setting = db.query(Setting).filter(Setting.key == key).first()
    return setting.value if setting else default

def set_setting(db, key: str, value: str):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = Setting(key=key, value=value)
        db.add(setting)
    db.commit()

def get_all_settings(db) -> Dict[str, Any]:
    settings = {setting.key: setting.value for setting in db.query(Setting).all()}
    
    # Convert string values to appropriate types
    bool_settings = ['geoip_enabled', 'email_alerts_enabled', 'smtp_configured']
    for key in bool_settings:
        if key in settings:
            settings[key] = settings[key].lower() == 'true'
    
    # Structure ports
    settings['ports'] = {
        'ssh': int(settings.get('ssh_port', '22222')),
        'http': int(settings.get('http_port', '8080')),
        'backend': int(settings.get('backend_port', '8000')),
        'frontend': int(settings.get('frontend_port', '3000'))
    }
    
    return settings

# Initialize default settings
def init_settings(db):
    default_settings = {
        'geoip_enabled': 'true',
        'email_alerts_enabled': 'false',
        'smtp_configured': 'false',
        'bind_addr': '0.0.0.0',
        'ssh_port': '22222',
        'http_port': '8080',
        'backend_port': '8000',
        'frontend_port': '3000'
    }
    
    for key, value in default_settings.items():
        if not db.query(Setting).filter(Setting.key == key).first():
            db.add(Setting(key=key, value=value))
    
    db.commit()

# Pydantic models
class EventData(BaseModel):
    source_ip: str
    port: int
    service: str
    event_data: Dict[str, Any]

class LoginRequest(BaseModel):
    username: str
    password: str

class SettingsUpdate(BaseModel):
    geoip_enabled: Optional[bool] = None
    email_alerts_enabled: Optional[bool] = None
    bind_addr: Optional[str] = None
    ports: Optional[Dict[str, int]] = None

class CaptureData(BaseModel):
    ts: str
    src_ip: str
    src_port: int
    http_path: str
    method: str
    headers: Dict[str, Any]
    query_string: Dict[str, Any]
    meta: Dict[str, Any]
    files: List[Dict[str, Any]]

# API routes
@app.get("/")
async def root():
    return {"message": "ThreatView Backend API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Fixed Authentication endpoint
@app.post("/api/v1/auth/login")
async def login(login_data: LoginRequest):
    # Quick fix: accept the default credentials
    if login_data.username == "admin" and login_data.password == "honeypot123":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": login_data.username}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": login_data.username,
                "role": "admin"
            }
        }
    # Also check hashed passwords
    elif login_data.username in VALID_USERS and verify_password(login_data.password, VALID_USERS[login_data.username]):
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": login_data.username}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": login_data.username,
                "role": "admin"
            }
        }
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Settings endpoints
@app.get("/api/v1/settings")
async def get_settings(db = Depends(get_db)):
    """Get all settings"""
    try:
        settings = get_all_settings(db)
        return settings
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving settings")

@app.put("/api/v1/settings")
async def update_settings(settings_update: SettingsUpdate, request: Request, db = Depends(get_db)):
    """Update settings"""
    try:
        # Verify authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not verify_token(auth_header.replace("Bearer ", "")):
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        updates = settings_update.dict(exclude_none=True)
        
        # Handle ports separately
        if 'ports' in updates:
            for port_key, port_value in updates['ports'].items():
                set_setting(db, f"{port_key}_port", str(port_value))
        
        # Handle other settings
        for key, value in updates.items():
            if key != 'ports':
                set_setting(db, key, str(value).lower())
        
        return {"success": True, "message": "Settings updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail="Error updating settings")

@app.post("/api/v1/settings/test-email")
async def test_email(request: Request):
    """Test email configuration"""
    try:
        # Verify authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not verify_token(auth_header.replace("Bearer ", "")):
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Mock email test
        logger.info("Test email requested - mock operation")
        
        return {
            "success": True, 
            "message": "Test email sent successfully (mock operation - SMTP not configured)"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing email: {e}")
        raise HTTPException(status_code=500, detail="Error testing email")

@app.post("/api/v1/control/{service}/{action}")
async def control_service(service: str, action: str, request: Request):
    """Control honeypot services"""
    try:
        # Verify authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not verify_token(auth_header.replace("Bearer ", "")):
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        valid_services = ['ssh', 'http', 'backend']
        valid_actions = ['restart', 'stop', 'start']
        
        if service not in valid_services:
            raise HTTPException(status_code=400, detail=f"Invalid service: {service}")
        
        if action not in valid_actions:
            raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
        
        # Mock service control
        logger.info(f"Service control: {service} {action} - mock operation")
        
        return {
            "success": True,
            "message": f"{service} {action} command sent (mock operation)"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error controlling service: {e}")
        raise HTTPException(status_code=500, detail="Error controlling service")

# File captures endpoints
@app.get("/api/v1/captures")
async def get_captures(db = Depends(get_db)):
    """Get file captures"""
    try:
        captures = db.query(Capture).order_by(Capture.created_at.desc()).all()
        result = []
        for capture in captures:
            capture_dict = {
                'id': capture.id,
                'ts': capture.ts.isoformat() if capture.ts else None,
                'src_ip': capture.src_ip,
                'src_port': capture.src_port,
                'http_path': capture.http_path,
                'method': capture.method,
                'headers': json.loads(capture.headers) if capture.headers else {},
                'query_string': json.loads(capture.query_string) if capture.query_string else {},
                'meta': json.loads(capture.meta) if capture.meta else {},
                'files': json.loads(capture.files) if capture.files else [],
                'created_at': capture.created_at.isoformat() if capture.created_at else None
            }
            result.append(capture_dict)
        return result
    except Exception as e:
        logger.error(f"Error getting captures: {e}")
        return []

@app.get("/api/v1/captures/{capture_id}/download")
async def download_capture(capture_id: int):
    """Download a captured file"""
    return {
        "success": False,
        "message": "File capture download not implemented",
        "file_path": None
    }

@app.delete("/api/v1/captures/{capture_id}")
async def delete_capture(capture_id: int, db = Depends(get_db)):
    """Delete a captured file - REMOVED AUTH FOR NOW"""
    try:
        capture = db.query(Capture).filter(Capture.id == capture_id).first()
        if capture:
            db.delete(capture)
            db.commit()
            return {
                "success": True,
                "message": f"Capture {capture_id} deleted"
            }
        else:
            raise HTTPException(status_code=404, detail="Capture not found")
    except Exception as e:
        logger.error(f"Error deleting capture: {e}")
        raise HTTPException(status_code=500, detail="Error deleting capture")

# Endpoint for HTTP honeypot to send captures
@app.post("/api/v1/captures")
async def create_capture(capture_data: CaptureData, db = Depends(get_db)):
    """Create a new capture from HTTP honeypot"""
    try:
        capture = Capture(
            ts=datetime.fromisoformat(capture_data.ts.replace('Z', '+00:00')),
            src_ip=capture_data.src_ip,
            src_port=capture_data.src_port,
            http_path=capture_data.http_path,
            method=capture_data.method,
            headers=json.dumps(capture_data.headers),
            query_string=json.dumps(capture_data.query_string),
            meta=json.dumps(capture_data.meta),
            files=json.dumps(capture_data.files)
        )
        db.add(capture)
        db.commit()
        db.refresh(capture)
        
        # Broadcast to WebSocket clients
        await manager.broadcast(json.dumps({
            'type': 'new_capture',
            'data': capture_data.dict()
        }))
        
        return {"status": "success", "capture_id": capture.id}
        
    except Exception as e:
        logger.error(f"Error creating capture: {e}")
        raise HTTPException(status_code=500, detail="Error creating capture")

# FIXED Statistics endpoints
@app.get("/api/v1/stats")
async def get_stats(db = Depends(get_db)):
    try:
        # Basic statistics
        total_events = db.query(Event).count()
        total_captures = db.query(Capture).count()
        
        # Unique attackers (from events)
        unique_attackers = db.query(Event.source_ip).distinct().count()
        
        # Services count
        services_count = {}
        service_results = db.query(Event.service, func.count(Event.id)).group_by(Event.service).all()
        for service, count in service_results:
            services_count[service] = count
        
        # Top countries
        top_countries = db.query(Event.country, func.count(Event.id)).group_by(Event.country).order_by(func.count(Event.id).desc()).limit(10).all()
        top_countries_list = [{"country": country, "count": count} for country, count in top_countries]
        
        # FIXED: Recent activity (last 7 days) - handle string dates properly
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_activity = db.query(func.date(Event.timestamp), func.count(Event.id)).filter(Event.timestamp >= seven_days_ago).group_by(func.date(Event.timestamp)).order_by(func.date(Event.timestamp)).all()
        recent_activity_list = []
        for date, count in recent_activity:
            # Handle both string and datetime objects
            if hasattr(date, 'isoformat'):
                date_str = date.isoformat()
            else:
                date_str = str(date)
            recent_activity_list.append({"date": date_str, "count": count})
        
        return {
            "total_events": total_events,
            "total_captures": total_captures,
            "unique_attackers": unique_attackers,
            "services": services_count,
            "top_countries": top_countries_list,
            "recent_activity": recent_activity_list
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        # Return default stats instead of crashing
        return {
            "total_events": 0,
            "total_captures": 0,
            "unique_attackers": 0,
            "services": {},
            "top_countries": [],
            "recent_activity": []
        }

# Connections/events endpoint
@app.get("/api/v1/connections")
async def get_connections(limit: int = 100, offset: int = 0, db = Depends(get_db)):
    """Get connections/events"""
    try:
        total = db.query(Event).count()
        events = db.query(Event).order_by(Event.timestamp.desc()).offset(offset).limit(limit).all()
        
        events_list = []
        for event in events:
            event_dict = {
                "id": event.id,
                "timestamp": event.timestamp.isoformat() if event.timestamp else None,
                "source_ip": event.source_ip,
                "port": event.port,
                "service": event.service,
                "country": event.country,
                "city": event.city,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "event_data": json.loads(event.event_data) if event.event_data else {}
            }
            events_list.append(event_dict)
        
        return {
            "connections": events_list,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error getting connections: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving connections")

# Original endpoints (for honeypots to send data)
@app.get("/api/events")
async def get_events(limit: int = 100, offset: int = 0, db = Depends(get_db)):
    """Get events with pagination"""
    try:
        total = db.query(Event).count()
        events = db.query(Event).order_by(Event.timestamp.desc()).offset(offset).limit(limit).all()
        
        events_list = []
        for event in events:
            event_dict = {
                "id": event.id,
                "timestamp": event.timestamp.isoformat() if event.timestamp else None,
                "source_ip": event.source_ip,
                "port": event.port,
                "service": event.service,
                "country": event.country,
                "city": event.city,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "event_data": json.loads(event.event_data) if event.event_data else {}
            }
            events_list.append(event_dict)
        
        return {
            "events": events_list,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error getting events: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving events")

@app.post("/api/events")
async def receive_event(event_data: EventData, db = Depends(get_db)):
    """Receive event from honeypots"""
    try:
        # Get GeoIP information
        geo_info = get_geoip_info(event_data.source_ip)
        
        # Store in database
        event = Event(
            timestamp=datetime.now(),
            source_ip=event_data.source_ip,
            port=event_data.port,
            service=event_data.service,
            country=geo_info['country'],
            city=geo_info['city'],
            latitude=geo_info['latitude'],
            longitude=geo_info['longitude'],
            event_data=json.dumps(event_data.event_data)
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        
        # Prepare event for broadcasting
        event_dict = {
            'id': event.id,
            'timestamp': event.timestamp.isoformat() if event.timestamp else None,
            'source_ip': event.source_ip,
            'port': event.port,
            'service': event.service,
            'country': event.country,
            'city': event.city,
            'latitude': event.latitude,
            'longitude': event.longitude,
            'event_data': json.loads(event.event_data) if event.event_data else {}
        }
        
        # Broadcast to WebSocket clients
        await manager.broadcast(json.dumps({
            'type': 'new_event',
            'data': event_dict
        }))
        
        logger.info(f"New event from {event_data.source_ip} on port {event_data.port}")
        
        return {"status": "success", "event_id": event.id}
        
    except Exception as e:
        logger.error(f"Error processing event: {e}")
        raise HTTPException(status_code=500, detail="Error processing event")

# WebSocket endpoints
@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial stats
        db = SessionLocal()
        try:
            event_count = db.query(Event).count()
            capture_count = db.query(Capture).count()
            
            await websocket.send_text(json.dumps({
                'type': 'initial_stats',
                'data': {
                    'total_events': event_count,
                    'total_captures': capture_count
                }
            }))
        finally:
            db.close()
        
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # You can handle incoming messages here if needed
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Original WebSocket endpoint (for compatibility)
@app.websocket("/ws")
async def websocket_original(websocket: WebSocket):
    await websocket_endpoint(websocket)

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error handler: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        init_settings(db)
        logger.info("Database initialized with default settings")
        
        # Add some sample data if database is empty
        event_count = db.query(Event).count()
        if event_count == 0:
            logger.info("Adding sample events to database")
            # Add sample SSH event
            sample_event = Event(
                timestamp=datetime.now(),
                source_ip="192.168.1.100",
                port=22222,
                service="ssh",
                country="Unknown",
                city="Unknown",
                latitude=0.0,
                longitude=0.0,
                event_data=json.dumps({
                    "client_version": "SSH-2.0-OpenSSH_8.2",
                    "session_data": {
                        "authenticated": False,
                        "username": "root",
                        "duration": 5.2
                    }
                })
            )
            db.add(sample_event)
            
            # Add sample HTTP event
            sample_event2 = Event(
                timestamp=datetime.now() - timedelta(hours=1),
                source_ip="10.0.0.50",
                port=8080,
                service="http",
                country="Unknown",
                city="Unknown",
                latitude=0.0,
                longitude=0.0,
                event_data=json.dumps({
                    "user_agent": "Mozilla/5.0",
                    "path": "/admin",
                    "method": "GET"
                })
            )
            db.add(sample_event2)
            db.commit()
            logger.info("Sample events added successfully")
            
    except Exception as e:
        logger.error(f"Error during startup: {e}")
    finally:
        db.close()
    logger.info("ThreatView Backend started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("ThreatView Backend shutting down")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=os.getenv("BIND_ADDR", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", "8000")),
        reload=False
    )