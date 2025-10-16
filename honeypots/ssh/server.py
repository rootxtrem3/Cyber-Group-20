import asyncio
import asyncssh
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any
import httpx

class HoneypotSSHServer(asyncssh.SSHServer):
    def __init__(self):
        self.username: Optional[str] = None
        self.password: Optional[str] = None
        self.transcript = []
        self.start_time = datetime.utcnow()
        self.authenticated = False
        self.client_ip = None
        self.client_port = None
        self.backend_url = os.getenv("BACKEND_URL", "http://backend:8000")

    def connection_made(self, conn: asyncssh.SSHServerConnection):      
        peername = conn.get_extra_info('peername')
        if peername:
            self.client_ip, self.client_port = peername
        else:
            self.client_ip = "unknown"
            self.client_port = 0

        self._log_event("connection_made", {
            "client_version": conn.get_extra_info("client_version", "Unknown"),
            "client_ip": self.client_ip,
            "client_port": self.client_port
        })
        print(f"SSH connection from {self.client_ip}:{self.client_port}")

    def connection_lost(self, exc: Optional[Exception]):
        """Handle connection loss - FIXED VERSION"""
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        self._log_event("connection_lost", {
            "duration": duration,
            "error": str(exc) if exc else None
        })
        # Send session data to backend - USING CORRECT METHOD
        asyncio.create_task(self._send_session_data())

    async def _send_session_data(self):
        """Send session data to backend using httpx"""
        try:
            event_data = {
                "source_ip": self.client_ip,
                "port": 2222,
                "service": "ssh",
                "event_data": {
                    "session_data": {
                        "transcript": self.transcript,
                        "authenticated": self.authenticated,
                        "duration": (datetime.utcnow() - self.start_time).total_seconds(),
                        "username": self.username
                    }
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/events",
                    json=event_data,
                    timeout=5.0
                )
                if response.status_code == 200:
                    print(f"SSH session data sent for {self.client_ip}")
                else:
                    print(f"Failed to send SSH session data: {response.status_code}")
        except Exception as e:
            print(f"Error sending SSH session data: {e}")
            # Fallback: save to local file
            await self._save_to_file()

    async def _save_to_file(self):
        """Fallback: save session data to local file"""
        try:
            session_data = {
                "honeypot_type": "ssh",
                "timestamp": datetime.utcnow().isoformat(),
                "src_ip": self.client_ip,
                "src_port": self.client_port,
                "user": self.username,
                "password": self.password,
                "transcript": self.transcript,
                "authenticated": self.authenticated
            }
            
            os.makedirs("/app/data/logs", exist_ok=True)
            filename = f"/app/data/logs/ssh_{self.client_ip}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(session_data, f, indent=2)
            print(f"SSH session saved to file: {filename}")
        except Exception as file_error:
            print(f"Failed to save SSH session to file: {file_error}")

    def begin_auth(self, username: str) -> bool:
        self.username = username
        self._log_event("auth_attempt", {"username": username})
        print(f"SSH auth attempt: username={username}")
        return True

    def password_auth_supported(self) -> bool:
        return True

    def validate_password(self, username: str, password: str) -> bool:  
        self.password = password
        self.authenticated = False
        self._log_event("password_provided", {"password": password})    
        print(f"SSH password provided: username={username}, password={password}")
        
        # Send password attempt to backend
        asyncio.create_task(self._send_password_attempt(username, password))
        
        # Always return False to keep the session going
        return False

    async def _send_password_attempt(self, username: str, password: str):
        """Send password attempt to backend"""
        try:
            event_data = {
                "source_ip": self.client_ip,
                "port": 2222,
                "service": "ssh",
                "event_data": {
                    "password_attempt": {
                        "username": username,
                        "password": password,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/events",
                    json=event_data,
                    timeout=5.0
                )
                if response.status_code != 200:
                    print(f"Failed to send SSH password data: {response.status_code}")
        except Exception as e:
            print(f"Error sending SSH password data: {e}")

    def _log_event(self, event_type: str, data: Dict[str, Any]):        
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "data": data
        }
        self.transcript.append(event)

async def start_ssh_server():
    host = os.getenv("BIND_ADDR", "0.0.0.0")
    port = int(os.getenv("SSH_PORT", "2222"))

    print(f"Starting SSH honeypot on {host}:{port}...")

    try:
        # Generate SSH host key
        key = asyncssh.generate_private_key('ssh-rsa')

        # Create the server
        server = await asyncssh.create_server(
            lambda: HoneypotSSHServer(),
            host,
            port,
            server_host_keys=[key]
        )

        print(f"SSH honeypot successfully listening on {host}:{port}")
        print("Ready to accept SSH connections...")

        # Keep server running
        await server.wait_closed()

    except (OSError, asyncssh.Error) as exc:
        print(f"SSH server error: {exc}")
        return 1

if __name__ == "__main__":
    try:
        asyncio.run(start_ssh_server())
    except KeyboardInterrupt:
        print("\nSSH honeypot stopped")