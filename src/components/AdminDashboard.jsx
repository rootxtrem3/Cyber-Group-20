import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, Activity, Globe, Users, AlertTriangle, TrendingUp, Server, LogOut,
  Eye, Brain, Clock, Zap, Settings, Download
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [realTimeData, setRealTimeData] = useState([])
  const [isLive, setIsLive] = useState(true)

  // ------------------- MOCK DATA -------------------
  const generateAttackData = () =>
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      attacks: Math.floor(Math.random() * 50) + 20,
      ssh: Math.floor(Math.random() * 30) + 5,
      telnet: Math.floor(Math.random() * 20) + 3,
      http: Math.floor(Math.random() * 15) + 2
    }))

  const mockAttackData = generateAttackData()

  const mockGeoData = [
    { country: 'China', attacks: 156, percentage: 35 },
    { country: 'Russia', attacks: 89, percentage: 20 },
    { country: 'USA', attacks: 67, percentage: 15 },
    { country: 'Brazil', attacks: 45, percentage: 10 },
    { country: 'India', attacks: 34, percentage: 8 },
    { country: 'Others', attacks: 54, percentage: 12 },
  ]

  const mockTopCommands = [
    { command: 'cat /proc/cpuinfo', count: 120, risk: 'medium' },
    { command: 'wget malicious.sh', count: 95, risk: 'high' },
    { command: 'ps aux', count: 65, risk: 'low' },
    { command: 'uname -a', count: 50, risk: 'low' },
    { command: 'curl -O exploit.py', count: 42, risk: 'high' },
    { command: 'rm -rf /tmp/*', count: 30, risk: 'medium' },
  ]

  const mockRecentAttacks = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: ['CN','RU','US','BR','IN'][i % 5],
    time: `${Math.floor(Math.random() * 59)} min ago`,
    service: ['SSH','Telnet','HTTP','FTP'][i % 4],
    status: ['blocked','captured','analyzing'][i % 3]
  }))

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  // ------------------- REAL-TIME DATA -------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        const newData = {
          time: new Date().toLocaleTimeString(),
          attacks: Math.floor(Math.random() * 50) + 10,
          ssh: Math.floor(Math.random() * 30) + 5,
          telnet: Math.floor(Math.random() * 20) + 3,
          http: Math.floor(Math.random() * 15) + 1
        }
        setRealTimeData(prev => [...prev.slice(-19), newData])
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isLive])

  // ------------------- STAT CARD -------------------
  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
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
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Attacks Today" value="1,247" change={12} icon={AlertTriangle} color="red" />
          <StatCard title="Unique IPs" value="89" change={-3} icon={Globe} color="blue" />
          <StatCard title="Active Sessions" value="23" change={8} icon={Users} color="green" />
          <StatCard title="Honeypots Online" value="12/12" change={0} icon={Server} color="purple" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* ------------------- OVERVIEW TAB ------------------- */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attack Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Attack Timeline (24h)</CardTitle>
                  <CardDescription>SSH, Telnet & HTTP attack patterns</CardDescription>
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
                    {mockTopCommands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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

          {/* ------------------- REAL-TIME TAB ------------------- */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Real-time Monitoring</h2>
              <Button variant={isLive ? 'destructive' : 'default'} onClick={() => setIsLive(!isLive)}>
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
                    <Line type="monotone" dataKey="http" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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

          {/* ------------------- ANALYSIS TAB ------------------- */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attack Patterns</CardTitle>
                  <CardDescription>Behavioral analysis of attackers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payload Analysis</CardTitle>
                  <CardDescription>Malicious content detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-semibold text-red-700">Malware Downloads</h4>
                    <p className="text-sm">12 unique malware samples detected</p>
                  </div>
                  <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-semibold text-yellow-700">Credential Harvesting</h4>
                    <p className="text-sm">89 login attempts with common passwords</p>
                  </div>
                  <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-semibold text-blue-700">Reconnaissance</h4>
                    <p className="text-sm">156 system enumeration commands</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ------------------- AI INSIGHTS TAB ------------------- */}
          <TabsContent value="ai-insights" className="space-y-6">
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
                    <h4 className="font-semibold">Increase Logging Depth</h4>
                    <p className="text-sm text-muted-foreground">Flag commands like wget & curl for detailed analysis</p>
                  </div>
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <h4 className="font-semibold">Honeypot Scaling Recommendation</h4>
                    <p className="text-sm text-muted-foreground">Deploy +5 honeypots to handle predicted load spikes</p>
                  </div>
                  <Server className="w-6 h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- SYSTEM TAB ------------------- */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Server Load</CardTitle>
                  <CardDescription>CPU & Memory usage over last hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateAttackData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attacks" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Server & Network metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span>56%</span>
                  </div>
                  <div className="w-full h-3 bg-muted/20 rounded">
                    <div className="h-3 bg-blue-500 rounded" style={{ width: '56%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span>72%</span>
                  </div>
                  <div className="w-full h-3 bg-muted/20 rounded">
                    <div className="h-3 bg-green-500 rounded" style={{ width: '72%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span>Disk Usage</span>
                    <span>41%</span>
                  </div>
                  <div className="w-full h-3 bg-muted/20 rounded">
                    <div className="h-3 bg-red-500 rounded" style={{ width: '41%' }}></div>
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
