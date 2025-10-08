# tests/test_websocket.py
import asyncio
import websockets
import json
import unittest
from log_processor.websocket_server import WebSocketServer

class TestWebSocketServer(unittest.TestCase):
    def setUp(self):
        self.server = WebSocketServer(host="localhost", port=8766)
    
    async def test_client_connection(self):
        """Test WebSocket client connection and messaging"""
        uri = "ws://localhost:8766"
        
        async with websockets.connect(uri) as websocket:
            # Test receiving welcome message
            welcome_msg = await websocket.recv()
            welcome_data = json.loads(welcome_msg)
            
            self.assertEqual(welcome_data["type"], "system")
            
            # Test sending ping
            ping_msg = json.dumps({"type": "ping"})
            await websocket.send(ping_msg)
            
            pong_msg = await websocket.recv()
            pong_data = json.loads(pong_msg)
            
            self.assertEqual(pong_data["type"], "pong")
    
    async def test_event_broadcast(self):
        """Test broadcasting events to connected clients"""
        test_event = {
            "event_type": "test.event",
            "source_ip": "192.168.1.100",
            "timestamp": "2024-01-01T10:00:00Z"
        }
        
        # This would require running the server in a separate task
        # For simplicity, we'll test the broadcast method directly
        await self.server.broadcast_event(test_event)
        
        # Verify the broadcast logic (actual client testing would need running server)

if __name__ == "__main__":
    unittest.main()
