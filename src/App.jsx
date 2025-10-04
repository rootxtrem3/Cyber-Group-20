import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        {/* Default route: show login if no user */}
        <Route
          path="/"
          element={user ? <Navigate to="/admin" /> : <Navigate to="/login" />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />}
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            user?.role === 'admin'
              ? <AdminDashboard user={user} onLogout={handleLogout} />
              : <Navigate to="/login" />
          }
        />

        {/* Catch-all Route */}
        <Route
          path="*"
          element={<Navigate to={user ? '/admin' : '/login'} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
