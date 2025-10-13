import React, { useState, useEffect } from 'react'
import Card from '../UI/Card'

const Captures = () => {
  const [captures, setCaptures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCaptures()
  }, [])

  const fetchCaptures = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/api/v1/captures', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCaptures(data)
    } catch (error) {
      console.error('Failed to fetch captures:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (captureId, filename) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:8000/api/v1/captures/${captureId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // Show security warning
      if (!window.confirm(
        `SECURITY WARNING: The file "${filename}" may be malicious. ` +
        `Do not execute it. Only download for analysis in a secure environment. ` +
        `Proceed with download?`
      )) {
        return
      }
      
      // In a real implementation, you would download the file
      alert(`Download would start for: ${filename}\nPath: ${data.file_path}`)
      
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed')
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="neon-accent">File Captures</h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading captures...
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="neon-accent" style={{ marginBottom: '2rem' }}>File Captures</h1>

      <Card>
        {captures.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source IP</th>
                <th>Filename</th>
                <th>Size</th>
                <th>SHA256</th>
                <th>Path</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {captures.map((capture) => (
                <tr key={capture.id}>
                  <td>{formatDate(capture.ts)}</td>
                  <td>{capture.src_ip}:{capture.src_port}</td>
                  <td>
                    <span style={{ color: '#ffaa00' }}>
                      {capture.filename}
                    </span>
                  </td>
                  <td>{formatFileSize(capture.size)}</td>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>
                      {capture.sha256?.substring(0, 16)}...
                    </code>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>
                      {capture.http_path}
                    </code>
                  </td>
                  <td>
                    <button 
                      className="btn"
                      onClick={() => handleDownload(capture.id, capture.filename)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Download
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {/* Delete capture */}}
                    >
                      Delete
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3>No File Captures Yet</h3>
            <p>Uploaded files will appear here when detected.</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Try uploading: <code>curl -X POST http://localhost:8080/upload -F "file=@/etc/hostname"</code>
            </p>
          </div>
        )}
      </Card>

      {/* Security Warning */}
      <Card style={{ marginTop: '2rem', background: 'rgba(255,0,0,0.1)', borderColor: 'rgba(255,0,0,0.3)' }}>
        <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>⚠️ Security Warning</h3>
        <p>
          All captured files are potentially malicious. Do not execute any downloaded files on production systems. 
          Always use isolated analysis environments with proper security controls.
        </p>
      </Card>
    </div>
  )
}

export default Captures