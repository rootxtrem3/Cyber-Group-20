const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const geoip = require('geoip-lite');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
  if (err) {
    console.error('SQLite connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    source TEXT,
    eventType TEXT,
    attackerIP TEXT,
    country TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    protocol TEXT,
    details TEXT,
    severity TEXT
  )`);
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', apiLimiter);

async function initAdmin() {
  db.get('SELECT * FROM users WHERE username = ?', [process.env.ADMIN_USER], async (err, row) => {
    if (err) return console.error(err.message);
    if (!row) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 12);
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [process.env.ADMIN_USER, hashedPassword], (err) => {
        if (err) return console.error(err.message);
        console.log('Admin user created');
      });
    }
  });
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TTL });
    res.json({ token, username: user.username });
  });
});

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

const insertEvent = (event) => {
  return new Promise((resolve, reject) => {
    const geo = geoip.lookup(event.attackerIP);
    if (geo) {
      event.country = geo.country;
      event.city = geo.city;
      event.latitude = geo.ll[0];
      event.longitude = geo.ll[1];
    }
    const sql = `INSERT INTO events (timestamp, source, eventType, attackerIP, country, city, latitude, longitude, protocol, details, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      event.timestamp || new Date().toISOString(), event.source, event.eventType, event.attackerIP,
      event.country, event.city, event.latitude, event.longitude, event.protocol,
      JSON.stringify(event.details), event.severity || 'medium'
    ];
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      const savedEvent = {...event, id: this.lastID};
      io.emit('new_event', savedEvent);
      resolve(savedEvent);
    });
  });
};

app.post('/api/events', validateApiKey, async (req, res) => {
  try {
    const savedEvent = await insertEvent(req.body);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Failed to save event' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/events', authenticateToken, (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  const sql = 'SELECT * FROM events ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  db.all(sql, [parseInt(limit), parseInt(offset)], (err, events) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    db.get('SELECT COUNT(*) as total FROM events', (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ events, total: row.total });
    });
  });
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const dbAll = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
    const dbGet = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalEventsRow, uniqueIPsRow, todayEventsRow, topCountries, eventTypes] = await Promise.all([
        dbGet('SELECT COUNT(*) as count FROM events'),
        dbGet('SELECT COUNT(DISTINCT attackerIP) as count FROM events'),
        dbGet('SELECT COUNT(*) as count FROM events WHERE timestamp >= ?', [today.toISOString()]),
        dbAll('SELECT country, COUNT(*) as count FROM events WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10'),
        dbAll('SELECT eventType, COUNT(*) as count FROM events WHERE eventType IS NOT NULL GROUP BY eventType ORDER BY count DESC')
    ]);

    res.json({
        totalEvents: totalEventsRow.count,
        uniqueIPs: uniqueIPsRow.count,
        todayEvents: todayEventsRow.count,
        topCountries: topCountries,
        eventTypes: eventTypes.map(et => ({ _id: et.eventType, count: et.count }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});


io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

if (process.env.USE_FILEBEAT !== 'true') {
  const watcher = chokidar.watch(['/cowrie/log/cowrie.json', '/var/lib/dionaea/log/dionaea.json'], {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });
  watcher.on('add', (filePath) => console.log(`Started watching: ${filePath}`));
  watcher.on('change', (filePath) => {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const lines = data.trim().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          let processedEvent = {};
          if (filePath.includes('cowrie')) {
            processedEvent = {
              source: 'cowrie', eventType: event.eventid || 'ssh_login',
              attackerIP: event.src_ip, protocol: 'SSH/Telnet', details: event,
              timestamp: new Date(event.timestamp).toISOString()
            };
          } else if (filePath.includes('dionaea')) {
            processedEvent = {
              source: 'dionaea', eventType: event.type || 'connection',
              attackerIP: event.remote_host, protocol: event.protocol || 'Unknown', details: event,
              timestamp: new Date(event.timestamp * 1000).toISOString()
            };
          }
          if (processedEvent.attackerIP) {
            insertEvent(processedEvent).catch(err => console.error('Watcher failed to insert event:', err));
          }
        } catch (parseError) {
          console.error('Error parsing log line:', parseError);
        }
      }
    } catch (error) {
      console.error('Error reading log file:', error);
    }
  });
}

const PORT = process.env.PORT || 3000;

initAdmin().then(() => {
  server.listen(PORT, () => {
    console.log(`ThreatView backend running on port ${PORT}`);
  });
}).catch(console.error);
