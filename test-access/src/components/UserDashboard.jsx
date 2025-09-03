import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Shield, 
  Activity, 
  Search, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  LogOut,
  Eye,
  Terminal,
  MapPin,
  Clock,
  FileText,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon
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

const UserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('monitoring')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  // Mock data for user dashboard
  const mockThreatData = [
    { time: '00:00', threats: 8, malware: 3, reconnaissance: 5 },
    { time: '04:00', threats: 12, malware: 5, reconnaissance: 7 },
    { time: '08:00', threats: 25, malware: 10, reconnaissance: 15 },
    { time: '12:00', threats: 18, malware: 7, reconnaissance: 11 },
    { time: '16:00', threats: 32, malware: 15, reconnaissance: 17 },
    { time: '20:00', threats: 22, malware: 9, reconnaissance: 13 },
  ]

  const mockThreatTypes = [
    { name: 'Malware', value: 35, color: '#ff6b6b' },
    { name: 'Reconnaissance', value: 28, color: '#4ecdc4' },
    { name: 'Brute Force', value: 20, color: '#45b7d1' },
    { name: 'Exploitation', value: 12, color: '#96ceb4' },
    { name: 'Other', value: 5, color: '#feca57' },
  ]

  const mockAttackSessions = [
    { 
      id: 1, 
      ip: '192.168.1.100', 
      country: 'CN', 
      startTime: '14:23:15', 
      duration: '4m 32s', 
      commands: 23, 
      threat: 'high',
      service: 'SSH'
    },
    { 
      id: 2, 
      ip: '10.0.0.50', 
      country: 'RU', 
      startTime: '14:18:42', 
      duration: '2m 15s', 
      commands: 8, 
      threat: 'medium',
      service: 'Telnet'
    },
    { 
      id: 3, 
      ip: '172.16.0.25', 
      country: 'US', 
      startTime: '14:15:33', 
      duration: '7m 48s', 
      commands: 45, 
      threat: 'high',
      service: 'SSH'
    },
    { 
      id: 4, 
      ip: '203.0.113.15', 
      country: 'BR', 
      startTime: '14:12:09', 
      duration: '1m 23s', 
      commands: 3, 
      threat: 'low',
      service: 'HTTP'
    },
  ]

  const mockIOCs = [
    { type: 'IP', value: '192.168.1.100', threat: 'high', firstSeen: '2 hours ago', lastSeen: '5 min ago' },
    { type: 'Hash', value: 'a1b2c3d4e5f6...', threat: 'high', firstSeen: '1 day ago', lastSeen: '1 hour ago' },
    { type: 'Domain', value: 'malicious.example.com', threat: 'medium', firstSeen: '3 hours ago', lastSeen: '30 min ago' },
    { type: 'URL', value: 'http://evil.site/payload', threat: 'high', firstSeen: '45 min ago', lastSeen: '10 min ago' },
  ]

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
                {change > 0 ? '+' : ''}{change}% vs yesterday
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
              <h1 className="text-xl font-bold">Threat Intelligence Dashboard</h1>
            </div>
            <Badge variant="outline" className="animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              MONITORING
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
            title="Threats Detected"
            value="89"
            change={15}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Active Sessions"
            value="12"
            change={-8}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="IOCs Identified"
            value="156"
            change={23}
            icon={Search}
            color="yellow"
          />
          <StatCard
            title="Reports Generated"
            value="7"
            change={0}
            icon={FileText}
            color="green"
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Threat Monitoring</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedTimeRange === '1h' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange('1h')}
                >
                  1H
                </Button>
                <Button
                  variant={selectedTimeRange === '24h' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange('24h')}
                >
                  24H
                </Button>
                <Button
                  variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange('7d')}
                >
                  7D
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Threat Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Threat Activity Timeline</CardTitle>
                  <CardDescription>Real-time threat detection over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockThreatData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="malware" stackId="1" stroke="#ff6b6b" fill="#ff6b6b" />
                      <Area type="monotone" dataKey="reconnaissance" stackId="1" stroke="#4ecdc4" fill="#4ecdc4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Threat Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Threat Types</CardTitle>
                  <CardDescription>Distribution of detected threats</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockThreatTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockThreatTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {mockThreatTypes.map((threat, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: threat.color }}></div>
                          <span>{threat.name}</span>
                        </div>
                        <span className="font-medium">{threat.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>Latest threat detections and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Malware', message: 'Suspicious binary downloaded from 192.168.1.100', time: '2 min ago', severity: 'high' },
                    { type: 'Brute Force', message: 'Multiple failed SSH login attempts detected', time: '5 min ago', severity: 'medium' },
                    { type: 'Reconnaissance', message: 'Port scanning activity from multiple IPs', time: '8 min ago', severity: 'medium' },
                    { type: 'Exploitation', message: 'CVE-2023-1234 exploit attempt blocked', time: '12 min ago', severity: 'high' },
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
                        <div>
                          <div className="font-medium">{alert.type}</div>
                          <div className="text-sm text-muted-foreground">{alert.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Attack Sessions</h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active and Recent Sessions</CardTitle>
                <CardDescription>Detailed view of honeypot interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAttackSessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="font-mono text-sm font-medium">{session.ip}</div>
                          <Badge variant="outline">{session.country}</Badge>
                          <Badge variant="secondary">{session.service}</Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={session.threat === 'high' ? 'destructive' : session.threat === 'medium' ? 'default' : 'secondary'}>
                            {session.threat} risk
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <Clock className="w-4 h-4 inline mr-1" />
                          Started: {session.startTime}
                        </div>
                        <div>
                          <Terminal className="w-4 h-4 inline mr-1" />
                          Duration: {session.duration}
                        </div>
                        <div>
                          <BarChart3 className="w-4 h-4 inline mr-1" />
                          Commands: {session.commands}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Threat Intelligence</h2>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export IOCs
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Indicators of Compromise */}
              <Card>
                <CardHeader>
                  <CardTitle>Indicators of Compromise (IOCs)</CardTitle>
                  <CardDescription>Identified malicious indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockIOCs.map((ioc, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{ioc.type}</Badge>
                          <Badge variant={ioc.threat === 'high' ? 'destructive' : 'default'}>
                            {ioc.threat}
                          </Badge>
                        </div>
                        <div className="font-mono text-sm mb-2">{ioc.value}</div>
                        <div className="text-xs text-muted-foreground">
                          First seen: {ioc.firstSeen} • Last seen: {ioc.lastSeen}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Attack Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle>Attack Patterns</CardTitle>
                  <CardDescription>Behavioral analysis and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Most Targeted Services</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>SSH (Port 22)</span>
                          <span className="font-medium">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Telnet (Port 23)</span>
                          <span className="font-medium">23%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HTTP (Port 80)</span>
                          <span className="font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Common Attack Vectors</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Credential stuffing attacks</div>
                        <div>• Malware deployment via wget/curl</div>
                        <div>• System reconnaissance commands</div>
                        <div>• Privilege escalation attempts</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Peak Activity Times</h4>
                      <div className="space-y-2 text-sm">
                        <div>• 14:00-16:00 UTC (Highest)</div>
                        <div>• 02:00-04:00 UTC (Secondary peak)</div>
                        <div>• 20:00-22:00 UTC (Moderate)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Security Reports</h2>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Generated threat intelligence reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Weekly Threat Summary', date: '2024-01-15', type: 'Weekly', status: 'completed' },
                      { title: 'Malware Analysis Report', date: '2024-01-14', type: 'Incident', status: 'completed' },
                      { title: 'IOC Intelligence Brief', date: '2024-01-13', type: 'Intelligence', status: 'completed' },
                      { title: 'Monthly Security Overview', date: '2024-01-01', type: 'Monthly', status: 'completed' },
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground">{report.date} • {report.type}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{report.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Report Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Available report formats and schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Daily Threat Brief', description: 'Summary of daily threat activity', schedule: 'Daily at 09:00' },
                      { name: 'Weekly Analysis', description: 'Comprehensive weekly threat analysis', schedule: 'Monday at 08:00' },
                      { name: 'IOC Export', description: 'Machine-readable IOC feed', schedule: 'Every 6 hours' },
                      { name: 'Incident Report', description: 'Detailed incident investigation', schedule: 'On-demand' },
                    ].map((template, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="font-medium mb-1">{template.name}</div>
                        <div className="text-sm text-muted-foreground mb-2">{template.description}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{template.schedule}</span>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    ))}
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

export default UserDashboard

