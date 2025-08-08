# Cyber-Group-20
INSA summer camp, CyberSecurity Dept. Group 20.

# IoT Honeypot with Real-Time Attack Visualization
 # Project Highlight
        This project builds a software-based honeypot that simulates vulnerable IoT devices (like smart cameras, routers, or thermostats)          to attract and trap attackers. By capturing attacker activity and commands, the system collects data on emerging threats targeting         IoT devices.
        A real-time web dashboard will visualize this data, showing where attacks come from, what commands attackers use, and how                  frequently attacks happen. This helps defenders understand attacker behavior and improve IoT security.
# Importance
        •	IoT devices are among the most vulnerable targets on the internet due to poor security.
        •	Attackers and automated bots constantly scan for easy IoT targets.
        •	Real IoT hardware is expensive and complex; software simulation allows us to safely study attacker techniques.
        •	The project combines network security, deception techniques, and data visualization into a practical tool.
        •	It teaches real-world cybersecurity skills beyond simple vulnerability scanning.
 # Project Goals
        •	Develop fake IoT services (SSH, Telnet, HTTP interfaces) that mimic real devices.
        •	Capture and log attacker connections, commands, and payloads.
        •	Enrich captured data with attacker location and threat type.
        •	Present an intuitive dashboard to visualize attack trends in real time.
        •	Ensure the system is safe to run and easy to deploy.
 # Team Memebers' Roles and Responsibilities
        Member 1 - Honeypot Engineer: Build and customize the fake IoT services that interact with attackers.
        Member 2 - Data Logger & Parser: Design and implement data collection, extracting meaningful information from attacker activity.
        Member 3 - Threat Analyst: Analyze attacker behavior patterns, enrich data with geolocation and risk scoring.
        Member 4 - Frontend Developer: Create the dashboard interface that visualizes attacks clearly and in real time.
        Member 5 - Infrastructure Engineer: Manage deployment, security, and system stability of the honeypot environment.
# Tools That will be used
        •	Cowrie - SSH/Telnet honeypot emulating IoT device shells
        •	Python - For log parsing, data enrichment, and risk scoring
        •	Flask or Node.js - To build the fake IoT device web interface (HTTP honeypot)
        •	SQLite or MongoDB - To store captured attack data and logs
        •	MaxMind GeoLite2 - For IP geolocation enrichment
        •	Chart.js / Leaflet.js - For real-time attack visualization and interactive maps on the dashboard
        •	Docker - To containerize the honeypot environment and simplify deployment
        •	fail2ban / iptables / UFW - For securing the honeypot and preventing misuse
  
 # Expected Results
        •	A fully functional honeypot that attracts and traps malicious connections.
        •	Detailed logs of attacker activity with contextual information.
        •	An interactive web dashboard showing live attack maps, command frequency, and attack timelines.
        •	A final report analyzing attacker trends and recommendations for IoT security improvements.
