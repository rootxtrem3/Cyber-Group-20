FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data /app/data/quarantine
RUN chmod 755 /app/data /app/data/quarantine

EXPOSE 8080

CMD ["python", "server.py"]