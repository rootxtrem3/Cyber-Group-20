import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  Sun,
  Moon,
  LogIn,
  ShieldCheck,
  Zap,
  AlertTriangle,
} from 'lucide-react';

// Theme Hook
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') || 'dark';
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--bg-start', '#0f0f0f');
      root.style.setProperty('--bg-mid', '#1a1a1a');
      root.style.setProperty('--card-bg', 'rgba(20, 20, 20, 0.7)');
      root.style.setProperty('--text-color', '#fff');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-start', '#f0f0f0');
      root.style.setProperty('--bg-mid', '#e0e0e0');
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--text-color', '#000');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
};

// Security Status
const SecurityStatus = () => {
  const [status, setStatus] = useState('secure');
  useEffect(() => {
    const statuses = ['secure', 'scanning', 'protected'];
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % statuses.length;
      setStatus(statuses[current]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'secure': return 'text-green-400';
      case 'scanning': return 'text-yellow-400';
      case 'protected': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'secure': return <ShieldCheck className="w-4 h-4" />;
      case 'scanning': return <Zap className="w-4 h-4" />;
      case 'protected': return <Shield className="w-4 h-4" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 text-sm">
      {getStatusIcon()}
      <span className={`font-medium ${getStatusColor()}`}>System {status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

// Main Login
const Login = ({ onLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  const adminUser = { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' };

  useEffect(() => {
    if (loginAttempts >= 3) {
      setIsLocked(true);
      setLockTime(30);
      const timer = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loginAttempts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      setError(`Account temporarily locked. Try again in ${lockTime}s.`);
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    if (formData.username === adminUser.username && formData.password === adminUser.password) {
      onLogin(adminUser);
      setLoginAttempts(0);
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      setError(attempts >= 3
        ? 'Too many failed attempts. Account locked for 30s.'
        : `Invalid username or password. ${3 - attempts} attempts left.`);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-6 transition-colors duration-500"
      style={{
        background: `linear-gradient(to bottom right, var(--bg-start), var(--bg-mid))`,
        color: 'var(--text-color)',
      }}
    >
      <Card className="w-full max-w-xs sm:max-w-sm bg-[var(--card-bg)] border border-purple-500/50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 relative overflow-hidden animate-slide-in">
        <CardHeader className="text-center space-y-2 pt-4 pb-2">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg border-2 border-white/20 animate-pulse">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">IoT Honeypot</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Secure Admin Portal</CardDescription>
          <SecurityStatus />
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
          {error && (
            <Alert variant="destructive" className="text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="username" className="text-xs sm:text-sm">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                disabled={loading || isLocked}
                required
                className="bg-black/30 text-white placeholder-gray-400 border border-gray-700 h-10 sm:h-12"
              />
            </div>

            <div className="relative">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                disabled={loading || isLocked}
                required
                className="bg-black/30 text-white placeholder-gray-400 border border-gray-700 h-10 sm:h-12 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 transition-all flex items-center justify-center gap-1"
              disabled={loading || isLocked}
            >
              {loading ? 'Logging in...' : 'Log In'} <LogIn className="w-4 h-4" />
            </Button>
          </form>

          <Button
            variant="outline"
            onClick={toggleTheme}
            className="w-full h-10 sm:h-12 mt-2 flex items-center justify-center gap-2 text-white border-purple-500 hover:border-white text-xs sm:text-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Toggle Theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
