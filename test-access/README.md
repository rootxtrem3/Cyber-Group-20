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
