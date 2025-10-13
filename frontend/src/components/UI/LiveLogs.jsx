import React, { useState, useEffect } from 'react'
import useWebSocket from '../WebSocket/useWebSocket'

const LiveLogs = () => {
  const [logs, setLogs] = useState([])
  const { lastMessage, isConnected, reconnectCount } = useWebSocket('ws://localhost:8000/ws/logs')

  useEffect(() => {
    if (lastMessage) {
      console.log('New WebSocket message:', lastMessage)
      setLogs(prev => [lastMessage, ...prev.slice(0, 99)]) // Keep last 100 logs
    }
  }, [lastMessage])

  const getLogTypeClass = (type) => {
    switch (type) {
      case 'ssh':
      case 'connection': 
        return 'log-type-ssh'
      case 'http':
      case 'capture':
        return 'log-type-http'
      case 'system':
        return 'log-type-system'
      default:
        return ''
    }
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'ssh':
      case 'connection':
        return '🔐'
      case 'http':
      case 'capture':
        return '🌐'
      case 'system':
        return 'ℹ️'
      default:
        return '📄'
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getLogMessage = (log) => {
    const data = log.data || {}
    
    switch (log.type) {
      case 'connection':
        return `SSH connection from ${data.src_ip} - user: ${data.user || 'unknown'}`
      case 'capture':
        return `HTTP capture from ${data.src_ip} - file: ${data.filename || 'unknown'} (${data.size} bytes)`
      case 'system':
        return data.message || 'System message'
      default:
        return JSON.stringify(data)
    }
  }

  return (
    <div className="live-logs">
      <div style={{ 
        padding: '0.5rem', 
        background: isConnected ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          WebSocket: <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong>
          {reconnectCount > 0 && ` (Reconnect attempts: ${reconnectCount})`}
        </div>
        <div>Logs: {logs.length}</div>
      </div>
      
      {logs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255,255,255,0.5)', 
          padding: '2rem',
          fontStyle: 'italic'
        }}>
          {isConnected ? 'Waiting for activity...' : 'Connecting to server...'}
        </div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
            <span style={{ marginRight: '0.5rem' }}>{getLogIcon(log.type)}</span>
            <span className={getLogTypeClass(log.type)}>
              {log.type?.toUpperCase()}
            </span>
            <span style={{ marginLeft: '1rem', flex: 1 }}>
              {getLogMessage(log)}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

export default LiveLogs