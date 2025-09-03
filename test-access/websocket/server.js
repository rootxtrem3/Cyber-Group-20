const WebSocket = require('ws');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      this.clients.add(ws);
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  publish(eventType, data) {
    this.broadcast({
      type: eventType,
      data: data,
      timestamp: new Date().toISOString()
    });
  }
}

let instance = null;

function initializeWebSocket(server) {
  instance = new WebSocketServer(server);
  return instance;
}

function getWebSocketInstance() {
  if (!instance) {
    throw new Error('WebSocket server not initialized');
  }
  return instance;
}

function publishToWebSocket(eventType, data) {
  if (instance) {
    instance.publish(eventType, data);
  }
}

module.exports = {
  initializeWebSocket,
  getWebSocketInstance,
  publishToWebSocket
};
