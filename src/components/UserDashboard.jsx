import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Shield, Activity, Search as SearchIcon, Filter, AlertTriangle, TrendingUp, LogOut,
  Eye, Terminal, Clock, FileText, Download, RefreshCw, BarChart3, Sun, Moon
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

const COLOR_STYLES = {
  red:   { bg: 'bg-red-100 dark:bg-red-900/20',     text: 'text-red-600' },
  blue:  { bg: 'bg-blue-100 dark:bg-blue-900/20',   text: 'text-blue-600' },
  yellow:{ bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600' },
  green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600' },
}

const initialThreatData = [
  { time: '00:00', malware: 3, reconnaissance: 5 },
  { time: '04:00', malware: 5, reconnaissance: 7 },
  { time: '08:00', malware: 10, reconnaissance: 15 },
  { time: '12:00', malware: 7, reconnaissance: 11 },
  { time: '16:00', malware: 15, reconnaissance: 17 },
  { time: '20:00', malware: 9, reconnaissance: 13 },
]

const initialThreatTypes = [
  { name: 'Malware', value: 35, color: '#ff6b6b' },
  { name: 'Reconnaissance', value: 28, color: '#4ecdc4' },
  { name: 'Brute Force', value: 20, color: '#45b7d1' },
  { name: 'Exploitation', value: 12, color: '#96ceb4' },
  { name: 'Other', value: 5, color: '#feca57' },
]

const initialSessions = [
  { id: 1, ip: '192.168.1.100', country: 'CN', startTime: '14:23:15', duration: '4m 32s', commands: 23, threat: 'high', service: 'SSH' },
  { id: 2, ip: '10.0.0.50',    country: 'RU', startTime: '14:18:42', duration: '2m 15s', commands: 8,  threat: 'medium', service: 'Telnet' },
  { id: 3, ip: '172.16.0.25',  country: 'US', startTime: '14:15:33', duration: '7m 48s', commands: 45, threat: 'high', service: 'SSH' },
  { id: 4, ip: '203.0.113.15', country: 'BR', startTime: '14:12:09', duration: '1m 23s', commands: 3,  threat: 'low', service: 'HTTP' },
]

const initialIOCs = [
  { type: 'IP',     value: '192.168.1.100',         threat: 'high',   firstSeen: '2 hours ago', lastSeen: '5 min ago' },
  { type: 'Hash',   value: 'a1b2c3d4e5f6...',       threat: 'high',   firstSeen: '1 day ago',   lastSeen: '1 hour ago' },
  { type: 'Domain', value: 'malicious.example.com', threat: 'medium', firstSeen: '3 hours ago', lastSeen: '30 min ago' },
  { type: 'URL',    value: 'http://evil.site/payload', threat: 'high', firstSeen: '45 min ago', lastSeen: '10 min ago' },
]

const initialReports = [
  { title: 'Weekly Threat Summary',   date: '2024-01-15', type: 'Weekly',      status: 'completed' },
  { title: 'Malware Analysis Report', date: '2024-01-14', type: 'Incident',    status: 'completed' },
  { title: 'IOC Intelligence Brief',  date: '2024-01-13', type: 'Intelligence',status: 'completed' },
  { title: 'Monthly Security Overview', date: '2024-01-01', type: 'Monthly',   status: 'completed' },
]

const initialAlerts = [
  { type: 'Malware',        message: 'Suspicious binary from 192.168.1.100',     time: '2 min ago',  severity: 'high' },
  { type: 'Brute Force',    message: 'Multiple failed SSH login attempts',       time: '5 min ago',  severity: 'medium' },
  { type: 'Reconnaissance', message: 'Port scanning from multiple IPs',          time: '8 min ago',  severity: 'medium' },
  { type: 'Exploitation',   message: 'CVE-2023-1234 exploit attempt blocked',    time: '12 min ago', severity: 'high' },
]

function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('monitoring')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [darkMode, setDarkMode] = useState(false)
  const [sessions] = useState(initialSessions)
  const [iocs] = useState(initialIOCs)
  const [reports] = useState(initialReports)
  const [alertFeed, setAlertFeed] = useState(initialAlerts)
  const [threatData, setThreatData] = useState(initialThreatData)
  const [threatTypes, setThreatTypes] = useState(initialThreatTypes)

  const [searchSession, setSearchSession] = useState('')
  const [searchIOC, setSearchIOC] = useState('')

  // Persist dark mode to <html> for Tailwind dark: variants
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [darkMode])

  // ---------- Live mock updates (charts + alerts) ----------
  const tickRef = useRef(0)
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1

      // Add a new point to AreaChart (keep last 12)
      const now = new Date()
      const hh = now.getHours().toString().padStart(2, '0')
      const mm = now.getMinutes().toString().padStart(2, '0')
      const newPoint = {
        time: `${hh}:${mm}`,
        malware: Math.max(1, Math.round(5 + 8 * Math.random() + (tickRef.current % 3))),
        reconnaissance: Math.max(1, Math.round(7 + 9 * Math.random()))
      }
      setThreatData(prev => {
        const next = [...prev, newPoint]
        return next.slice(-12)
      })

      // Slightly wiggle threat type distribution while keeping 100%
      setThreatTypes(prev => {
        const wiggles = prev.map(t => ({ ...t, value: Math.max(2, t.value + Math.round((Math.random() - 0.5) * 2)) }))
        const total = wiggles.reduce((s, t) => s + t.value, 0)
        return wiggles.map(t => ({ ...t, value: Math.round((t.value / total) * 100) }))
      })

      // Occasionally add an alert
      if (Math.random() < 0.35) {
        const candidates = [
          { type: 'Malware', severity: 'high', message: 'Malware dropper attempt via wget' },
          { type: 'Brute Force', severity: 'medium', message: 'SSH credential stuffing detected' },
          { type: 'Reconnaissance', severity: 'medium', message: 'Aggressive port scan from new subnet' },
          { type: 'Exploitation', severity: 'high', message: 'Blocked RCE attempt on HTTP (CVE pattern)' },
        ]
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        setAlertFeed(prev => [
          { ...pick, time: 'just now' },
          ...prev
        ].slice(0, 10))
      }
    }, 5000) // every 5s
    return () => clearInterval(interval)
  }, [])

  // Adaptive chart colors
  const chartColors = useMemo(() => (
    darkMode
      ? { grid: '#4b5563', axis: '#d1d5db', tooltipBg: '#1f2937', tooltipColor: '#f9fafb' }
      : { grid: '#e5e7eb', axis: '#111827', tooltipBg: '#ffffff', tooltipColor: '#111827' }
  ), [darkMode])

  // Derived values for stats
  const totalThreats = useMemo(
    () => threatData.reduce((sum, p) => sum + p.malware + p.reconnaissance, 0),
    [threatData]
  )

  // Filtering
  const filteredSessions = useMemo(() => {
    const q = searchSession.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter(s =>
      s.ip.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.service.toLowerCase().includes(q) ||
      `${s.commands}`.includes(q)
    )
  }, [sessions, searchSession])

  const filteredIOCs = useMemo(() => {
    const q = searchIOC.trim().toLowerCase()
    if (!q) return iocs
    return iocs.filter(i =>
      i.value.toLowerCase().includes(q) ||
      i.type.toLowerCase().includes(q) ||
      i.threat.toLowerCase().includes(q)
    )
  }, [iocs, searchIOC])

  // ---------- Export helpers ----------
  const exportIOCs = (format = 'csv') => {
    if (format === 'csv') {
      const csv = [
        ['Type', 'Value', 'Threat', 'First Seen', 'Last Seen'],
        ...iocs.map(i => [i.type, i.value, i.threat, i.firstSeen, i.lastSeen])
      ].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'iocs.csv'
      a.click()
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(iocs, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'iocs.json'
      a.click()
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(iocs)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'IOCs')
      XLSX.writeFile(wb, 'iocs.xlsx')
    }
  }

  const exportReportPDF = (report) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(report.title, 20, 20)
    doc.setFontSize(12)
    doc.text(`Date: ${report.date}`, 20, 30)
    doc.text(`Type: ${report.type}`, 20, 40)
    doc.text(`Status: ${report.status}`, 20, 50)
    doc.save(`${report.title.replace(/\s/g, '_')}.pdf`)
  }

  const exportAllReportsPDF = () => {
    const doc = new jsPDF()
    let y = 20
    reports.forEach((report) => {
      doc.setFontSize(16)
      doc.text(report.title, 20, y); y += 10
      doc.setFontSize(12)
      doc.text(`Date: ${report.date}`, 20, y); y += 6
      doc.text(`Type: ${report.type}`, 20, y); y += 6
      doc.text(`Status: ${report.status}`, 20, y); y += 12
      if (y > 270) { doc.addPage(); y = 20 }
    })
    doc.save('all_reports.pdf')
  }

  // ---------- UI bits ----------
  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const styles = COLOR_STYLES[color] || COLOR_STYLES.blue
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {typeof change === 'number' && (
                <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {change >= 0 ? '+' : ''}{change}% vs yesterday
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${styles.bg}`}>
              <Icon className={`w-6 h-6 ${styles.text}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="border-b bg-card/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40">
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
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setDarkMode(d => !d)}>
              {darkMode ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
              {darkMode ? 'Light' : 'Dark'}
            </Button>
            <span className="text-sm text-muted-foreground">Welcome, {user?.name ?? 'User'}</span>
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
          <StatCard title="Threats Detected" value={totalThreats} change={15} icon={AlertTriangle} color="red" />
          <StatCard title="Active Sessions" value={sessions.length} change={-8} icon={Activity} color="blue" />
          <StatCard title="IOCs Identified" value={iocs.length} change={23} icon={SearchIcon} color="yellow" />
          <StatCard title="Reports Generated" value={reports.length} change={0} icon={FileText} color="green" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Threat Monitoring</h2>
              <div className="flex items-center space-x-2">
                <Button variant={selectedTimeRange === '1h' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTimeRange('1h')}>1H</Button>
                <Button variant={selectedTimeRange === '24h' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTimeRange('24h')}>24H</Button>
                <Button variant={selectedTimeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTimeRange('7d')}>7D</Button>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Threat Activity Timeline</CardTitle>
                  <CardDescription>Real-time threat detections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={threatData}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="time" stroke={chartColors.axis} />
                      <YAxis stroke={chartColors.axis} />
                      <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, color: chartColors.tooltipColor }} />
                      <Legend wrapperStyle={{ color: chartColors.axis }} />
                      <Area type="monotone" dataKey="malware" stackId="1" stroke="#ff6b6b" fill="#ff6b6b" />
                      <Area type="monotone" dataKey="reconnaissance" stackId="1" stroke="#4ecdc4" fill="#4ecdc4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Threat Types</CardTitle>
                  <CardDescription>Distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={threatTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                        {threatTypes.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, color: chartColors.tooltipColor }} />
                      <Legend wrapperStyle={{ color: chartColors.axis }} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-4 space-y-2">
                    {threatTypes.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                          <span>{t.name}</span>
                        </div>
                        <span className="font-medium">{t.value}%</span>
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
                <CardDescription>Latest detections & events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertFeed.map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
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

          {/* Sessions */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-bold">Attack Sessions</h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by IP, country, service, commands..."
                  value={searchSession}
                  onChange={(e) => setSearchSession(e.target.value)}
                  className="w-72"
                />
                <Button variant="outline" size="sm"><Filter className="w-4 h-4" /></Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active & Recent Sessions</CardTitle>
                <CardDescription>Honeypot interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSessions.map(session => (
                    <div key={session.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center flex-wrap gap-2">
                          <div className="font-mono text-sm font-medium">{session.ip}</div>
                          <Badge variant="outline">{session.country}</Badge>
                          <Badge variant="secondary">{session.service}</Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={
                            session.threat === 'high' ? 'destructive'
                              : session.threat === 'medium' ? 'default'
                                : 'secondary'
                          }>
                            {session.threat} risk
                          </Badge>
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div><Clock className="w-4 h-4 inline mr-1" /> Started: {session.startTime}</div>
                        <div><Terminal className="w-4 h-4 inline mr-1" /> Duration: {session.duration}</div>
                        <div><BarChart3 className="w-4 h-4 inline mr-1" /> Commands: {session.commands}</div>
                      </div>
                    </div>
                  ))}
                  {filteredSessions.length === 0 && (
                    <div className="text-sm text-muted-foreground">No sessions match your search.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intelligence */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-bold">Threat Intelligence</h2>
              <div className="flex gap-2">
                <Button onClick={() => exportIOCs('csv')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                <Button onClick={() => exportIOCs('json')}><Download className="w-4 h-4 mr-2" /> JSON</Button>
                <Button onClick={() => exportIOCs('xlsx')}><Download className="w-4 h-4 mr-2" /> Excel</Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Search IOCs (value, type, threat)..."
                value={searchIOC}
                onChange={(e) => setSearchIOC(e.target.value)}
                className="w-72"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredIOCs.map((ioc, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="truncate">{ioc.value}</CardTitle>
                    <CardDescription>{ioc.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={ioc.threat === 'high' ? 'destructive' : 'default'}>{ioc.threat}</Badge>
                      <div className="text-xs text-muted-foreground">First: {ioc.firstSeen} | Last: {ioc.lastSeen}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredIOCs.length === 0 && (
                <div className="text-sm text-muted-foreground">No IOCs match your search.</div>
              )}
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Security Reports</h2>
              <Button onClick={exportAllReportsPDF}><Download className="w-4 h-4 mr-2" /> Export All PDF</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Generated threat intelligence reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground">{report.date} • {report.type}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{report.status}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => exportReportPDF(report)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Available formats & schedules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Daily Threat Brief', description: 'Summary of daily threat activity', schedule: 'Daily at 09:00' },
                    { name: 'Weekly Analysis', description: 'Comprehensive weekly threat analysis', schedule: 'Monday at 08:00' },
                    { name: 'IOC Export', description: 'Machine-readable IOC feed', schedule: 'Every 6 hours' },
                    { name: 'Incident Report', description: 'Detailed incident investigation', schedule: 'On-demand' },
                  ].map((template, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground">Schedule: {template.schedule}</p>
                      </div>
                      <Button size="sm">Configure</Button>
                    </div>
                  ))}
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
