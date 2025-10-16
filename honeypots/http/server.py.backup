from aiohttp import web
import aiofiles
import hashlib
import os
import json
from datetime import datetime
from typing import Dict, Any
import httpx

class HTTPHoneypot:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        
    def setup_routes(self):
        # Catch-all route for all HTTP methods and paths
        self.app.router.add_route('*', '/{path:.*}', self.handle_request)

    async def handle_request(self, request: web.Request) -> web.Response:
        """Handle all incoming requests"""
        client_ip = request.remote
        client_port = request.transport.get_extra_info('peername')[1] if request.transport.get_extra_info('peername') else 0
        
        print(f"HTTP request from {client_ip}:{client_port} - {request.method} {request.path}")
        
        # Capture request data
        request_data = await self._capture_request(request, client_ip, client_port)
        
        # Generate plausible response
        response = await self._generate_response(request)
        
        return response

    async def _capture_request(self, request: web.Request, client_ip: str, client_port: int) -> Dict[str, Any]:
        """Capture all request data including file uploads"""
        capture_data = {
            "ts": datetime.utcnow().isoformat(),
            "src_ip": client_ip,
            "src_port": client_port,
            "http_path": request.path,
            "method": request.method,
            "headers": dict(request.headers),
            "query_string": dict(request.query),
            "meta": {
                "user_agent": request.headers.get('User-Agent', ''),
                "content_type": request.headers.get('Content-Type', ''),
                "content_length": request.headers.get('Content-Length', '0')
            }
        }
        
        # Handle file uploads and form data
        files_data = []
        if request.content_type and 'multipart' in request.content_type:
            print(f"Multipart request detected from {client_ip}")
            files_data = await self._handle_multipart(request)
            capture_data["files"] = files_data
        elif request.content_type and 'application/x-www-form-urlencoded' in request.content_type:
            # Handle form data
            try:
                post_data = await request.post()
                for field_name, value in post_data.items():
                    files_data.append({
                        "field_name": field_name,
                        "value": value,
                        "type": "form_field"
                    })
                capture_data["files"] = files_data
                print(f"Form data captured from {client_ip}")
            except Exception as e:
                print(f"Error processing form data: {e}")
        else:
            # Capture request body for other content types
            try:
                body = await request.read()
                if body and len(body) < 10240:  # Limit size for non-file content
                    capture_data["body_preview"] = body[:1000].decode('utf-8', errors='ignore')
                    capture_data["body_size"] = len(body)
                    print(f"Request body captured from {client_ip}, size: {len(body)} bytes")
            except Exception as e:
                capture_data["body_error"] = str(e)
        
        # Save files to backend
        for file_info in files_data:
            if file_info.get("type") == "file":
                await self._save_capture_to_backend(capture_data, file_info)
        
        return capture_data

    async def _handle_multipart(self, request: web.Request) -> list:
        """Handle multipart form data and file uploads"""
        files_data = []
        
        try:
            reader = await request.multipart()
            
            async for field in reader:
                if field.filename:
                    # This is a file upload
                    file_content = await field.read()
                    file_info = await self._save_uploaded_file(
                        file_content, 
                        field.filename,
                        dict(field.headers)
                    )
                    files_data.append(file_info)
                    print(f"File uploaded: {field.filename} ({len(file_content)} bytes)")
                else:
                    # This is a form field
                    value = await field.text()
                    files_data.append({
                        "field_name": field.name,
                        "value": value,
                        "type": "form_field"
                    })
                    
        except Exception as e:
            print(f"Error processing multipart: {e}")
            files_data.append({
                "error": f"Failed to process multipart: {str(e)}",
                "type": "error"
            })
        
        return files_data

    async def _save_uploaded_file(self, file_content: bytes, filename: str, headers: Dict) -> Dict[str, Any]:
        """Save uploaded file to quarantine with metadata"""
        # Compute file hash
        sha256 = hashlib.sha256(file_content).hexdigest()
        
        # Get file extension
        _, ext = os.path.splitext(filename)
        if not ext:
            ext = ".bin"
        
        # Create safe filename
        safe_filename = f"{sha256}{ext}"
        quarantine_path = f"/app/data/quarantine/{safe_filename}"
        
        # Write file with read-only permissions
        async with aiofiles.open(quarantine_path, 'wb') as f:
            await f.write(file_content)
        
        # Set read-only permissions
        os.chmod(quarantine_path, 0o444)
        
        file_info = {
            "filename": filename,
            "sha256": sha256,
            "size": len(file_content),
            "saved_path": safe_filename,
            "content_type": headers.get('Content-Type', ''),
            "type": "file"
        }
        
        return file_info

    async def _save_capture_to_backend(self, capture_data: Dict[str, Any], file_info: Dict[str, Any]):
        """Save capture data to backend API"""
        try:
            capture_record = {
                "ts": capture_data["ts"],
                "src_ip": capture_data["src_ip"],
                "src_port": capture_data["src_port"],
                "http_path": capture_data["http_path"],
                "filename": file_info["filename"],
                "sha256": file_info["sha256"],
                "size": file_info["size"],
                "saved_path": file_info["saved_path"],
                "meta": {
                    "method": capture_data["method"],
                    "user_agent": capture_data["meta"]["user_agent"],
                    "content_type": file_info["content_type"],
                    "headers": capture_data.get("headers", {})
                }
            }
            
            backend_url = os.getenv("BACKEND_URL", "http://backend:8000")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{backend_url}/api/v1/captures",
                    json=capture_record,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print(f"✓ HTTP capture saved to backend: {file_info['filename']} from {capture_data['src_ip']}")
                else:
                    print(f"✗ Failed to save HTTP capture: {response.status_code}")
                    
        except Exception as e:
            print(f"✗ Error saving HTTP capture to backend: {e}")
            # Fallback: save to local file
            try:
                os.makedirs("/app/data/logs", exist_ok=True)
                filename = f"/app/data/logs/http_{capture_data['src_ip']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
                with open(filename, 'w') as f:
                    json.dump(capture_record, f, indent=2)
                print(f"✓ HTTP capture saved to file: {filename}")
            except Exception as file_error:
                print(f"✗ Failed to save HTTP capture to file: {file_error}")

    async def _generate_response(self, request: web.Request) -> web.Response:
        """Generate plausible HTTP response"""
        path = request.path.lower()
        
        # Common web server responses
        if path in ['/', '/index.html', '/index.php']:
            return web.Response(
                text="""<html>
<head><title>Welcome</title></head>
<body>
    <h1>Welcome to Our Site</h1>
    <p>This site is currently under development.</p>
    <p>Please check back later.</p>
</body>
</html>""",
                content_type="text/html",
                status=200
            )
        elif path in ['/admin', '/wp-admin', '/administrator']:
            return web.Response(
                text="""<html>
<head><title>403 Forbidden</title></head>
<body>
    <h1>403 Forbidden</h1>
    <p>You don't have permission to access this resource.</p>
</body>
</html>""",
                content_type="text/html",
                status=403
            )
        elif '.php' in path:
            return web.Response(
                text="""<html>
<head><title>500 Internal Server Error</title></head>
<body>
    <h1>500 Internal Server Error</h1>
    <p>The server encountered an internal error.</p>
</body>
</html>""",
                content_type="text/html",
                status=500
            )
        elif any(ext in path for ext in ['.jpg', '.png', '.css', '.js']):
            return web.Response(
                text="""<html>
<head><title>404 Not Found</title></head>
<body>
    <h1>404 Not Found</h1>
    <p>The requested resource was not found.</p>
</body>
</html>""",
                content_type="text/html",
                status=404
            )
        else:
            # Default response
            return web.Response(
                text="""<html>
<head><title>It works!</title></head>
<body>
    <h1>It works!</h1>
    <p>This is the default web page for this server.</p>
</body>
</html>""",
                content_type="text/html",
                status=200
            )

async def start_http_server():
    host = os.getenv("BIND_ADDR", "0.0.0.0")  # Changed to 0.0.0.0 to accept external connections
    port = int(os.getenv("HTTP_PORT", "8080"))
    
    honeypot = HTTPHoneypot()
    
    runner = web.AppRunner(honeypot.app)
    await runner.setup()
    
    site = web.TCPSite(runner, host, port)
    await site.start()
    
    print(f"✓ HTTP honeypot successfully listening on {host}:{port}")
    print("Ready to accept HTTP requests...")
    
    # Wait forever
    await asyncio.Future()

if __name__ == "__main__":
    import asyncio
    try:
        asyncio.run(start_http_server())
    except KeyboardInterrupt:
        print("\nHTTP honeypot stopped")