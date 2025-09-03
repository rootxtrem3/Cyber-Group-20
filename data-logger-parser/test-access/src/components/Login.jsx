import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Lock, User, Sun, Moon } from 'lucide-react'

// Theme Toggle Hook
const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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

  // Mock users
  const mockUsers = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { username: 'user', password: 'user123', role: 'user', name: 'Security Analyst' },
    { username: 'analyst', password: 'analyst123', role: 'user', name: 'Threat Analyst' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find(
      (u) => u.username === formData.username && u.password === formData.password
    )

    if (user) {
      onLogin({ username: user.username, role: user.role, name: user.name })
    } else {
      setError('Invalid username or password')
    }

    setLoading(false)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-100 to-slate-200 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 transition-colors duration-500 p-6">
      <Card className="w-full max-w-md bg-white/70 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-xl shadow-2xl rounded-2xl transition-colors duration-500">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </Button>
        </div>

        {/* Header */}
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              IoT Honeypot Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Secure access to the threat intelligence platform
            </CardDescription>
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10 h-12 rounded-xl focus:ring-2 focus:ring-purple-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 rounded-xl focus:ring-2 focus:ring-purple-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="text-center space-y-2 pt-4">
            <div className="text-xs text-muted-foreground font-medium">
              Demo Credentials:
            </div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>Admin → <span className="font-semibold">admin / admin123</span></div>
              <div>User → <span className="font-semibold">user / user123</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
