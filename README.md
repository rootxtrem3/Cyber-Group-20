
# Honeypot Lab: A Modern, Containerized Honeypot Deployment

Honeypot Lab is an all-in-one solution for deploying a comprehensive suite of network honeypots with a modern, real-time web dashboard. This project is encapsulated in a single shell script that uses Docker Compose to set up a multi-container environment for monitoring and analyzing malicious network traffic in a secure and isolated way.

## What is this project?

This project is a fully automated system for deploying a sophisticated honeypot environment. It launches several types of honeypots, each designed to mimic vulnerable services commonly targeted by attackers. All activity is captured, processed, and visualized in a user-friendly web interface.

The entire stack, from the honeypots to the log processors and the dashboard, is defined and managed by Docker, making it portable, scalable, and easy to set up or tear down.

## Key Features

  * **Multi-Honeypot Environment**: Deploys three distinct honeypots to cover a wide range of threats:
      * **Cowrie**: A medium-interaction SSH and Telnet honeypot for capturing brute-force attacks and shell interaction.
      * **Glastopf**: A low-interaction web (HTTP) honeypot that emulates thousands of web vulnerabilities to trap scanners and bots.
      * **Dionaea**: A low-interaction honeypot designed to trap malware by emulating services like SMB, FTP, HTTP, MSSQL, and more.
  * **Real-time Dashboard**: A modern, single-page application built with **React** and **Material-UI** provides a central command center to visualize attacks, monitor service status, and view logs.
  * **Log Enrichment Service**: A dedicated Node.js service watches honeypot logs in real-time. It parses, enriches events with simulated GeoIP and reputation data, and pushes updates to the dashboard via WebSockets.
  * **Containerized & Isolated**: The entire environment runs in Docker containers, ensuring that services are isolated from the host system and can be managed cleanly.
  * **Built-in Safety**: Includes a `strict` safety mode that performs checks to prevent accidental deployment on a public or non-private IP address, ensuring it's run in a controlled lab environment.
  * **Single-Script Deployment**: The entire infrastructure is provisioned and launched from a single, self-contained bash script.

## What Problem Does It Solve?

Setting up, configuring, and monitoring multiple honeypots can be a complex and time-consuming task. It often requires managing different dependencies, log formats, and visualization tools.

**Honeypot Lab solves this by:**

1.  **Simplifying Deployment**: It automates the entire setup process into a single command.
2.  **Centralizing Monitoring**: It provides one clean, modern interface to see what's happening across all honeypots, turning raw log data into actionable insights.
3.  **Providing a Safe Learning Tool**: It offers a secure and isolated environment for cybersecurity professionals, researchers, and students to study attack techniques and malware behavior without risking real production systems.

## Simple Usage

### Prerequisites

  * A Linux-based operating system.
  * **Docker** and **Docker Compose** installed.

### Installation and Deployment
** Clone this repo
** Run docker compose up --build

### Accessing the Dashboard

Once the services are running, you can access the web dashboard at:

**`http://localhost:3000`**

### Testing the Honeypots

You can test that the honeypots are working by probing the exposed ports from another terminal:

  * **Test Cowrie (SSH):** `ssh root@localhost -p 2222` (use any password)
  * **Test Glastopf (Web):** `curl http://localhost`
  * **Test Dionaea (FTP):** `nc localhost 21`

You should see these connection attempts appear as events on the dashboard.

### Managing the Environment

  * **Check service status:**
    ```bash
    cd honeypot-lab
    docker compose ps
    ```
  * **View real-time logs from all services:**
    ```bash
    cd honeypot-lab
    docker compose logs -f
    ```
  * **Stop and remove all containers and volumes:**
    ```bash
    cd honeypot-lab
    docker compose down -v
    ```
