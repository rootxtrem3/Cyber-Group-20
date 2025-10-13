FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data
RUN chmod 755 /app/data

EXPOSE 2222

CMD ["python", "server.py"]