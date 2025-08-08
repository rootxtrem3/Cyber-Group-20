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
