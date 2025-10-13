import React, { useState, useEffect } from 'react'
import Card from '../UI/Card'

const Settings = () => {
  const [settings, setSettings] = useState({
    geoip_enabled: false,
    email_alerts_enabled: false,
    smtp_configured: false,
    bind_addr: '127.0.0.1',
    ports: {}
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/api/v1/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/api/v1/settings/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json()
      setTestEmailResult(result)
      
      // Clear result after 5 seconds
      setTimeout(() => setTestEmailResult(null), 5000)
    } catch (error) {
      console.error('Failed to send test email:', error)
      setTestEmailResult({ success: false, message: 'Failed to send test email' })
    }
  }

  const handleServiceControl = async (service, action) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:8000/api/v1/control/${service}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json()
      alert(`${service} ${action}: ${result.message}`)
    } catch (error) {
      console.error('Service control failed:', error)
      alert('Service control action failed')
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="neon-accent">Settings</h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading settings...
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="neon-accent" style={{ marginBottom: '2rem' }}>Settings</h1>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Service Control */}
        <Card>
          <h3 className="neon-cyan" style={{ marginBottom: '1rem' }}>Service Control</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn"
              onClick={() => handleServiceControl('ssh', 'restart')}
            >
              Restart SSH Honeypot
            </button>
            <button 
              className="btn"
              onClick={() => handleServiceControl('http', 'restart')}
            >
              Restart HTTP Honeypot
            </button>
            <button 
              className="btn"
              onClick={() => handleServiceControl('backend', 'restart')}
            >
              Restart Backend
            </button>
          </div>
        </Card>

        {/* GeoIP Settings */}
        <Card>
          <h3 className="neon-cyan" style={{ marginBottom: '1rem' }}>GeoIP Configuration</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="geoip-enabled"
              checked={settings.geoip_enabled}
              readOnly
            />
            <label htmlFor="geoip-enabled">Enable GeoIP Lookups</label>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            {settings.geoip_enabled ? 
              'GeoIP is enabled. Attack sources will be shown on the map.' :
              'GeoIP is disabled. Enable and provide GeoLite2 database for map functionality.'
            }
          </p>
        </Card>

        {/* Email Alerts */}
        <Card>
          <h3 className="neon-cyan" style={{ marginBottom: '1rem' }}>Email Alerts</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="email-alerts-enabled"
              checked={settings.email_alerts_enabled}
              readOnly
            />
            <label htmlFor="email-alerts-enabled">Enable Email Alerts</label>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: settings.smtp_configured ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
            border: `1px solid ${settings.smtp_configured ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)'}`,
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <strong>SMTP Status:</strong> {settings.smtp_configured ? 'Configured' : 'Not Configured'}
          </div>

          {settings.smtp_configured && (
            <div>
              <button 
                className="btn"
                onClick={handleTestEmail}
                disabled={saving}
              >
                Send Test Email
              </button>
              
              {testEmailResult && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem',
                  background: testEmailResult.success ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                  border: `1px solid ${testEmailResult.success ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)'}`,
                  borderRadius: '4px'
                }}>
                  {testEmailResult.message}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Network Configuration */}
        <Card>
          <h3 className="neon-cyan" style={{ marginBottom: '1rem' }}>Network Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00aaff' }}>
                Bind Address
              </label>
              <input
                type="text"
                value={settings.bind_addr}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00aaff' }}>
                SSH Port
              </label>
              <input
                type="number"
                value={settings.ports.ssh || 2222}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00aaff' }}>
                HTTP Port
              </label>
              <input
                type="number"
                value={settings.ports.http || 8080}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
            </div>
          </div>
        </Card>

        {/* Security Warning */}
        <Card style={{ background: 'rgba(255,0,0,0.1)', borderColor: 'rgba(255,0,0,0.3)' }}>
          <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>⚠️ Security Configuration Notice</h3>
          <p style={{ marginBottom: '1rem' }}>
            Most settings are configured via environment variables and require container restart to take effect.
            For production deployment:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Change default credentials in the backend configuration</li>
            <li>Use isolated network segments</li>
            <li>Regularly update GeoIP databases</li>
            <li>Monitor and rotate access tokens</li>
            <li>Never expose honeypot services to the public internet</li>
          </ul>
          <p>
            Edit the <code>.env</code> file and restart containers to apply configuration changes.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Settings