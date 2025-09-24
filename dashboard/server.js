import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Create promisified version of exec for ES modules
const execAsync = promisify(exec);

// API endpoints
app.get('/api/services', async (req, res) => {
  try {
    const { stdout } = await execAsync('docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}"');
    const services = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [name, status, ports] = line.split('|');
        return { name, status, ports: ports || 'N/A' };
      })
      .filter(service => service.name && service.status);
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    // Fetch from log enricher service
    const response = await fetch('http://log-enricher:3001/api/stats');
    const stats = await response.json();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Fallback to mock data
    res.json({
      totalAttacks: 1242,
      blockedAttempts: 1189,
      uniqueAttackers: 87,
      services: [
        { name: 'Cowrie', status: 'running', attacks: 642 },
        { name: 'Glastopf', status: 'running', attacks: 328 },
        { name: 'Dionaea', status: 'running', attacks: 272 }
      ],
      threatLevel: 'medium',
      lastUpdated: new Date().toISOString()
    });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const response = await fetch('http://log-enricher:3001/api/events');
    const events = await response.json();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.json([]);
  }
});

app.get('/api/logs/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const logPath = path.join('/app/logs', service);
    
    try {
      const files = await readdir(logPath);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      const logs = await Promise.all(
        logFiles.map(async (file) => {
          try {
            const content = await readFile(path.join(logPath, file), 'utf8');
            return {
              file,
              content: content.split('\n').slice(-100).join('\n'),
              size: content.length
            };
          } catch (e) {
            return { file, content: 'Unable to read file', error: e.message };
          }
        })
      );
      
      res.json(logs);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json([]);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: ['dashboard', 'api']
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Dashboard client connected');
  
  // Simulate real-time data updates
  const interval = setInterval(() => {
    socket.emit('dashboard-update', {
      timestamp: new Date().toISOString(),
      activeConnections: Math.floor(Math.random() * 50) + 10,
      eventsProcessed: Math.floor(Math.random() * 100),
      attacks: Math.floor(Math.random() * 5),
      connections: Math.floor(Math.random() * 20) + 5
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected');
    clearInterval(interval);
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard server running on port ${PORT}`);
});
