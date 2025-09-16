// Mock API for demonstration
export const fetchData = async (endpoint) => {
  switch(endpoint) {
    case "/api/attacks":
      return [
        { id: 1, ip: '192.168.1.10', service: 'SSH', status: 'blocked', time: '1 min ago' },
        { id: 2, ip: '10.0.0.5', service: 'Telnet', status: 'captured', time: '5 min ago' }
      ];
    case "/api/attacks/geo":
      return [
        { country: 'China', attacks: 156, percentage: 35 },
        { country: 'USA', attacks: 67, percentage: 15 }
      ];
    case "/api/attacks/top-commands":
      return [
        { command: 'wget malware.sh', count: 34, risk: 'high' },
        { command: 'cat /etc/passwd', count: 45, risk: 'medium' }
      ];
    case "/api/attacks/recent":
      return [
        { id: 1, ip: '192.168.1.100', country: 'CN', time: '2 min ago', service: 'SSH', status: 'blocked' },
        { id: 2, ip: '10.0.0.50', country: 'US', time: '5 min ago', service: 'Telnet', status: 'captured' }
      ];
    case "/api/attacks/realtime":
      return {
        time: new Date().toLocaleTimeString(),
        attacks: Math.floor(Math.random()*50)+10,
        ssh: Math.floor(Math.random()*30)+5,
        telnet: Math.floor(Math.random()*20)+3
      };
    case "/api/system/status":
      return [
        { name: 'Honeypot-1', cpu: 23, memory: 45, description: 'SSH & Telnet honeypot' },
        { name: 'Honeypot-2', cpu: 12, memory: 60, description: 'Web honeypot' }
      ];
    case "/api/ai/insights":
      return [
        { level: 'HIGH', summary: 'Coordinated attack detected', details: '15 IPs from China targeting SSH' },
        { level: 'MEDIUM', summary: 'Suspicious activity spike', details: '2-4 AM unusual traffic' }
      ];
    default:
      return [];
  }
}
