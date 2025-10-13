import React, { useState, useEffect } from 'react'
import Card from '../UI/Card'
import LiveLogs from '../UI/LiveLogs'

const Overview = () => {
  const [stats, setStats] = useState({
    total_connections: 0,
    ssh_connections: 0,
    telnet_connections: 0,
    total_captures: 0,
    total_file_size: 0,
    unique_ips: 0,
    recent_connections_24h: 0,
    recent_captures_24h: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial stats
    fetchStats()
    
    // Set up periodic refresh
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/api/v1/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getActivityLevel = () => {
    const totalRecent = stats.recent_connections_24h + stats.recent_captures_24h
    if (totalRecent === 0) return 'quiet'
    if (totalRecent < 5) return 'low'
    if (totalRecent < 20) return 'medium'
    return 'high'
  }

  const getActivityColor = (level) => {
    switch (level) {
      case 'quiet': return '#00aaff'
      case 'low': return '#00ff88'
      case 'medium': return '#ffaa00'
      case 'high': return '#ff4444'
      default: return '#00aaff'
    }
  }

  const activityLevel = getActivityLevel()

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }} className="neon-accent">Overview</h1>
      
      {/* Activity Status Card */}
      <Card style={{ marginBottom: '2rem', borderLeft: `4px solid ${getActivityColor(activityLevel)}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="neon-cyan">Honeypot Status</h3>
            <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
              {activityLevel === 'quiet' ? 'Waiting for activity...' :
               activityLevel === 'low' ? 'Low activity detected' :
               activityLevel === 'medium' ? 'Moderate activity' : 'High activity!'}
            </p>
          </div>
          <div style={{ 
            background: getActivityColor(activityLevel),
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.8rem'
          }}>
            {activityLevel} activity
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid-container">
        <Card>
          <h3 className="neon-cyan">Total Connections</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
            {stats.total_connections}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span>SSH: {stats.ssh_connections}</span>
            <span>Telnet: {stats.telnet_connections}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            Last 24h: {stats.recent_connections_24h}
          </div>
        </Card>

        <Card>
          <h3 className="neon-cyan">File Captures</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
            {stats.total_captures}
          </p>
          <div style={{ fontSize: '0.875rem' }}>
            Total Size: {formatFileSize(stats.total_file_size)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            Last 24h: {stats.recent_captures_24h}
          </div>
        </Card>

        <Card>
          <h3 className="neon-cyan">Unique IPs</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
            {stats.unique_ips}
          </p>
          <div style={{ fontSize: '0.875rem' }}>
            Attack Sources
          </div>
        </Card>

        <Card>
          <h3 className="neon-cyan">System Status</h3>
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>SSH Honeypot:</span>
              <span style={{ color: '#00ff88' }}>Running</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>HTTP Honeypot:</span>
              <span style={{ color: '#00ff88' }}>Running</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Backend API:</span>
              <span style={{ color: '#00ff88' }}>Running</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database:</span>
              <span style={{ color: '#00ff88' }}>Ready</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Logs */}
      <Card style={{ marginTop: '2rem' }}>
        <h3 className="neon-cyan" style={{ marginBottom: '1rem' }}>Live Activity</h3>
        <LiveLogs />
      </Card>

      {/* Empty State Guidance */}
      {stats.total_connections === 0 && stats.total_captures === 0 && (
        <Card style={{ marginTop: '2rem', background: 'rgba(0, 170, 255, 0.1)', borderColor: 'rgba(0, 170, 255, 0.3)' }}>
          <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>Getting Started</h3>
          <p>Your honeypot is running and ready to capture activity. To test the system:</p>
          <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
            <li>Connect via SSH: <code>ssh -p 2222 user@localhost</code></li>
            <li>Send HTTP requests: <code>curl http://localhost:8080/</code></li>
            <li>Upload files: <code>curl -X POST http://localhost:8080/upload -F "file=@/path/to/file"</code></li>
          </ul>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            All captured activity will appear here in real-time.
          </p>
        </Card>
      )}
    </div>
  )
}

export default Overview