import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon, PlayArrow, Stop, Warning } from '@mui/icons-material';
const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const honeypotPorts = {
    cowrie: ['2222 (SSH)', '2223 (Telnet)'],
    glastopf: ['80 (HTTP)'],
    dionaea: ['21 (FTP)', '42 (W32/Conficker)', '135 (MSRPC)', '443 (HTTPS)', '445 (SMB)', '1433 (MSSQL)', '1723 (PPTP)', '3306 (MySQL)', '5060 (SIP)', '5061 (SIPS)']
  };
  const fetchServices = async () => {
    try {
      setError(null);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 10000);
    return () => clearInterval(interval);
  }, []);
  const getStatusColor = (status) => {
    if (status.includes('Up')) return 'success';
    if (status.includes('Exit') || status.includes('Dead')) return 'error';
    return 'warning';
  };
  const getExpectedPorts = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('cowrie')) return honeypotPorts.cowrie;
    if (name.includes('glastopf')) return honeypotPorts.glastopf;
    if (name.includes('dionaea')) return honeypotPorts.dionaea;
    return ['Various'];
  };
  if (loading) {
    return <LinearProgress />;
  }
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Honeypot Services
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Monitor and manage honeypot services
          </Typography>
        </Box>
        <IconButton onClick={fetchServices} color="primary" size="large">
          <RefreshIcon />
        </IconButton>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Exposed Ports</TableCell>
                  <TableCell>Expected Ports</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.name} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Warning sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body1" fontWeight="medium">
                          {service.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        color={getStatusColor(service.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {service.ports}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {getExpectedPorts(service.name).map((port, idx) => (
                          <Chip key={idx} label={port} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" disabled>
                        <PlayArrow />
                      </IconButton>
                      <IconButton size="small" color="error" disabled>
                        <Stop />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {services.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No services found. Make sure Docker is running and honeypots are started.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Honeypot Ports Exposed:</strong> These services are actively listening for attacks on the specified ports.
          Ensure your firewall allows traffic to these ports for the honeypots to function properly.
        </Typography>
      </Alert>
    </Box>
  );
};
export default Services;
