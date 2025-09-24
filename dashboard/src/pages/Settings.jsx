import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Settings
      </Typography>
      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Settings section is under development. Configuration options coming soon.
          </Alert>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Current system configuration:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Dashboard Port" secondary="3000" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Honeypot Network" secondary="192.168.1.0/24" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Safety Mode" secondary="Strict" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Log Retention" secondary="30 days" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
export default Settings;
