const CowrieParser = require('../parsers/cowrie-parser');
const Event = require('../models/event');
const { publishToWebSocket } = require('../websocket/server');

class LogIngester {
  constructor() {
    this.parser = new CowrieParser();
    this.batchSize = process.env.LOG_BATCH_SIZE || 50;
    this.batchTimeout = process.env.LOG_BATCH_TIMEOUT || 5000;
    this.batch = [];
    this.batchTimer = null;
  }

  async ingest(logEntry) {
    try {
      const parsedEvent = await this.parser.parse(logEntry);
      
      if (!parsedEvent) {
        return;
      }

      this.batch.push(parsedEvent);
      
      if (this.batch.length >= this.batchSize) {
        await this.processBatch();
        return;
      }
      
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.processBatch(), this.batchTimeout);
      }
    } catch (error) {
      console.error('Error ingesting log entry:', error);
    }
  }

  async processBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.batch.length === 0) {
      return;
    }
    
    try {
      const result = await Event.insertMany(this.batch, { ordered: false });
      
      this.batch.forEach(event => {
        publishToWebSocket('new_event', event);
      });
      
      console.log(`Inserted ${result.length} events to database`);
      this.batch = [];
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }

  async flush() {
    await this.processBatch();
  }
}

module.exports = LogIngester;
