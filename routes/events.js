const express = require('express');
const router = express.Router();
const LogIngester = require('../services/log-ingester');
const Event = require('../models/event');

const ingester = new LogIngester();

router.post('/', async (req, res) => {
  try {
    const { logs } = req.body;
    
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs array is required' });
    }
    
    for (const logEntry of logs) {
      await ingester.ingest(logEntry);
    }
    
    res.status(202).json({ message: 'Logs received and being processed' });
  } catch (error) {
    console.error('Error processing logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, source_ip, protocol, event_type, start_date, end_date } = req.query;
    const filter = {};
    
    if (source_ip) filter.source_ip = source_ip;
    if (protocol) filter.protocol = protocol;
    if (event_type) filter.event_type = event_type;
    
    if (start_date || end_date) {
      filter.timestamp = {};
      if (start_date) filter.timestamp.$gte = new Date(start_date);
      if (end_date) filter.timestamp.$lte = new Date(end_date);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 }
    };
    
    const events = await Event.paginate(filter, options);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
