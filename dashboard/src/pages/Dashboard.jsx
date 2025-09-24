import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Paper,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Block as BlockIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color + '20',
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, { sx: { color, fontSize: 32 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    fetchStats();
    fetchRecentEvents();
    const statsInterval = setInterval(fetchStats, 10000);
    const eventsInterval = setInterval(fetchRecentEvents, 15000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(eventsInterval);
    };
  }, []);
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
      if (data.serviceAttacks) {
        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          cowrie: data.serviceAttacks.cowrie,
          glastopf: data.serviceAttacks.glastopf,
          dionaea: data.serviceAttacks.dionaea,
          total: data.totalAttacks
        };
        setChartData(prev => {
          const updated = [...prev, newDataPoint].slice(-20);
          return updated;
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };
  const fetchRecentEvents = async () => {
    try {
      const response = await fetch('/api/events/recent');
      const data = await response.json();
      setRecentEvents(data.slice(-10).reverse());
    } catch (error) {
      console.error('Error fetching recent events:', error);
    }
  };
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }
  const serviceData = stats?.services || [];
  const threatLevelColor = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  }[stats?.threatLevel || 'low'];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Security Dashboard
      </Typography>
      <Alert
        severity={threatLevelColor}
        sx={{ mb: 3 }}
        icon={<WarningIcon />}
      >
        Threat Level: <strong>{stats?.threatLevel?.toUpperCase() || 'LOW'}</strong> |
        Uptime: {stats?.uptime || '0d 0h 0m'} |
        Last Updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never'}
      </Alert>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Attacks"
            value={stats?.totalAttacks || 0}
            icon={<SecurityIcon />}
            color="#ef4444"
            subtitle="All attacks detected"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Attackers"
            value={stats?.uniqueAttackers || 0}
            icon={<PeopleIcon />}
            color="#3b82f6"
            subtitle="Distinct IP addresses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Services"
            value={serviceData.length}
            icon={<StorageIcon />}
            color="#8b5cf6"
            subtitle="Honeypots running"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Uptime"
            value={stats?.uptime?.split(' ')[0] || '0d'}
            icon={<ScheduleIcon />}
            color="#10b981"
            subtitle={stats?.uptime?.split(' ').slice(1).join(' ') || '0h 0m'}
          />
        </Grid>
      </Grid>
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Attack Activity Timeline</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cowrie"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Cowrie"
                  />
                  <Line
                    type="monotone"
                    dataKey="glastopf"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Glastopf"
                  />
                  <Line
                    type="monotone"
                    dataKey="dionaea"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Dionaea"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Attack Distribution</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="attacks"
                    label={({ name, attacks }) => `${name}: ${attacks}`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                {serviceData.map((service, index) => (
                  <Box key={service.name} sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="medium">
                        {service.name}
                      </Typography>
                      <Chip
                        label={service.status}
                        color={service.status === 'running' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      color={service.status === 'running' ? 'success' : 'error'}
                      sx={{ mt: 1, height: 4 }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      {service.attacks} attacks detected
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Security Events
              </Typography>
              <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <Paper key={index} sx={{ p: 1.5, mb: 1, backgroundColor: 'background.default' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {event.service}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {event.type}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" display="block">
                            {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Unknown'}
                          </Typography>
                          <Typography variant="caption" fontFamily="monospace">
                            {event.sourceIp}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                    No security events detected yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;
