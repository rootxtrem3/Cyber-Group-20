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
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        self._log_event("connection_lost", {
            "duration": duration,
            "error": str(exc) if exc else None
        })
        asyncio.create_task(self._save_session())

    def begin_auth(self, username: str) -> bool:
        self.username = username
        self._log_event("auth_attempt", {"username": username})
        print(f"SSH auth attempt: username={username}")
        return True

    def password_auth_supported(self) -> bool:
        return True

    def validate_password(self, username: str, password: str) -> bool:
        self.password = password
        self.authenticated = True
        self._log_event("password_provided", {"password": password})
        print(f"SSH password provided: username={username}, password={password}")
        # Always return False to keep the session going
        return False

    def session_requested(self) -> bool:
        return True

    def shell_requested(self) -> bool:
        return True

    async def start_shell(self, process: asyncssh.SSHServerProcess) -> None:
        self._log_event("shell_started", {})
        print(f"SSH shell started for {self.username}")
        
        # Send fake banner and prompt
        process.stdout.write("Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.4.0-91-generic x86_64)\n\n")
        process.stdout.write("Last login: Mon Dec 11 14:32:01 2023 from 192.168.1.100\n")
        await self._handle_shell_interaction(process)

    async def _handle_shell_interaction(self, process: asyncssh.SSHServerProcess):
        try:
            process.stdout.write("$ ")
            
            async for command in process.stdin:
                command = command.strip()
                if not command:
                    process.stdout.write("$ ")
                    continue
                
                self._log_event("command", {"command": command})
                print(f"SSH command received: {command}")
                
                # Fake command responses
                response = await self._get_fake_response(command)
                if response:
                    process.stdout.write(response + "\n")
                
                process.stdout.write("$ ")
                
        except asyncssh.BreakReceived:
            pass
        except Exception as e:
            self._log_event("error", {"error": str(e)})
            print(f"SSH shell error: {e}")

    async def _get_fake_response(self, command: str) -> str:
        """Generate plausible fake responses for common commands"""
        cmd_parts = command.split()
        base_cmd = cmd_parts[0].lower() if cmd_parts else ""
        
        responses = {
            "ls": "bin   dev  home  lib32  libx32  mnt  proc  run   srv  tmp  var\nboot  etc  lib   lib64  media   opt  root  sbin  sys  usr",
            "pwd": "/home/user",
            "whoami": "user",
            "id": "uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),132(lxd),133(sambashare)",
            "uname": "Linux",
            "uname -a": "Linux ubuntu-server 5.4.0-91-generic #102-Ubuntu SMP Fri Nov 5 16:31:28 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux",
            "ps": "  PID TTY          TIME CMD\n    1 ?        00:00:01 systemd\n    2 ?        00:00:00 kthreadd\n    3 ?        00:00:00 rcu_gp",
            "netstat": "Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State",
            "ifconfig": "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255",
            "cat": "Permission denied" if len(cmd_parts) > 1 else "",
            "sudo": "user is not in the sudoers file. This incident will be reported.",
            "ssh": "ssh: connect to host localhost port 22: Connection refused",
            "scp": "usage: scp [-346BCpqrTv] [-c cipher] [-F ssh_config] [-i identity_file]\n            [-l limit] [-o ssh_option] [-P port] [-S program] source ... target",
        }
        
        return responses.get(base_cmd, f"bash: {base_cmd}: command not found")

    def _log_event(self, event_type: str, data: Dict[str, Any]):
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "data": data
        }
        self.transcript.append(event)

    # In the _save_session method, ensure it's using the correct endpoint:
async def _save_session(self):
    """Save session data to backend API"""
    if not self.client_ip:
        return
        
    session_data = {
        "honeypot_type": "ssh",
        "ts": self.start_time.isoformat(),
        "src_ip": self.client_ip,
        "src_port": self.client_port,
        "user": self.username,
        "password": self.password,
        "transcript": self.transcript,
        "meta": {
            "authenticated": self.authenticated,
            "duration": (datetime.utcnow() - self.start_time).total_seconds(),
            "client_version": self.transcript[0]["data"]["client_version"] if self.transcript else "Unknown"
        }
    }
    
    try:
        backend_url = os.getenv("BACKEND_URL", "http://backend:8000")
        async with httpx.AsyncClient() as client:
            # Use POST to /api/v1/connections to trigger WebSocket broadcast
            response = await client.post(
                f"{backend_url}/api/v1/connections",  # This is important!
                json=session_data,
                timeout=10.0
            )
            
            if response.status_code == 200:
                print(f"✓ SSH session saved and broadcasted: {self.client_ip}:{self.client_port}")
            else:
                print(f"✗ Failed to save SSH session: {response.status_code}")
                
    except Exception as e:
        print(f"✗ Error saving SSH session to backend: {e}")
        # Fallback: save to local file
        try:
            os.makedirs("/app/data/logs", exist_ok=True)
            filename = f"/app/data/logs/ssh_{self.client_ip}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(session_data, f, indent=2)
            print(f"✓ SSH session saved to file: {filename}")
        except Exception as file_error:
            print(f"✗ Failed to save SSH session to file: {file_error}")

async def handle_client(process: asyncssh.SSHServerProcess):
    """Handle individual client connection"""
    server = HoneypotSSHServer()
    await process.attach(server=server)


async def start_ssh_server():
    host = os.getenv("BIND_ADDR", "0.0.0.0")
    port = int(os.getenv("SSH_PORT", "2222"))
    
    print(f"Starting SSH honeypot on {host}:{port}...")
    
    try:
        # Generate SSH host key
        key = asyncssh.generate_private_key('ssh-rsa')
        
        # Create the server with the correct factory
        server = await asyncssh.create_server(
            lambda: HoneypotSSHServer(),
            host,
            port,
            server_host_keys=[key]
        )
        
        print(f"✓ SSH honeypot successfully listening on {host}:{port}")
        print("Ready to accept SSH connections...")
        
        # Keep server running
        await server.wait_closed()
        
    except (OSError, asyncssh.Error) as exc:
        print(f"✗ SSH server error: {exc}")
        return 1


if __name__ == "__main__":
    try:
        asyncio.run(start_ssh_server())
    except KeyboardInterrupt:
        print("\nSSH honeypot stopped")