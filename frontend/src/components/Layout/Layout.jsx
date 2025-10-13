import React from 'react'
import NavBar from './NavBar'

const Layout = ({ children, onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f14' }}>
      <NavBar onLogout={onLogout} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout