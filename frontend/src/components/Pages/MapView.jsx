import React, { useState, useEffect } from 'react'
import Card from '../UI/Card'

// Import Leaflet CSS (this will be handled by Vite)
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet and React-Leaflet to avoid SSR issues
let MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup, CircleMarker, Tooltip;
let L;

const MapView = () => {
  const [connections, setConnections] = useState([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [MapComponent, setMapComponent] = useState(null)

  // Dynamically load Leaflet components
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Import Leaflet
        const leaflet = await import('leaflet')
        L = leaflet.default
        
        // Fix for default markers in React
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Import React-Leaflet components
        const ReactLeaflet = await import('react-leaflet')
        MapContainer = ReactLeaflet.MapContainer
        TileLayer = ReactLeaflet.TileLayer
        Marker = ReactLeaflet.Marker
        Popup = ReactLeaflet.Popup
        useMap = ReactLeaflet.useMap
        LayersControl = ReactLeaflet.LayersControl
        LayerGroup = ReactLeaflet.LayerGroup
        CircleMarker = ReactLeaflet.CircleMarker
        Tooltip = ReactLeaflet.Tooltip

        setMapLoaded(true)
        
        // Create map component
        const RealMap = () => {
          const map = useMap()
          
          // Fit bounds to show all markers
          useEffect(() => {
            if (connections.length > 0) {
              const group = new L.featureGroup(
                connections
                  .filter(conn => conn.geoip && conn.geoip.latitude && conn.geoip.longitude)
                  .map(conn => L.marker([conn.geoip.latitude, conn.geoip.longitude]))
              )
              if (group.getBounds().isValid()) {
                map.fitBounds(group.getBounds(), { padding: [20, 20] })
              }
            }
          }, [connections, map])

          return null
        }

        setMapComponent(() => RealMap)
      } catch (error) {
        console.error('Failed to load Leaflet:', error)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    fetchConnectionsForMap()
  }, [])

  const fetchConnectionsForMap = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/api/v1/connections?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // Filter connections with valid GeoIP data
      const connectionsWithGeo = data.filter(conn => 
        conn.geoip && 
        conn.geoip.latitude && 
        conn.geoip.longitude &&
        Math.abs(conn.geoip.latitude) <= 90 &&
        Math.abs(conn.geoip.longitude) <= 180
      )
      setConnections(connectionsWithGeo)
    } catch (error) {
      console.error('Failed to fetch connections for map:', error)
    }
  }

  // Create custom attack marker icon
  const createAttackIcon = (type) => {
    if (!L) return L?.Icon.Default.prototype
    
    const color = type === 'ssh' ? '#00ff88' : '#ffaa00'
    
    return L.divIcon({
      className: 'custom-attack-marker',
      html: `
        <div style="
          background: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }

  const getAttackColor = (type) => {
    switch (type) {
      case 'ssh': return '#00ff88'
      case 'telnet': return '#ffaa00'
      default: return '#00aaff'
    }
  }

  const getAttackIcon = (type) => {
    switch (type) {
      case 'ssh': return '🔐'
      case 'telnet': return '💻'
      default: return '🌐'
    }
  }

  // Fallback to mock map if Leaflet fails to load
  if (!mapLoaded) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="neon-accent">Attack Map</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="neon-cyan">
              Loading map...
            </span>
            <button className="btn" onClick={fetchConnectionsForMap}>
              Refresh
            </button>
          </div>
        </div>

        <Card>
          <div style={{ 
            height: '500px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3>Loading Real Map</h3>
            <p style={{ textAlign: 'center', maxWidth: '400px', marginTop: '1rem' }}>
              Initializing Leaflet map...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="neon-accent">Attack Map</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="neon-cyan">
            {connections.length} geolocated attacks
          </span>
          <button className="btn" onClick={fetchConnectionsForMap}>
            Refresh
          </button>
        </div>
      </div>

      <Card>
        <div className="map-container">
          {MapContainer && (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '500px', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Dark theme tile layer option */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Render attack markers */}
              {connections.map((connection) => {
                if (!connection.geoip) return null
                
                const { latitude, longitude, country, city } = connection.geoip
                const attackColor = getAttackColor(connection.honeypot_type)
                const attackIcon = getAttackIcon(connection.honeypot_type)
                
                return (
                  <CircleMarker
                    key={connection.id}
                    center={[latitude, longitude]}
                    radius={8}
                    fillColor={attackColor}
                    color={attackColor}
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <div style={{ color: 'black', minWidth: '200px' }}>
                        <h4 style={{ 
                          color: attackColor, 
                          marginBottom: '8px',
                          borderBottom: `2px solid ${attackColor}`,
                          paddingBottom: '4px'
                        }}>
                          {attackIcon} {connection.honeypot_type?.toUpperCase()} Attack
                        </h4>
                        <div style={{ fontSize: '0.9rem' }}>
                          <div><strong>IP:</strong> {connection.src_ip}</div>
                          <div><strong>Location:</strong> {country}{city ? `, ${city}` : ''}</div>
                          <div><strong>User:</strong> {connection.user || 'N/A'}</div>
                          {connection.password && (
                            <div><strong>Password:</strong> <span style={{color: '#ff4444'}}>••••••••</span></div>
                          )}
                          <div><strong>Time:</strong> {new Date(connection.ts).toLocaleString()}</div>
                          {connection.meta?.duration && (
                            <div><strong>Duration:</strong> {Math.round(connection.meta.duration)}s</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong>{connection.src_ip}</strong><br/>
                        {connection.honeypot_type} - {connection.user || 'Unknown'}
                      </div>
                    </Tooltip>
                  </CircleMarker>
                )
              })}

              {/* Map controller component */}
              {MapComponent && <MapComponent />}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#00ff88',
              borderRadius: '50%',
              border: '2px solid white'
            }}></div>
            <span>SSH Attacks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#ffaa00',
              borderRadius: '50%',
              border: '2px solid white'
            }}></div>
            <span>Telnet Attacks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#00aaff',
              borderRadius: '50%',
              border: '2px solid white'
            }}></div>
            <span>Other Attacks</span>
          </div>
        </div>
      </Card>

      {/* Connection List */}
      {connections.length > 0 && (
        <Card style={{ marginTop: '2rem' }}>
          <h3 className="neon-cyan" style={{ marginBottom: '1rem' }}>Recent Geolocated Connections</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {connections.slice(0, 10).map((conn) => (
                  <tr key={conn.id}>
                    <td>
                      <span style={{ color: getAttackColor(conn.honeypot_type) }}>
                        {conn.honeypot_type?.toUpperCase()}
                      </span>
                    </td>
                    <td>{conn.src_ip}</td>
                    <td>
                      {conn.geoip?.country}
                      {conn.geoip?.city && `, ${conn.geoip.city}`}
                    </td>
                    <td>{conn.user || 'N/A'}</td>
                    <td>{new Date(conn.ts).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {connections.length === 0 && (
        <Card style={{ marginTop: '2rem', background: 'rgba(0, 170, 255, 0.1)', borderColor: 'rgba(0, 170, 255, 0.3)' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: 'rgba(255,255,255,0.7)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <h3>No Geolocated Attacks Yet</h3>
            <p>Attack locations will appear on the map when GeoIP data is available.</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Enable GeoIP in settings and interact with the honeypots to see attack sources.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default MapView