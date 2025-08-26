# IoT Honeypot Dashboard

A comprehensive React-based frontend application for monitoring and analyzing IoT honeypot systems. This dashboard provides real-time threat intelligence, attack visualization, and security analytics for cybersecurity professionals.

## Features

### 🔐 Authentication System
- Role-based access control (Admin/User)
- Secure login with demo credentials
- Persistent session management
- Automatic role-based routing

### 👨‍💼 Admin Dashboard
- **Overview**: Real-time attack statistics, timeline charts, and recent sessions
- **Real-time Monitoring**: Live attack stream with pause/resume functionality
- **Geographic Analysis**: Attack source mapping and country-based statistics
- **Threat Analysis**: Behavioral patterns and payload analysis
- **AI Insights**: Automated threat detection and recommendations
- **System Management**: Honeypot status monitoring and configuration

### 👨‍🔬 User Dashboard (Security Analyst)
- **Threat Monitoring**: Real-time threat detection and activity timeline
- **Session Analysis**: Detailed attack session investigation
- **Threat Intelligence**: IOC management and attack pattern analysis
- **Reporting**: Automated report generation and export capabilities

## Technology Stack

- **Frontend**: React 18 with Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Animations**: Framer Motion

## Demo Credentials

### Admin Access
- Username: `admin`
- Password: `admin123`

### User Access
- Username: `user`
- Password: `user123`

### Additional User
- Username: `analyst`
- Password: `analyst123`

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iot-honeypot-dashboard
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
pnpm run build
```

The built files will be available in the `dist` directory.

## Project Structure

```
iot-honeypot-dashboard/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Login.jsx     # Authentication component
│   │   ├── AdminDashboard.jsx    # Admin interface
│   │   └── UserDashboard.jsx     # User interface
│   ├── assets/           # Images and static files
│   ├── lib/              # Utility functions
│   ├── App.jsx           # Main application component
│   ├── App.css           # Global styles
│   └── main.jsx          # Application entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Key Features Explained

### Real-time Monitoring
- Live attack stream visualization
- Automatic data updates every 3 seconds
- Pause/resume functionality for analysis
- Multiple chart types (line, area, pie, bar)

### Role-based Access Control
- **Admin**: Full system access including configuration and AI insights
- **User**: Focused on threat analysis and reporting
- Automatic redirection based on user role
- Secure session management with localStorage

### Data Visualization
- Interactive charts using Recharts library
- Geographic attack source mapping
- Threat type distribution analysis
- Timeline-based attack pattern visualization

### Modern UI/UX
- Responsive design for desktop and mobile
- Dark/light theme support via Tailwind CSS
- Smooth animations and transitions
- Professional cybersecurity aesthetic

## Mock Data

The application currently uses mock data to demonstrate functionality:
- Simulated attack patterns and statistics
- Geographic distribution of threats
- Command frequency analysis
- IOC (Indicators of Compromise) examples
- AI-generated insights and recommendations

## Integration Points

This frontend is designed to integrate with:
- Cowrie honeypot logs
- MongoDB for data storage
- WebSocket connections for real-time updates
- REST APIs for data retrieval
- AI/ML services for threat analysis

## Security Considerations

- Client-side authentication (demo purposes)
- Input validation and sanitization
- Secure routing with role verification
- Session timeout handling
- CORS-ready for backend integration

## Future Enhancements

- Backend API integration
- Real-time WebSocket connections
- Advanced filtering and search
- Export functionality for reports
- Multi-language support
- Advanced AI insights
- Custom dashboard configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Note**: This is a demonstration frontend for an IoT honeypot monitoring system. In a production environment, ensure proper backend integration, authentication, and security measures are implemented.

