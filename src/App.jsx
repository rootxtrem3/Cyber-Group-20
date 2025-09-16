import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

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
        <Route path="/login" element={user ? <Navigate to={user.role==='admin'?'/admin':'/dashboard'} /> : <Login onLogin={handleLogin} />} />
        <Route path="/admin" element={user?.role==='admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user?.role==='user' ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user? user.role==='admin'?'/admin':'/dashboard':'/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
