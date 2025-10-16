FROM python:3.11-slim

WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create directories with proper ownership
RUN mkdir -p /app/data /app/data/quarantine
RUN chown -R appuser:appuser /app/data
RUN chmod 755 /app/data /app/data/quarantine

# Switch to non-root user
USER appuser

EXPOSE 8080

# Use unbuffered Python for immediate output in Docker
CMD ["python", "-u", "server.py"]