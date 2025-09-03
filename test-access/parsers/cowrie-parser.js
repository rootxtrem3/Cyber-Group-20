const Event = require('../models/event');
const { enrichWithGeoIP } = require('./enrichment');

class CowrieParser {
  constructor() {
    this.supportedEvents = [
      'cowrie.login',
      'cowrie.command',
      'cowrie.session',
      'cowrie.direct-tcpip'
    ];
  }

  async parse(logEntry) {
    try {
      const event = JSON.parse(logEntry);
      
      if (!this.supportedEvents.includes(event.eventid)) {
        return null;
      }

      let parsedEvent = {
        timestamp: new Date(event.timestamp * 1000),
        source_ip: event.src_ip,
        source_port: event.src_port,
        destination_port: event.dst_port,
        protocol: this._determineProtocol(event),
        event_type: this._mapEventType(event.eventid),
        session: event.session,
        sensor: event.sensor,
        payload: event
      };

      // Extract additional fields based on event type
      if (event.eventid === 'cowrie.login') {
        parsedEvent.username = event.username;
        parsedEvent.password = event.password;
      } else if (event.eventid === 'cowrie.command') {
        parsedEvent.input = event.input;
        parsedEvent.command = this._extractCommand(event.input);
      }

      // Enrich with GeoIP data
      parsedEvent = await enrichWithGeoIP(parsedEvent);
      
      // Calculate risk score
      parsedEvent.risk_score = this._calculateRiskScore(parsedEvent);
      
      return parsedEvent;
    } catch (error) {
      console.error('Error parsing log entry:', error, logEntry);
      return null;
    }
  }

  _determineProtocol(event) {
    if (event.dst_port === 22) return 'ssh';
    if (event.dst_port === 23) return 'telnet';
    if (event.dst_port === 80) return 'http';
    if (event.dst_port === 443) return 'https';
    return 'other';
  }

  _mapEventType(eventid) {
    const eventMap = {
      'cowrie.login': 'login_attempt',
      'cowrie.command': 'command_execution',
      'cowrie.session': 'connection',
      'cowrie.direct-tcpip': 'connection'
    };
    return eventMap[eventid] || 'other';
  }

  _extractCommand(input) {
    if (!input) return 'unknown';
    
    const commands = input.trim().split(/\s+/);
    return commands[0] || 'unknown';
  }

  _calculateRiskScore(event) {
    let score = 0;
    
    // Increase score for certain commands
    if (event.event_type === 'command_execution') {
      const riskyCommands = ['wget', 'curl', 'chmod', 'rm', 'mkfs', 'dd', 'sh', 'bash'];
      if (riskyCommands.includes(event.command)) {
        score += 3;
      }
    }
    
    // Cap the score at 10
    return Math.min(score, 10);
  }
}

module.exports = CowrieParser;
