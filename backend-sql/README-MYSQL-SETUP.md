# MySQL Database Setup for Online Internship Platform

This guide will help you set up the MySQL database for the Online Internship Platform using your Hostinger hosting credentials.

## 🗄️ Database Credentials

**Database Name:** `u544973759_YugaYatra@123`  
**Username:** `u544973759_internship123`  
**Password:** `jZ-NjmfQ@C4`  
**Host:** `localhost`  
**Port:** `3306`

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
cd backend-sql
npm install
```

### Step 2: Set Up Database
```bash
node scripts/setup-mysql.js
```

This script will:
- Connect to your Hostinger MySQL server
- Create the database if it doesn't exist
- Create all required tables
- Insert sample questions
- Set up the default admin account

### Step 3: Start the Server
```bash
npm start
```

The server will run on port 5000 by default.

## 📊 Database Schema

The setup creates the following tables:

- **users** - Student and admin accounts
- **payments** - Razorpay payment records
- **test_attempts** - Test results and scores
- **questions** - Software engineering question bank
- **student_answers** - Individual question responses
- **terms_agreements** - Terms acceptance tracking

## 👤 Default Admin Account

After setup, you can login with:
- **Username:** `Admin`
- **Password:** `Admin`
- **Email:** `admin@onlyinternship.in`

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the `backend-sql` directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
FRONTEND_URL=http://localhost:3000
```

### Razorpay Integration
To enable payments, you'll need:
1. Razorpay account
2. API keys from Razorpay dashboard
3. Update the environment variables above

## 🐛 Troubleshooting

### Connection Issues
If you get connection errors:

1. **Access Denied:**
   - Verify credentials in Hostinger control panel
   - Check if the database user exists
   - Ensure proper permissions

2. **Connection Refused:**
   - Check if MySQL service is running
   - Verify host and port settings
   - Check firewall configuration

### Database Setup Issues
If the setup script fails:

1. Check the error messages for specific issues
2. Verify database credentials
3. Ensure the user has CREATE privileges
4. Check if the database name is valid

## 📱 Frontend Integration

The frontend React app should be configured to connect to:
- **Backend URL:** `http://localhost:5000`
- **API Endpoint:** `http://localhost:5000/api`

## 🚀 Production Deployment

For production deployment:

1. Update the database host to your production server
2. Set proper environment variables
3. Configure SSL certificates
4. Set up proper firewall rules
5. Use production Razorpay keys

## 📞 Support

If you encounter issues:
1. Check the error logs in the console
2. Verify your Hostinger database settings
3. Ensure all dependencies are installed
4. Check if the database user has proper privileges

---

**Note:** This setup uses your Hostinger MySQL database. Make sure your hosting plan supports MySQL databases and the credentials are correct.
