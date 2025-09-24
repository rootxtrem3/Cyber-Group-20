import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import chokidar from 'chokidar';
import { readFile, readdir, writeFile } from 'fs/promises';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Winston logger configuration
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: '/app/logs/enriched/security-events.log' })
  ]
});

// Enhanced IP analysis
class IPEnricher {
  constructor() {
    this.suspiciousIPs = new Set();
    this.ipReputation = new Map();
  }

  async enrichIP(ip) {
    // Simulated geo data - in production, use a proper geoip database
    const geoData = {
      '192.168.1.100': { country: 'US', city: 'New York', region: 'NY' },
      '192.168.1.101': { country: 'CA', city: 'Toronto', region: 'ON' },
      '192.168.1.102': { country: 'GB', city: 'London', region: 'ENG' }
    };
    
    const geo = geoData[ip] || { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
    const reputation = this.getReputation(ip);
    
    return {
      ip,
      geo,
      reputation,
      isSuspicious: this.suspiciousIPs.has(ip),
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
  }

  getReputation(ip) {
    if (!this.ipReputation.has(ip)) {
      const score = Math.random() * 100;
      this.ipReputation.set(ip, Math.round(score));
    }
    return this.ipReputation.get(ip);
  }

  markSuspicious(ip) {
    this.suspiciousIPs.add(ip);
  }
}

const enricher = new IPEnricher();

// Log file patterns for different honeypots
const LOG_PATTERNS = {
  cowrie: '/app/logs/cowrie/*.log',
  glastopf: '/app/logs/glastopf/*.log',
  dionaea: '/app/logs/dionaea/*.log'
};

// Enhanced log parsing
class LogParser {
  parseCowrie(line) {
    try {
      // Simulate parsing cowrie logs
      const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)/);
      const ip = ipMatch ? ipMatch[1] : 'unknown';
      
      return {
        timestamp: new Date().toISOString(),
        service: 'cowrie',
        type: 'ssh_attempt',
        sourceIp: ip,
        destinationIp: '192.168.1.1',
        username: 'root',
        severity: 'high'
      };
    } catch (e) {
      return null;
    }
  }

  parseGlastopf(line) {
    try {
      const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)/);
      const ip = ipMatch ? ipMatch[1] : 'unknown';
      
      return {
        timestamp: new Date().toISOString(),
        service: 'glastopf',
        type: 'web_scan',
        sourceIp: ip,
        severity: 'medium'
      };
    } catch (e) {
      return null;
    }
  }

  parseDionaea(line) {
    try {
      const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)/);
      const ip = ipMatch ? ipMatch[1] : 'unknown';
      
      return {
        timestamp: new Date().toISOString(),
        service: 'dionaea',
        type: 'malware_probe',
        sourceIp: ip,
        protocol: 'tcp',
        severity: 'high'
      };
    } catch (e) {
      return null;
    }
  }
}

const parser = new LogParser();

// Real-time log monitoring
class LogMonitor {
  constructor(io) {
    this.watchers = new Map();
    this.io = io;
  }

  startMonitoring() {
    Object.entries(LOG_PATTERNS).forEach(([service, pattern]) => {
      const watcher = chokidar.watch(pattern, {
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('add', (filePath) => this.processNewFile(service, filePath));
      watcher.on('change', (filePath) => this.processFileChange(service, filePath));

      this.watchers.set(service, watcher);
      console.log(`Started monitoring ${service} logs at ${pattern}`);
    });
  }

  async processFileChange(service, filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Process last few lines
      for (const line of lines.slice(-5)) {
        await this.processLogLine(service, line);
      }
    } catch (error) {
      console.error(`Error processing ${service} log:`, error);
    }
  }

  async processNewFile(service, filePath) {
    console.log(`New log file detected for ${service}: ${filePath}`);
  }

  async processLogLine(service, line) {
    const parsedLog = this.parseLog(service, line);
    if (parsedLog && parsedLog.sourceIp && parsedLog.sourceIp !== 'unknown') {
      try {
        const enrichedLog = await enricher.enrichIP(parsedLog.sourceIp);
        const event = {
          ...parsedLog,
          enriched: enrichedLog,
          id: this.generateId(),
          processedAt: new Date().toISOString()
        };

        logger.info('Security event detected', event);
        this.io.emit('security-event', event);
      } catch (error) {
        console.error('Error enriching log:', error);
      }
    }
  }

  parseLog(service, line) {
    switch (service) {
      case 'cowrie': return parser.parseCowrie(line);
      case 'glastopf': return parser.parseGlastopf(line);
      case 'dionaea': return parser.parseDionaea(line);
      default: return null;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// API routes
app.use(cors());
app.use(express.json());

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await generateStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await getRecentEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function generateStats() {
  return {
    totalAttacks: Math.floor(Math.random() * 1000) + 500,
    blockedAttempts: Math.floor(Math.random() * 800) + 400,
    uniqueAttackers: Math.floor(Math.random() * 50) + 25,
    services: [
      { name: 'Cowrie', status: 'running', attacks: Math.floor(Math.random() * 300) + 200 },
      { name: 'Glastopf', status: 'running', attacks: Math.floor(Math.random() * 200) + 100 },
      { name: 'Dionaea', status: 'running', attacks: Math.floor(Math.random() * 150) + 80 }
    ],
    threatLevel: 'medium',
    lastUpdated: new Date().toISOString()
  };
}

async function getRecentEvents() {
  return [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      service: 'Cowrie',
      type: 'SSH Brute Force',
      sourceIp: '192.168.1.100',
      severity: 'high'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      service: 'Glastopf',
      type: 'Web Scan',
      sourceIp: '192.168.1.101',
      severity: 'medium'
    }
  ];
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'log-enricher',
    timestamp: new Date().toISOString()
  });
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize log monitoring
const monitor = new LogMonitor(io);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Log enricher service running on port ${PORT}`);
  monitor.startMonitoring();
});

io.on('connection', (socket) => {
  console.log('Client connected to log enricher');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from log enricher');
  });
});
