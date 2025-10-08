# log_processor/websocket_server.py
import asyncio
import websockets
import json
import logging
from datetime import datetime
from typing import Set, Dict, Any

class WebSocketServer:
    def __init__(self, host="0.0.0.0", port=8765):
        self.host = host
        self.port = port
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
        self.server = None
    
    async def register(self, websocket: websockets.WebSocketServerProtocol):
        """Register a new WebSocket client"""
        self.connected_clients.add(websocket)
        logging.info(f"New dashboard connected. Total clients: {len(self.connected_clients)}")
        
        try:
            # Send welcome message with current stats
            welcome_msg = {
                "type": "system",
                "message": "Connected to honeypot real-time feed",
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send(json.dumps(welcome_msg))
        except Exception as e:
            logging.error(f"Error sending welcome message: {e}")
    
    async def unregister(self, websocket: websockets.WebSocketServerProtocol):
        """Unregister a WebSocket client"""
        self.connected_clients.remove(websocket)
        logging.info(f"Dashboard disconnected. Total clients: {len(self.connected_clients)}")
    
    async def broadcast_event(self, event_data: Dict[str, Any]):
        """Broadcast event to all connected clients"""
        if not self.connected_clients:
            return
        
        message = {
            "type": "attack_event",
            "data": event_data,
            "timestamp": datetime.now().isoformat()
        }
        
        message_json = json.dumps(message)
        disconnected_clients = []
        
        for client in self.connected_clients:
            try:
                await client.send(message_json)
                logging.debug(f"Event broadcast to client: {event_data.get('event_type')}")
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.append(client)
            except Exception as e:
                logging.error(f"Error broadcasting to client: {e}")
                disconnected_clients.append(client)
        
        # Clean up disconnected clients
        for client in disconnected_clients:
            await self.unregister(client)
    
    async def broadcast_stats(self, stats_data: Dict[str, Any]):
        """Broadcast statistics update to all clients"""
        if not self.connected_clients:
            return
        
        message = {
            "type": "stats_update",
            "data": stats_data,
            "timestamp": datetime.now().isoformat()
        }
        
        message_json = json.dumps(message)
        
        for client in list(self.connected_clients):  # Use list to avoid modification during iteration
            try:
                await client.send(message_json)
            except (websockets.exceptions.ConnectionClosed, Exception):
                await self.unregister(client)
    
    async def handler(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """Handle WebSocket connection"""
        await self.register(websocket)
        try:
            # Keep connection alive and handle incoming messages
            async for message in websocket:
                try:
                    client_msg = json.loads(message)
                    await self.handle_client_message(websocket, client_msg)
                except json.JSONDecodeError:
                    logging.warning(f"Invalid JSON received from client: {message}")
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister(websocket)
    
    async def handle_client_message(self, websocket: websockets.WebSocketServerProtocol, message: Dict[str, Any]):
        """Handle messages from dashboard clients"""
        msg_type = message.get("type")
        
        if msg_type == "ping":
            # Respond to ping for connection health checking
            response = {
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send(json.dumps(response))
        
        elif msg_type == "request_stats":
            # Client requesting current statistics
            # This would trigger a stats collection and broadcast
            logging.info("Stats requested by dashboard")
    
    async def start_server(self):
        """Start the WebSocket server"""
        self.server = await websockets.serve(self.handler, self.host, self.port)
        logging.info(f"WebSocket server started on {self.host}:{self.port}")
        
        # Keep server running
        await self.server.wait_closed()
    
    async def stop_server(self):
        """Stop the WebSocket server"""
        if self.server:
            self.server.close()
            await self.server.wait_closed()
