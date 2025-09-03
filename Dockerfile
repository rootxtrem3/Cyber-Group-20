# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create log directory
RUN mkdir -p /app/logs

# Copy application code
COPY app/ ./app/

# Create a non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

# Start the application
CMD ["python", "-m", "app.main"]
