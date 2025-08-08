# Cyber-Group-20
INSA summer camp, CyberSecurity Dept. Group 20.

## IoT Honeypot with Real-Time Attack Visualization

## Project Highlight
- This project builds a software-based honeypot that simulates vulnerable IoT devices (like smart cameras, routers, or thermostats) to attract and trap attackers. By capturing attacker activity and commands, the system collects data on emerging threats targeting IoT devices.
- A real-time web dashboard will visualize this data, showing where attacks come from, what commands attackers used, and how frequently attacks happen. This helps defenders understand attacker behavior and improve IoT security.

## Importance
- IoT devices are among the most vulnerable targets on the internet due to poor security.
- Attackers and automated bots constantly scan for easy IoT targets.
- Real IoT hardware is expensive and complex; software simulation allows us to safely study attacker techniques.
- The project combines network security, deception techniques, and data visualization into a practical tool.
- It teaches real-world cybersecurity skills beyond simple vulnerability scanning.

## Project Goals
- Develop fake IoT services (SSH, Telnet, HTTP interfaces) that mimic real devices.
- Capture and log attacker connections, commands, and payloads.
- Enrich captured data with attacker location and threat type.
- Present an intuitive dashboard to visualize attack trends in real time.
- Ensure the system is safe to run and easy to deploy.

## Team Members' Roles and Responsibilities
- **Member 1 - Honeypot Engineer**: Build and customize the fake IoT services that interact with attackers.
- **Member 2 - Data Logger & Parser**: Design and implement data collection, extracting meaningful information from attacker activity.
- **Member 3 - Threat Analyst**: Analyze attacker behavior patterns, enrich data with geolocation and risk scoring.
- **Member 4 - Frontend Developer**: Create the dashboard interface that visualizes attacks clearly and in real time.
- **Member 5 - Infrastructure Engineer**: Manage deployment, security, and system stability of the honeypot environment.

## Tools That Will Be Used
- **Cowrie** - SSH/Telnet honeypot emulating IoT device shells
- **Python** - For log parsing, data enrichment, and risk scoring
- **Flask or Node.js** - To build the fake IoT device web interface (HTTP honeypot)
- **SQLite or MongoDB** - To store captured attack data and logs
- **MaxMind GeoLite2** - For IP geolocation enrichment
- **Chart.js / Leaflet.js** - For real-time attack visualization and interactive maps on the dashboard
- **Docker** - To containerize the honeypot environment and simplify deployment
- **fail2ban / iptables / UFW** - For securing the honeypot and preventing misuse

## Expected Results
- A fully functional honeypot that attracts and traps malicious connections.
- Detailed logs of attacker activity with contextual information.
- An interactive web dashboard showing live attack maps, command frequency, and attack timelines.
- A final report analyzing attacker trends and recommendations for IoT security improvements.





# VulnHunt + SIEM: Cybersecurity Training Platform

## Project Overview
VulnHunt is currently a platform for learning offensive security skills (Red Team). This project enhances VulnHunt by integrating a **Security Information and Event Management (SIEM)** system, enabling defensive operations (Blue Team) as well.

The result is a complete cyber battlefield where learners can both attack and defend, gaining experience from both perspectives.

## Why Add SIEM?
A SIEM functions like a security camera system for networks — it monitors activity, detects suspicious behavior, records events, and visualizes them in dashboards.

With SIEM integration:
- Attackers still attempt to breach the system.
- Defenders monitor real-time dashboards and respond to threats.

## How It Works
1. Learners attempt challenges in VulnHunt as attackers.
2. All actions are logged with details like IP, timestamp, and attack type.
3. Logs are processed and sent into the SIEM stack (Filebeat → Logstash → Elasticsearch → Kibana).
4. Dashboards display activity and trigger alerts for suspicious behavior.

## Key Features to Be Added
- Enhanced logging in the VulnHunt web application.
- ELK Stack (Elasticsearch, Logstash, Kibana) integration in Docker.
- Real-time dashboards showing login attempts, attack patterns, and user activity.
- Alert system sending notifications to administrators via Slack or Telegram.

## Roadmap
**Phase 1** – Existing VulnHunt challenges, scoring system, and Telegram bot.  
**Phase 2** – Full SIEM integration with event logging and dashboards.  
**Phase 3** – Blue Team mode for live defensive monitoring and threat hunting.  
**Phase 4** – External integrations for alerts and vulnerability scanners.  
**Phase 5** – Partnerships with legal bug bounty programs and professional training connections.

## Blue Team Capabilities
- Monitor live attack data in SIEM dashboards.
- Detect suspicious patterns such as brute-force attempts, SQLi, and XSS.
- Investigate attacker origins, tools, and behavior.
- Prioritize threats and respond with appropriate defenses.

## Tools to Be Integrated
- **Kibana Dashboards** – Real-time visualizations of attack activity.
- **Alerts System** – Notifications for high-risk activity.
- **Search & Filtering** – Focus on specific IPs, users, or attacks.
- **Threat Timeline** – Sequence of events leading to each attack.

## Expected Outcome
VulnHunt will evolve into:
- A fun, challenge-based Red Team training environment.
- A realistic Blue Team SOC simulator.
- A platform that teaches practical cybersecurity skills from both perspectives.
