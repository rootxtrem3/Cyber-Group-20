class AuthManager {
  constructor() {
    this.token = localStorage.getItem('threatview_token');
    this.user = localStorage.getItem('threatview_user');
    this.init();
  }
  init() {
    if (this.token && this.user) {
      this.validateToken();
    } else {
      this.showLogin();
    }
  }
  async validateToken() {
    try {
      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      if (response.ok) {
        this.showDashboard();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      this.logout();
    }
  }
  async login(username, password) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        this.user = data.username;
        localStorage.setItem('threatview_token', this.token);
        localStorage.setItem('threatview_user', this.user);
        this.showDashboard();
        return true;
      } else {
        const error = await response.json();
        this.showError(error.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Network error - please try again');
      return false;
    }
  }
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('threatview_token');
    localStorage.removeItem('threatview_user');
    this.showLogin();
  }
  showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
  }
  showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('userName').textContent = this.user;
    if (window.dashboard) {
      window.dashboard.init(this.token);
    }
  }
  showError(message) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 5000);
  }
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }
}
const auth = new AuthManager();
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  await auth.login(username, password);
});
window.logout = () => auth.logout();
