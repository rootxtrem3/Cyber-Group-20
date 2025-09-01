<<<<<<< HEAD
# IoT Honeypot - Data Logger & Parser

This component is responsible for log ingestion, parsing, enrichment, and real-time event streaming for the IoT Honeypot system.

## Features

- Parses logs from Cowrie SSH/Telnet honeypot and HTTP honeypot
- Enriches events with GeoIP data and risk scoring
- Stores events in MongoDB for historical analysis
- Publishes events to Redis for real-time dashboard updates
- Monitors log files for new entries

## Setup

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Download GeoLite2 City database and place it in the `/data` directory
4. Ensure MongoDB and Redis are running
5. Start the application: `python -m app.main`

## Docker Deployment

1. Build the image: `docker build -t iot-data-processor .`
2. Run with Docker Compose: `docker-compose up -d`

## Configuration

Environment variables:
- `MONGODB_URL`: MongoDB connection string (default: mongodb://localhost:27017/)
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_DB`: Redis database (default: 0)
- `REDIS_CHANNEL`: Redis channel for events (default: honeypot-events)
- `GEOIP_DB_PATH`: Path to GeoIP database (default: /data/GeoLite2-City.mmdb)

## Testing

Run tests with: `python -m unittest discover tests`
=======
# Data Logger & Parser for IoT Honeypot

## Overview
This module handles log ingestion, parsing, storage, and real-time processing for IoT honeypot systems.

## Features
- MongoDB schema for attack events
- Cowrie log parser with GeoIP enrichment
- Batch processing for efficient log ingestion
- WebSocket server for real-time updates
- REST API for log ingestion and querying

## API Endpoints
- `POST /api/events` - Ingest honeypot logs
- `GET /api/events` - Query events with filtering

## Setup
1. Install dependencies: `npm install`
2. Start MongoDB
3. Run: `npm start`
>>>>>>> 4346a7f9a3e3ffe43fdd9e582ee063dd97a3d76a
