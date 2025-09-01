const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  source_ip: {
    type: String,
    required: true,
    index: true
  },
  source_port: {
    type: Number,
    required: true
  },
  destination_port: {
    type: Number,
    required: true
  },
  protocol: {
    type: String,
    enum: ['ssh', 'telnet', 'http', 'https', 'other'],
    required: true
  },
  event_type: {
    type: String,
    enum: ['login_attempt', 'command_execution', 'connection', 'download', 'other'],
    required: true
  },
  username: String,
  password: String,
  command: String,
  input: String,
  session: String,
  sensor: String,
  payload: mongoose.Schema.Types.Mixed,
  geoip: {
    country: String,
    country_code: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    asn: String,
    org: String
  },
  risk_score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

// Create indexes for better query performance
EventSchema.index({ timestamp: -1 });
EventSchema.index({ source_ip: 1, timestamp: -1 });
EventSchema.index({ protocol: 1, timestamp: -1 });
EventSchema.index({ event_type: 1, timestamp: -1 });

module.exports = mongoose.model('Event', EventSchema);
