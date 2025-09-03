const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');

const { initializeWebSocket } = require('./websocket/server');
const eventRoutes = require('./routes/events');

const app = express();
const server = http.createServer(app);

initializeWebSocket(server);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/events', eventRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot-honeypot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
