import React, { useState, useEffect } from 'react'
import Card from '../UI/Card'

const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchSessions()
  }, [filter])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/api/v1/connections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      let filteredData = data
      if (filter !== 'all') {
        filteredData = data.filter(session => session.honeypot_type === filter)
      }
      
      setSessions(filteredData)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'ssh': return '#00ff88'
      case 'telnet': return '#ffaa00'
      default: return '#00aaff'
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="neon-accent">Sessions</h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading sessions...
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="neon-accent">Sessions</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label className="neon-cyan">Filter:</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
          >
            <option value="all">All Sessions</option>
            <option value="ssh">SSH Only</option>
            <option value="telnet">Telnet Only</option>
          </select>
        </div>
      </div>

      <Card>
        {sessions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Source IP</th>
                <th>Username</th>
                <th>Password</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{formatDate(session.ts)}</td>
                  <td>
                    <span style={{ color: getSessionTypeColor(session.honeypot_type) }}>
                      {session.honeypot_type?.toUpperCase()}
                    </span>
                  </td>
                  <td>{session.src_ip}:{session.src_port}</td>
                  <td>{session.user || 'N/A'}</td>
                  <td>
                    {session.password ? (
                      <span style={{ color: '#ff4444' }}>••••••••</span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {session.meta?.duration ? 
                      `${Math.round(session.meta.duration)}s` : 'N/A'
                    }
                  </td>
                  <td>
                    <button 
                      className="btn"
                      onClick={() => {/* View details */}}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3>No Sessions Yet</h3>
            <p>SSH and Telnet connections will appear here when detected.</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Try connecting: <code>ssh -p 2222 user@localhost</code>
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Sessions