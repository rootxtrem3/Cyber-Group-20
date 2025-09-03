import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Activity, 
  Globe, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Server, 
  LogOut,
  Eye,
  Terminal,
  MapPin,
  Clock,
  Zap,
  Brain,
  Settings,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [realTimeData, setRealTimeData] = useState([])
  const [isLive, setIsLive] = useState(true)

  // Mock data for demonstration
  const mockAttackData = [
    { time: '00:00', attacks: 12, ssh: 8, telnet: 4 },
    { time: '04:00', attacks: 19, ssh: 12, telnet: 7 },
    { time: '08:00', attacks: 35, ssh: 22, telnet: 13 },
    { time: '12:00', attacks: 28, ssh: 18, telnet: 10 },
    { time: '16:00', attacks: 42, ssh: 28, telnet: 14 },
    { time: '20:00', attacks: 31, ssh: 20, telnet: 11 },
  ]

  const mockGeoData = [
    { country: 'China', attacks: 156, percentage: 35 },
    { country: 'Russia', attacks: 89, percentage: 20 },
    { country: 'USA', attacks: 67, percentage: 15 },
    { country: 'Brazil', attacks: 45, percentage: 10 },
    { country: 'India', attacks: 34, percentage: 8 },
    { country: 'Others', attacks: 54, percentage: 12 },
  ]

  const mockTopCommands = [
    { command: 'cat /proc/cpuinfo', count: 89, risk: 'medium' },
    { command: 'wget malicious.sh', count: 67, risk: 'high' },
    { command: 'ps aux', count: 45, risk: 'low' },
    { command: 'uname -a', count: 34, risk: 'low' },
    { command: 'curl -O exploit.py', count: 28, risk: 'high' },
  ]

  const mockRecentAttacks = [
    { id: 1, ip: '192.168.1.100', country: 'CN', time: '2 min ago', service: 'SSH', status: 'blocked' },
    { id: 2, ip: '10.0.0.50', country: 'RU', time: '5 min ago', service: 'Telnet', status: 'captured' },
    { id: 3, ip: '172.16.0.25', country: 'US', time: '8 min ago', service: 'HTTP', status: 'analyzing' },
    { id: 4, ip: '203.0.113.15', country: 'BR', time: '12 min ago', service: 'SSH', status: 'blocked' },
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      if (isLive) {
        const newData = {
          time: new Date().toLocaleTimeString(),
          attacks: Math.floor(Math.random() * 50) + 10,
          ssh: Math.floor(Math.random() * 30) + 5,
          telnet: Math.floor(Math.random() * 20) + 3
        }
        setRealTimeData(prev => [...prev.slice(-19), newData])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {change > 0 ? '+' : ''}{change}% from last hour
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
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
            <Badge variant={isLive ? 'default' : 'secondary'} className="animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              {isLive ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Attacks Today"
            value="1,247"
            change={12}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Unique IPs"
            value="89"
            change={-3}
            icon={Globe}
            color="blue"
          />
          <StatCard
            title="Active Sessions"
            value="23"
            change={8}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Honeypots Online"
            value="12/12"
            change={0}
            icon={Server}
            color="purple"
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attack Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Attack Timeline (24h)</CardTitle>
                  <CardDescription>SSH and Telnet attack patterns</CardDescription>
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
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Commands */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Attack Commands</CardTitle>
                  <CardDescription>Most frequently executed commands</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTopCommands.map((cmd, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <code className="text-sm font-mono">{cmd.command}</code>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={cmd.risk === 'high' ? 'destructive' : cmd.risk === 'medium' ? 'default' : 'secondary'}>
                              {cmd.risk}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{cmd.count} times</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Attacks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attack Sessions</CardTitle>
                <CardDescription>Latest honeypot interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRecentAttacks.map((attack) => (
                    <div key={attack.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div>
                          <div className="font-mono text-sm">{attack.ip}</div>
                          <div className="text-xs text-muted-foreground">{attack.country} • {attack.service}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={attack.status === 'blocked' ? 'destructive' : attack.status === 'captured' ? 'default' : 'secondary'}>
                          {attack.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{attack.time}</span>
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

          <TabsContent value="realtime" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Real-time Monitoring</h2>
              <Button
                variant={isLive ? 'destructive' : 'default'}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? 'Pause' : 'Resume'} Live Feed
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Live Attack Stream</CardTitle>
                <CardDescription>Real-time attack visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attacks" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="ssh" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="telnet" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

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
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{country.attacks}</div>
                          <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attack Patterns</CardTitle>
                  <CardDescription>Behavioral analysis of attackers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Session Duration Analysis</h4>
                      <p className="text-sm text-muted-foreground">Average session: 4.2 minutes</p>
                      <p className="text-sm text-muted-foreground">Longest session: 23 minutes</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Command Frequency</h4>
                      <p className="text-sm text-muted-foreground">Most active time: 14:00-16:00 UTC</p>
                      <p className="text-sm text-muted-foreground">Peak commands/hour: 156</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Threat Level Distribution</h4>
                      <p className="text-sm text-muted-foreground">High: 23% | Medium: 45% | Low: 32%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payload Analysis</CardTitle>
                  <CardDescription>Malicious content detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                      <h4 className="font-semibold text-red-700 dark:text-red-400">Malware Downloads</h4>
                      <p className="text-sm">12 unique malware samples detected</p>
                    </div>
                    <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Credential Harvesting</h4>
                      <p className="text-sm">89 login attempts with common passwords</p>
                    </div>
                    <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400">Reconnaissance</h4>
                      <p className="text-sm">156 system enumeration commands</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>AI-Powered Threat Analysis</span>
                </CardTitle>
                <CardDescription>Automated insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Threat Patterns Detected</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-700 dark:text-red-400">High Priority</span>
                        </div>
                        <p className="text-sm">Coordinated attack from 15 IPs in China targeting SSH services</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-700 dark:text-yellow-400">Medium Priority</span>
                        </div>
                        <p className="text-sm">Unusual activity spike detected between 02:00-04:00 UTC</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recommended Actions</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-700 dark:text-blue-400">Immediate</span>
                        </div>
                        <p className="text-sm">Block IP range 192.168.1.0/24 - high malicious activity</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Settings className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700 dark:text-green-400">Configuration</span>
                        </div>
                        <p className="text-sm">Update honeypot signatures for new malware variants</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">AI Analysis Report</h4>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last updated: {new Date().toLocaleString()} • Next scan in 15 minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Honeypot Status</CardTitle>
                  <CardDescription>System health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'SSH Honeypot', status: 'online', cpu: '12%', memory: '256MB' },
                      { name: 'Telnet Honeypot', status: 'online', cpu: '8%', memory: '128MB' },
                      { name: 'HTTP Honeypot', status: 'online', cpu: '15%', memory: '512MB' },
                      { name: 'FTP Honeypot', status: 'maintenance', cpu: '0%', memory: '0MB' },
                    ].map((honeypot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${honeypot.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="font-medium">{honeypot.name}</span>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>CPU: {honeypot.cpu}</div>
                          <div>RAM: {honeypot.memory}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Security and monitoring settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Auto-blocking</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Log retention</span>
                      <Badge variant="secondary">30 days</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alert notifications</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI analysis</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <Button className="w-full mt-4">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard

