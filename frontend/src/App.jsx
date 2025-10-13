import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './components/Pages/Login'
import Overview from './components/Pages/Overview'
import Sessions from './components/Pages/Sessions'
import Captures from './components/Pages/Captures'
import Settings from './components/Pages/Settings'
import MapView from './components/Pages/MapView'

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  // Simple auth check - in production, use proper authentication
  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/captures" element={<Captures />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App