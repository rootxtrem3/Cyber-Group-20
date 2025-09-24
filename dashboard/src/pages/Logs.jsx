import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
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
  Tab,
  Tabs,
} from '@mui/material';
import { Refresh as RefreshIcon, Visibility } from '@mui/icons-material';
const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedService, setSelectedService] = useState('cowrie');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const services = [
    { value: 'cowrie', label: 'Cowrie SSH Honeypot' },
    { value: 'glastopf', label: 'Glastopf Web Honeypot' },
    { value: 'dionaea', label: 'Dionaea Malware Honeypot' },
  ];
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/logs/${selectedService}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLogs();
  }, [selectedService]);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Security Logs
        </Typography>
        <IconButton onClick={fetchLogs} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
      <Card>
        <CardContent>
          <Box display="flex" gap={2} sx={{ mb: 3 }}>
            <TextField
              select
              label="Select Service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {services.map((service) => (
                <MenuItem key={service.value} value={service.value}>
                  {service.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Log Files" />
            <Tab label="Real-time Events" />
          </Tabs>
          {tabValue === 0 && (
            <>
              {loading ? (
                <LinearProgress />
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Log File</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Last Modified</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {log.file}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.size ? `${(log.size / 1024).toFixed(1)} KB` : 'N/A'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {log.modified ? new Date(log.modified).toLocaleString() : 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {logs.length === 0 && !loading && (
                <Alert severity="info">
                  No log files found for {selectedService}. Logs will appear here as attacks are detected.
                </Alert>
              )}
            </>
          )}
          {tabValue === 1 && (
            <Alert severity="info">
              Real-time events monitoring will be available once the log enricher service processes security events.
              Check the Dashboard for real-time attack statistics.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
export default Logs;
