from aiohttp import web
import aiofiles
import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List
import httpx
import asyncio
import os

print("🚀 Starting HTTP honeypot with Docker unbuffered output...")

class HTTPHoneypot:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()

    def setup_routes(self):
        # Catch-all route for all HTTP methods and paths
        self.app.router.add_route('*', '/{path:.*}', self.handle_request)

    async def handle_request(self, request: web.Request) -> web.Response:
        client_ip = request.remote
        client_port = request.transport.get_extra_info('peername')[1] if request.transport.get_extra_info('peername') else 0
        print(f"🌐 HTTP request from {client_ip}:{client_port} - {request.method} {request.path}")
        request_data = await self._capture_request(request, client_ip, client_port)
        response = await self._generate_response(request)
        return response

    async def _capture_request(self, request: web.Request, client_ip: str, client_port: int) -> Dict[str, Any]:
        capture_data = {
            "ts": datetime.utcnow().isoformat() + "Z",
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
            },
            "files": []
        }

        files_data = []
        if request.content_type and 'multipart' in request.content_type:
            print(f"📎 Multipart request detected from {client_ip}")
            files_data = await self._handle_multipart(request)
            capture_data["files"] = files_data
        elif request.content_type and 'application/x-www-form-urlencoded' in request.content_type:
            try:
                post_data = await request.post()
                for field_name, value in post_data.items():
                    files_data.append({
                        "field_name": field_name,
                        "value": value,
                        "type": "form_field"
                    })
                capture_data["files"] = files_data
                print(f"📝 Form data captured from {client_ip}")
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
        else:
            try:
                body = await request.read()
                if body and len(body) < 10240:
                    capture_data["body_preview"] = body[:1000].decode('utf-8', errors='ignore')
                    capture_data["body_size"] = len(body)
                    print(f"📦 Request body captured from {client_ip}, size: {len(body)} bytes")
            except Exception as e:
                capture_data["body_error"] = str(e)

        if files_data or capture_data.get("body_preview"):
            await self._save_capture_to_backend(capture_data)

        return capture_data

    async def _handle_multipart(self, request: web.Request) -> List[Dict[str, Any]]:
        files_data = []
        try:
            reader = await request.multipart()
            async for field in reader:
                if field.filename:
                    file_content = await field.read()
                    file_info = await self._save_uploaded_file(file_content, field.filename, dict(field.headers))
                    files_data.append(file_info)
                    print(f"💾 File uploaded: {field.filename} ({len(file_content)} bytes)")
                else:
                    value = await field.text()
                    files_data.append({
                        "field_name": field.name,
                        "value": value,
                        "type": "form_field"
                    })
        except Exception as e:
            print(f"❌ Error processing multipart: {e}")
            files_data.append({"error": f"Failed to process multipart: {str(e)}", "type": "error"})
        return files_data

    async def _save_uploaded_file(self, file_content: bytes, filename: str, headers: Dict) -> Dict[str, Any]:
        try:
            sha256 = hashlib.sha256(file_content).hexdigest()
            _, ext = os.path.splitext(filename)
            if not ext:
                ext = ".bin"
            safe_filename = f"{sha256}{ext}"
            quarantine_dir = "/app/data/quarantine"
            os.makedirs(quarantine_dir, exist_ok=True)
            quarantine_path = os.path.join(quarantine_dir, safe_filename)

            async with aiofiles.open(quarantine_path, 'wb') as f:
                await f.write(file_content)

            # Conditional chmod (skip on Windows)
            if os.name != "nt":
                os.chmod(quarantine_path, 0o444)

            file_info = {
                "filename": filename,
                "sha256": sha256,
                "size": len(file_content),
                "saved_path": safe_filename,
                "content_type": headers.get('Content-Type', ''),
                "type": "file"
            }
            print(f"✅ File saved to quarantine: {safe_filename}")
            return file_info

        except Exception as e:
            print(f"❌ Error saving file {filename}: {e}")
            return {"filename": filename, "error": str(e), "type": "error"}

    async def _save_capture_to_backend(self, capture_data: Dict[str, Any]):
        try:
            capture_record = {
                "ts": capture_data["ts"],
                "src_ip": capture_data["src_ip"],
                "src_port": capture_data["src_port"],
                "http_path": capture_data["http_path"],
                "method": capture_data["method"],
                "headers": capture_data.get("headers", {}),
                "query_string": capture_data.get("query_string", {}),
                "meta": capture_data.get("meta", {}),
                "files": capture_data.get("files", [])
            }

            backend_url = os.getenv("BACKEND_URL", "http://backend:8000")
            print(f"📡 Sending capture to backend: {backend_url}/api/v1/captures")

            async with httpx.AsyncClient() as client:
                response = await client.post(f"{backend_url}/api/v1/captures", json=capture_record, timeout=10.0)

                if response.status_code == 200:
                    file_count = len(capture_data.get("files", []))
                    file_types = [f.get("type", "unknown") for f in capture_data.get("files", [])]
                    print(f"✅ HTTP capture saved to backend: {file_count} items from {capture_data['src_ip']} - Types: {file_types}")
                else:
                    print(f"❌ Backend returned error: {response.status_code}")
        except Exception as e:
            print(f"❌ Error saving HTTP capture to backend: {e}")
            try:
                os.makedirs("/app/data/logs", exist_ok=True)
                filename = f"/app/data/logs/http_{capture_data['src_ip']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
                with open(filename, 'w') as f:
                    json.dump(capture_data, f, indent=2)
                print(f"📄 HTTP capture saved to local file: {filename}")
            except Exception as file_error:
                print(f"❌ Failed to save HTTP capture to file: {file_error}")

    async def _generate_response(self, request: web.Request) -> web.Response:
        path = request.path.lower()
        if path in ['/', '/index.html', '/index.php']:
            return web.Response(
                text="<html><head><title>Welcome</title></head><body><h1>Welcome to Our Site</h1><p>Under development.</p></body></html>",
                content_type="text/html",
                status=200
            )
        elif path in ['/admin', '/wp-admin', '/administrator']:
            return web.Response(
                text="<html><head><title>403 Forbidden</title></head><body><h1>403 Forbidden</h1></body></html>",
                content_type="text/html",
                status=403
            )
        elif '.php' in path:
            return web.Response(
                text="<html><head><title>500 Internal Server Error</title></head><body><h1>500 Internal Server Error</h1></body></html>",
                content_type="text/html",
                status=500
            )
        elif any(ext in path for ext in ['.jpg', '.png', '.css', '.js']):
            return web.Response(
                text="<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>",
                content_type="text/html",
                status=404
            )
        else:
            return web.Response(
                text="<html><head><title>It works!</title></head><body><h1>It works!</h1></body></html>",
                content_type="text/html",
                status=200
            )

async def start_http_server():
    host = os.getenv("BIND_ADDR", "0.0.0.0")
    port = int(os.getenv("HTTP_PORT", "8080"))

    honeypot = HTTPHoneypot()
    runner = web.AppRunner(honeypot.app)
    await runner.setup()
    site = web.TCPSite(runner, host, port)
    await site.start()
    print(f"🎯 HTTP honeypot listening on {host}:{port}")
    await asyncio.Future()  # run forever

if __name__ == "__main__":
    print("🚀 Starting HTTP honeypot...")
    try:
        asyncio.run(start_http_server())
    except KeyboardInterrupt:
        print("\n🛑 HTTP honeypot stopped")
    except Exception as e:
        print(f"💥 HTTP honeypot error: {e}")
