# Online Internship Platform - Updated Setup Guide

## 🎯 **Project Overview**

This is a comprehensive online internship test platform built with React.js frontend and Node.js backend, designed for Yuga Yatra Retail (OPC) Private Limited. The platform allows students to take software engineering assessments and administrators to manage the entire process.

## 🗄️ **Database Configuration**

**Single MySQL Database Setup using Hostinger:**
- **Database Name:** `u544973759_YugaYatra@123`
- **Username:** `u544973759_internship123`
- **Password:** `jZ-NjmfQ@C4`
- **Host:** `localhost`
- **Port:** `3306`

## 🚀 **Quick Start Guide**

### **Step 1: Frontend Setup**
```bash
# Install dependencies
npm install

# Start React development server
npm start
```
Frontend will run on: `http://localhost:3000`

### **Step 2: Backend Setup**
```bash
# Navigate to backend directory
cd backend-sql

# Install dependencies
npm install

# Set up MySQL database and migrate data
node scripts/migrate-to-mysql.js

# Start backend server
npm start
```
Backend will run on: `http://localhost:5000`

## 📊 **Database Schema**

The MySQL database includes these tables:
- **users** - Student and admin accounts
- **payments** - Razorpay payment records
- **test_attempts** - Test results and scores
- **questions** - Software engineering question bank (25+ questions)
- **student_answers** - Individual question responses
- **terms_agreements** - Terms acceptance tracking

## 👤 **Default Accounts**

### **Admin Access:**
- **Username:** `Admin`
- **Password:** `Admin`
- **Email:** `admin@onlyinternship.in`
- **Access:** `/admin/login`

### **Student Access:**
- **Registration:** `/student/register`
- **Login:** `/student/login`
- **Dashboard:** `/student/dashboard`

## 🔧 **Features**

### **Student Features:**
- Account registration and profile management
- Terms and conditions acceptance
- Payment processing (₹750 + GST)
- 35-question software engineering test
- Real-time anti-cheating protection
- Comprehensive results and analytics
- Performance tracking and history

### **Admin Features:**
- Real-time candidate management
- Test performance analytics
- Payment status monitoring
- Question bank management
- Data export (CSV/JSON)
- Global test controls
- Individual student management

### **Test System:**
- 30-minute timed assessment
- Anti-cheating mechanisms
- Tab switching detection
- Keyboard shortcut blocking
- Inactivity monitoring
- Auto-submission after warnings

## 🛠️ **Technology Stack**

### **Frontend:**
- React.js 18.2.0
- Tailwind CSS
- React Router DOM
- React Hot Toast
- React Icons

### **Backend:**
- Node.js with Express
- MySQL database (Hostinger)
- JWT authentication
- Razorpay payment integration
- CORS and security middleware

## 📱 **Payment Integration**

**Razorpay Payment Gateway:**
- Test fee: ₹750 + 18% GST = ₹885
- Multiple payment methods
- Secure payment processing
- Payment verification
- Order management

## 🚀 **Deployment**

### **Local Development:**
1. Frontend: `npm start` (Port 3000)
2. Backend: `cd backend-sql && npm start` (Port 5000)

### **Production:**
- Frontend: Build with `npm run build`
- Backend: Deploy to hosting service
- Database: Use production MySQL server
- Environment variables: Configure for production

## 🔒 **Security Features**

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 📁 **Project Structure**

```
online-internship-platform/
├── src/                    # React frontend components
├── backend-sql/           # Node.js backend with MySQL
│   ├── config/            # Database configuration
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & validation
│   └── scripts/           # Database setup scripts
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## 🐛 **Troubleshooting**

### **Database Connection Issues:**
1. Verify Hostinger database credentials
2. Check if MySQL service is running
3. Ensure proper firewall settings
4. Verify database user privileges

### **Payment Issues:**
1. Configure Razorpay API keys
2. Set environment variables
3. Check payment gateway status

## 📞 **Support**

For technical support:
1. Check console error logs
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Check environment configuration

---

**Note:** This platform is designed for educational assessment purposes. Ensure compliance with local data protection regulations when deploying in production. 