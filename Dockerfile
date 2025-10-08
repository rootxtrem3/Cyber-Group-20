FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/logs

# Download GeoIP database
RUN wget -q https://raw.githubusercontent.com/P3TERX/GeoLite.mmdb/download/GeoLite2-City.mmdb -O /app/GeoLite2-City.mmdb

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -s /bin/bash processor
RUN chown -R processor:processor /app
USER processor

EXPOSE 8765

CMD ["python", "main.py"]
