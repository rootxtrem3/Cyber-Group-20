class ThreatViewDashboard {
  constructor() {
    this.token = null;
    this.socket = null;
    this.map = null;
    this.markers = {};
    this.markerCluster = null;
    this.stats = {
      totalEvents: 0,
      uniqueIPs: 0,
      todayEvents: 0,
      cowrieEvents: 0,
      dionaeaEvents: 0
    };
  }
  init(token) {
    this.token = token;
    this.initMap();
    this.initSocket();
    this.loadInitialData();
    this.startAutoRefresh();
  }
  initMap() {
    this.map = L.map('attackMap').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);
    this.markerCluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true
    });
    this.map.addLayer(this.markerCluster);
  }
  initSocket() {
    this.socket = io({
      auth: {
        token: this.token
      }
    });
    this.socket.on('connect', () => {
      console.log('Connected to real-time updates');
      this.updateLastUpdate();
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time updates');
    });
    this.socket.on('new_event', (event) => {
      this.addEventToMap(event);
      this.addEventToList(event);
      this.updateStats();
    });
  }
  async loadInitialData() {
    await Promise.all([
      this.loadEvents(),
      this.loadStats()
    ]);
  }
  async loadEvents() {
    try {
      const response = await fetch('/api/events?limit=50', {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        this.displayRecentEvents(data.events);
        data.events.forEach(event => this.addEventToMap(event));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }
  async loadStats() {
    try {
      const response = await fetch('/api/stats', {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        this.updateStatsDisplay(data);
        this.displayTopCountries(data.topCountries);
        this.displayEventTypes(data.eventTypes);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  addEventToMap(event) {
    if (!event.latitude || !event.longitude) return;
    const marker = L.marker([event.latitude, event.longitude])
      .bindPopup(`
            <strong>${event.attackerIP}</strong><br>
            ${event.city || 'Unknown'}, ${event.country || 'Unknown'}<br>
            Source: ${event.source}<br>
            Type: ${event.eventType}<br>
            Time: ${new Date(event.timestamp).toLocaleString()}
        `);
    this.markerCluster.addLayer(marker);
    const markerId = `${event.attackerIP}_${event.timestamp}`;
    this.markers[markerId] = marker;
  }
  addEventToList(event) {
    const eventsList = document.getElementById('recentEvents');
    const eventElement = this.createEventElement(event);
    eventsList.insertBefore(eventElement, eventsList.firstChild);
    while (eventsList.children.length > 20) {
      eventsList.removeChild(eventsList.lastChild);
    }
  }
  createEventElement(event) {
    const div = document.createElement('div');
    div.className = `event-item ${event.source}`;
    const time = new Date(event.timestamp).toLocaleTimeString();
    const details = event.details ? JSON.stringify(JSON.parse(event.details)).substring(0, 100) + '...' : 'No details';
    div.innerHTML = `
        <div class="event-header">
            <span class="event-ip">${event.attackerIP}</span>
            <span class="event-source ${event.source}">${event.source}</span>
        </div>
        <div class="event-details">
            <strong>${event.eventType}</strong> - ${event.country || 'Unknown'}<br>
            <small>${time} - ${details}</small>
        </div>
    `;
    return div;
  }
  displayRecentEvents(events) {
    const eventsList = document.getElementById('recentEvents');
    eventsList.innerHTML = '';
    events.forEach(event => {
      const eventElement = this.createEventElement(event);
      eventsList.appendChild(eventElement);
    });
  }
  displayTopCountries(countries) {
    const container = document.getElementById('topCountries');
    container.innerHTML = '';
    countries.slice(0, 8).forEach(country => {
      const div = document.createElement('div');
      div.className = 'event-item';
      div.innerHTML = `
            <div class="event-header">
                <span class="event-ip">${country.country || 'Unknown'}</span>
                <span>${country.count}</span>
            </div>
        `;
      container.appendChild(div);
    });
  }
  displayEventTypes(types) {
    const container = document.getElementById('eventTypes');
    container.innerHTML = '';
    types.slice(0, 8).forEach(type => {
      const div = document.createElement('div');
      div.className = 'event-item';
      div.innerHTML = `
            <div class="event-header">
                <span class="event-ip">${type._id}</span>
                <span>${type.count}</span>
            </div>
        `;
      container.appendChild(div);
    });
  }
  updateStatsDisplay(data) {
    document.getElementById('totalEvents').textContent = data.totalEvents.toLocaleString();
    document.getElementById('uniqueIPs').textContent = data.uniqueIPs.toLocaleString();
    document.getElementById('todayEvents').textContent = data.todayEvents.toLocaleString();
    this.stats = data;
  }
  updateStats() {
    this.stats.totalEvents++;
    this.stats.todayEvents++;
    document.getElementById('totalEvents').textContent = this.stats.totalEvents.toLocaleString();
    document.getElementById('todayEvents').textContent = this.stats.todayEvents.toLocaleString();
  }
  updateLastUpdate() {
    const now = new Date().toLocaleTimeString();
    document.getElementById('mapLastUpdate').textContent = now;
  }
  startAutoRefresh() {
    setInterval(() => {
      this.loadStats();
    }, 30000);
  }
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }
}
window.dashboard = new ThreatViewDashboard();
