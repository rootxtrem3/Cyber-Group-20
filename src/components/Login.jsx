import { useState, useEffect } from 'react'
import { Sun, Moon, Shield, Eye, EyeOff, Lock, User } from 'lucide-react'

const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  return { theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}

const Login = ({ onLogin }) => {
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const mockUsers = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { username: 'user', password: 'user123', role: 'user', name: 'Security Analyst' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.username === formData.username && u.password === formData.password
      )
      if (user) onLogin({ username: user.username, role: user.role, name: user.name })
      else setError('Invalid username or password')
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 blur-3xl scale-150"></div>
        <div className="absolute inset-0 animate-gradient2 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 opacity-60 blur-2xl scale-125"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-8">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-800" />}
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mb-2 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            IoT Honeypot Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Secure access to the threat intelligence platform</p>
        </div>

        {/* Error */}
        {error && <div className="bg-red-200 text-red-800 p-2 rounded mb-4">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-10 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:scale-[1.03] transition transform shadow-lg"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Info */}
        <div className="text-center mt-4 text-gray-600 dark:text-gray-300 text-xs">
          Admin: admin / admin123<br />
          User: user / user123
        </div>
      </div>

      {/* Gradient Animation CSS */}
      <style>
        {`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .animate-gradient2 {
          background-size: 200% 200%;
          animation: gradient 20s ease-in-out infinite;
        }
        `}
      </style>
    </div>
  )
}

export default Login
