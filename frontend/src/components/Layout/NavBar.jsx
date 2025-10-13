import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NavBar = ({ onLogout }) => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 className="neon-accent">Honeypot Dashboard</h1>
          <ul className="nav-links">
            <li><Link to="/overview" className={isActive('/overview') ? 'active' : ''}>Overview</Link></li>
            <li><Link to="/sessions" className={isActive('/sessions') ? 'active' : ''}>Sessions</Link></li>
            <li><Link to="/captures" className={isActive('/captures') ? 'active' : ''}>Captures</Link></li>
            <li><Link to="/map" className={isActive('/map') ? 'active' : ''}>Map</Link></li>
            <li><Link to="/settings" className={isActive('/settings') ? 'active' : ''}>Settings</Link></li>
          </ul>
        </div>
        <button className="btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default NavBar