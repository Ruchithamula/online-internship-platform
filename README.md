# Online Internship Platform

A comprehensive web-based internship assessment platform with advanced admin and student portals, featuring real-time analytics, anti-cheating mechanisms, and detailed performance tracking.

## 🚀 Features

### Admin Dashboard
- **Real-time Candidate Management** - Live updates of student registrations and test completions
- **Test Performance Analytics** - Comprehensive statistics and performance metrics
- **Global & Individual Test Controls** - Enable/disable test access for all students or specific individuals
- **Data Export Functionality** - Export candidate data in CSV and JSON formats
- **Question Management System** - Add and edit test questions
- **Performance Insights** - Average scores, pass rates, and detailed analytics

### Student Portal
- **Account Creation & Authentication** - Secure registration and login system
- **Progress Tracking** - Visual status indicators (Profile → Terms → Payment → Test)
- **Interactive Test Interface** - Modern UI with question navigation and real-time feedback
- **Anti-Cheating Mechanisms** - Tab switching detection, keyboard shortcut blocking, inactivity monitoring
- **Comprehensive Results Analysis** - Detailed performance breakdown with insights
- **Test History** - Complete attempt history with performance trends

### Test System
- **35 Software Engineering Questions** - Carefully curated questions across difficulty levels
- **30-Minute Timed Assessment** - Strict time management with auto-submission
- **Anti-Cheating Features** - 3-strike warning system with auto-submission
- **Real-time Performance Tracking** - Live score calculation and progress monitoring
- **Detailed Analytics** - Time efficiency, attempt rates, success rates, and personalized insights

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework with hooks and context API
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing and navigation
- **React Hot Toast** - User-friendly notifications
- **React Icons** - Comprehensive icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database for data persistence
- **JWT** - JSON Web Tokens for authentication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - API protection against abuse

### Database
- **SQLite3** - File-based database with SQL queries
- **User Management** - Registration, authentication, and profile data
- **Test Results** - Comprehensive test performance storage
- **Question Bank** - Software engineering question database

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ruchithamula/online-internship-platform1.git
   cd online-internship-platform1
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

5. **Start the frontend application**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

## 🎯 Usage Guide

### For Administrators

1. **Access Admin Dashboard**
   - Navigate to `/admin/login`
   - Use admin credentials to log in

2. **Manage Candidates**
   - View all registered students in real-time
   - Monitor test completion status
   - Analyze performance metrics

3. **Control Test Access**
   - Enable/disable global test access
   - Manage individual student test permissions
   - Export candidate data

4. **View Analytics**
   - Monitor average scores and pass rates
   - Track test completion statistics
   - Analyze performance trends

### For Students

1. **Create Account**
   - Navigate to `/student/register`
   - Fill in required information
   - Complete profile setup

2. **Login and Dashboard**
   - Access student dashboard
   - View progress status
   - Check test availability

3. **Take Assessment**
   - Accept terms and conditions
   - Complete payment process (₹99)
   - Start the 30-minute test

4. **View Results**
   - Access comprehensive test results
   - Review performance analytics
   - Download certificate (if passed)

## 🔒 Security Features

### Anti-Cheating Mechanisms
- **Tab Switching Detection** - Monitors browser tab changes
- **Keyboard Shortcut Blocking** - Prevents copy-paste and other shortcuts
- **Right-Click Prevention** - Disables context menu access
- **Inactivity Monitoring** - Tracks user activity during test
- **Auto-Submission** - Automatically submits test after 3 warnings

### Authentication & Authorization
- **JWT Token Authentication** - Secure session management
- **Role-Based Access Control** - Separate admin and student portals
- **Session Protection** - Prevents unauthorized back navigation
- **Data Validation** - Input sanitization and validation

## 📊 Performance Analytics

### Student Performance Metrics
- **Score Analysis** - Overall performance percentage
- **Time Efficiency** - Time management effectiveness
- **Attempt Rate** - Question completion thoroughness
- **Success Rate** - Accuracy of attempted questions
- **Warning Analysis** - Compliance and security awareness

### Admin Analytics
- **Test Completion Rates** - Overall student engagement
- **Average Scores** - Performance across all students
- **Pass/Fail Statistics** - Success rate analysis
- **Time Management** - Student time usage patterns
- **Warning Trends** - Security violation patterns

## 🎨 UI/UX Features

### Design System
- **Consistent Theme** - Amber-yellow gradient background
- **Responsive Design** - Works on all device sizes
- **Interactive Elements** - Hover effects and smooth transitions
- **Status Indicators** - Color-coded progress tracking
- **Modern Interface** - Clean and professional appearance

### User Experience
- **Intuitive Navigation** - Easy-to-use interface
- **Real-time Updates** - Live data synchronization
- **Progress Tracking** - Visual status indicators
- **Error Handling** - User-friendly error messages
- **Loading States** - Smooth loading animations

## 📁 Project Structure

```
online-internship-platform1/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── database.sqlite        # SQLite database
├── src/
│   ├── components/
│   │   ├── admin/             # Admin dashboard components
│   │   ├── auth/              # Authentication components
│   │   ├── common/            # Shared components
│   │   ├── student/           # Student portal components
│   │   └── test/              # Test interface components
│   ├── contexts/
│   │   ├── AuthContext.js     # Authentication state management
│   │   └── TestContext.js     # Test state management
│   ├── utils/
│   │   └── softwareEngineeringQuestions.js  # Question bank
│   ├── App.js                 # Main application component
│   └── index.js               # Application entry point
├── public/                    # Static assets
├── package.json               # Frontend dependencies
├── README.md                  # Project documentation
└── .gitignore                 # Git ignore rules
```

## 🔧 Configuration

### Environment Variables
- **PORT** - Backend server port (default: 5000)
- **JWT_SECRET** - Secret key for JWT tokens
- **DATABASE_PATH** - SQLite database file path

### Database Schema
- **Users** - Student and admin user data
- **Test Results** - Comprehensive test performance data
- **Questions** - Software engineering question bank
- **Test Attempts** - Individual test attempt records

## 🚀 Deployment

### Local Development
```bash
# Start backend
cd backend && npm start

# Start frontend (in new terminal)
npm start
```

### Production Deployment
1. Build the frontend: `npm run build`
2. Set up environment variables
3. Deploy backend to server
4. Configure database and file storage
5. Set up SSL certificates for HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Ruchithamula** - Initial work - [GitHub Profile](https://github.com/Ruchithamula)

## 🙏 Acknowledgments

- React.js community for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and testers who helped improve the platform

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

---

**Note:** This platform is designed for educational and assessment purposes. Ensure compliance with local data protection and privacy regulations when deploying in production environments. 