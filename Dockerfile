# Use a lightweight, official Python image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire 'app' directory into the container
COPY ./app .

# Expose the ports for the dashboard and honeypot services
EXPOSE 5000 8080 2323 1883

# The command to run when the container starts
CMD ["python", "main.py"]
