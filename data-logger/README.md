# 🚨 IoT Honeypot + Real-Time Attack Visualization

![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![WebSocket](https://img.shields.io/badge/Real--Time-WebSocket-orange)
![Python](https://img.shields.io/badge/Python-3.9+-yellow)

A production-ready IoT honeypot system that mimics vulnerable IoT devices to capture attacker activities, analyze threats in real-time, and visualize attacks through an interactive dashboard. Perfect for security research, threat intelligence, and cybersecurity competitions.

## 🌟 Features

- **🤖 Multi-Service Honeypot**: SSH, Telnet, and HTTP IoT device emulation
- **📊 Real-Time Dashboard**: Live attack visualization with maps and charts
- **🔍 AI-Powered Analysis**: Automated threat detection and recommendations
- **🚨 Live Attack Monitoring**: WebSocket-based real-time event streaming
- **🌍 GeoIP Tracking**: Visualize attack origins worldwide
- **📈 Risk Scoring**: Intelligent threat prioritization
- **🔒 Secure Isolation**: Containerized environment with egress blocking
- **📝 Comprehensive Logging**: Structured logging with MongoDB storage

## 🏗️ System Architecture

```
Attacker → [Honeypots] → [Data Logger] → [MongoDB] → [Dashboard]
    ↓          ↓              ↓             ↓           ↓
  SSH/Telnet  HTTP       Log Parsing    Storage    Real-time Viz
                          WebSocket     GeoIP       AI Insights
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- 4GB RAM minimum
- Linux/Windows/macOS

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/iot-honeypot.git
   cd iot-honeypot
   ```

2. **Start the system**
   ```bash
   # Build and start all services
   docker-compose up --build -d
   
   # Check status
   docker-compose ps
   ```

3. **Access the dashboard**
   - Open http://localhost:3000 in your browser
   - Watch real-time attacks appear!

### Test the Honeypot

```bash
# Test SSH honeypot
ssh -p 2222 test@localhost

# Test Telnet honeypot
telnet localhost 2223

# Test HTTP honeypot
curl http://localhost
```

## 📊 Dashboard Features

- **Live Attack Map**: Real-time geographic visualization
- **Attack Timeline**: Temporal analysis of attack patterns
- **Top Commands**: Most frequent attacker commands
- **Risk Analysis**: Threat scoring and prioritization
- **AI Insights**: Automated security recommendations
- **Session Viewer**: Detailed attack session analysis

## 🛠️ Components

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **Cowrie Honeypot** | 2222/2223 | SSH/Telnet emulation | Python |
| **HTTP Honeypot** | 80/443 | Web interface simulation | Node.js |
| **Data Logger** | 8765 | Log processing & WebSocket | Python |
| **Dashboard** | 3000 | Real-time visualization | Node.js + Chart.js |
| **MongoDB** | 27017 | Data storage | MongoDB |

## 🔧 Configuration

### Environment Variables

Create `.env` file for customization:

```env
# MongoDB
MONGO_URI=mongodb://mongodb:27017/
MONGO_DB=honeypot

# WebSocket
WS_HOST=0.0.0.0
WS_PORT=8765

# Security
EGRESS_BLOCKING=true
FAIL2BAN_ENABLED=true

# AI Analysis
AI_ANALYSIS_INTERVAL=1800
RISK_THRESHOLD=70
```

### Custom Honeypot Configuration

Edit `cowrie/cowrie.cfg` for SSH/Telnet settings:
```ini
[ssh]
enabled = true
port = 2222

[telnet]
enabled = true
port = 2223
```

## 📈 Performance Metrics

- **Latency**: < 3 seconds from attack to visualization
- **Capacity**: 100+ unique attacks per day
- **Storage**: Structured event schema with full audit trail
- **Real-time**: WebSocket streaming with <1s updates

## 🎯 Use Cases

### 🏆 Cybersecurity Competitions
- Perfect for national cybersecurity competitions
- Demonstrates real-world attack patterns
- Provides hands-on threat analysis experience

### 🔬 Security Research
- Capture and analyze IoT attack trends
- Study attacker techniques and tools
- Develop defensive strategies

### 🏢 Enterprise Security
- Understand your attack surface
- Test security monitoring capabilities
- Train SOC analysts with real attack data

## 🗂️ Project Structure

```
iot-honeypot/
├── 📁 data-logger-parser/    # Log processing & real-time pipeline
├── 📁 cowrie/               # SSH/Telnet honeypot
├── 📁 http-honeypot/        # HTTP device simulation
├── 📁 dashboard/            # Web dashboard
├── 📁 database/             # MongoDB setup & schemas
├── 📁 security/             # Firewall rules & hardening
├── 📁 tests/               # Comprehensive test suite
├── 📁 docs/                # Documentation
└── docker-compose.yml      # Full system orchestration
```

## 🔬 API Endpoints

### Data Logger API
```http
GET /api/events?limit=100      # Get recent attacks
GET /api/stats                 # System statistics
WS  /ws                       # Real-time event stream
```

### Dashboard API
```http
GET /api/attack-timeline      # Attack frequency data
GET /api/top-commands         # Most used commands
GET /api/geo-data            # Attack location data
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
docker-compose exec data-logger python -m pytest tests/ -v

# Performance testing
docker-compose exec data-logger python tests/test_performance.py

# Security testing
./tests/security_tests/penetration-test.sh
```

## 📊 Sample Attack Data

The system captures:
- **Authentication attempts** (usernames/passwords)
- **Shell commands** executed by attackers
- **Network reconnaissance** activities
- **Malware download** attempts
- **Geolocation data** of attackers
- **Timing patterns** and session duration

## 🔒 Security Considerations

⚠️ **Important Security Notes:**

- 🚫 Never deploy on production networks
- 🔒 Use isolated lab environment only
- 📜 Ensure legal compliance in your jurisdiction
- 👮 Obtain proper authorization before deployment
- 🛡️ Regularly update and patch the system

### Safety Features

- **Egress blocking**: No outbound connections from honeypots
- **Network isolation**: Docker bridge network segregation
- **Fail2ban integration**: Automatic IP blocking
- **Resource limits**: Container resource constraints
- **Regular updates**: Security patch management

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/iot-honeypot.git
cd iot-honeypot

# Development mode with live reload
docker-compose -f docker-compose.dev.yml up --build

# Run tests
docker-compose run --rm data-logger pytest
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Documentation](docs/README.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/iot-honeypot/issues)
- 💬 [Discussions](https://github.com/yourusername/iot-honeypot/discussions)
- 📧 Email: security-team@example.com

## 🙏 Acknowledgments

- **Cowrie Honeypot** - SSH/Telnet emulation
- **MongoDB** - Data storage and analytics
- **Chart.js** - Visualization components
- **Docker** - Container orchestration

---

<div align="center">

**⭐ Star this repo if you find it useful!**

*Built with ❤️ for the cybersecurity community*

</div>

## 🎓 Academic Use

This project is ideal for:
- 🏫 University cybersecurity courses
- 🔬 Research papers on IoT security
- 🎯 Capture The Flag (CTF) competitions
- 📊 Threat intelligence analysis

### Citation
If you use this project in academic research, please cite:
```bibtex
@software{iot_honeypot_2024,
  title = {IoT Honeypot with Real-Time Attack Visualization},
  author = {eybasa },
  year = {2025},
  url = {https://github.com/nediusman/iot-honeypot}
}
```

## 📞 Contact

**Project Maintainer**: NEDI USMAN  
**Email**: nediusman92@gmail.com  
**Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

<div align="center">

**🚨 Stay Secure | 🛡️ Monitor Threats | 📊 Visualize Attacks**

