# Deployment Guide - Online Internship Platform

This guide provides step-by-step instructions for deploying the Online Internship Platform to various environments.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git
- A web server or cloud platform account

## 📦 Local Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/Ruchithamula/online-internship-platform1.git
cd online-internship-platform1
npm install
cd backend && npm install && cd ..
```

### 2. Start Development Servers
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
npm start
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ☁️ Cloud Deployment Options

### Option 1: Heroku Deployment

#### Backend Deployment
1. **Create Heroku App**
   ```bash
   heroku create your-app-name-backend
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret_here
   heroku config:set PORT=5000
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend deployment"
   heroku git:remote -a your-app-name-backend
   git push heroku main
   ```

#### Frontend Deployment
1. **Build Production Version**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify/Vercel**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Configure environment variables for API URL

### Option 2: Vercel Deployment

#### Full Stack Deployment
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Set `REACT_APP_API_URL` to your backend URL
   - Set `JWT_SECRET` for backend

### Option 3: AWS Deployment

#### EC2 Instance Setup
1. **Launch EC2 Instance**
   - Choose Ubuntu Server
   - Configure Security Groups (ports 22, 80, 443, 3000, 5000)

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. **Deploy Application**
   ```bash
   git clone https://github.com/Ruchithamula/online-internship-platform1.git
   cd online-internship-platform1
   npm install
   cd backend && npm install
   ```

4. **Configure PM2**
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "internship-backend"
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/internship-platform
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /var/www/internship-platform/build;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/internship-platform /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 🔧 Environment Configuration

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here
DATABASE_PATH=./database.sqlite
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_ENVIRONMENT=production
```

## 🗄️ Database Setup

### SQLite (Default)
- Database file is automatically created
- No additional setup required
- Backup regularly for production

### PostgreSQL (Optional)
1. **Install PostgreSQL**
2. **Create Database**
   ```sql
   CREATE DATABASE internship_platform;
   CREATE USER internship_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE internship_platform TO internship_user;
   ```

3. **Update Backend Configuration**
   ```javascript
   // Update database connection in server.js
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });
   ```

## 🔒 Security Configuration

### SSL/HTTPS Setup
1. **Obtain SSL Certificate**
   - Use Let's Encrypt (free)
   - Or purchase from certificate authority

2. **Configure Nginx SSL**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       # ... rest of configuration
   }
   ```

### Security Headers
```javascript
// In backend/server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 📊 Monitoring and Logging

### Application Monitoring
1. **PM2 Monitoring**
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Nginx Logs**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Health Checks
```javascript
// Add to backend/server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install Dependencies
      run: |
        npm install
        cd backend && npm install
        
    - name: Build Frontend
      run: npm run build
      
    - name: Deploy to Server
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   sudo chown -R $USER:$USER /var/www/
   sudo chmod -R 755 /var/www/
   ```

3. **Database Connection Issues**
   ```bash
   # Check SQLite database
   sqlite3 database.sqlite ".tables"
   ```

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Support

For deployment issues:
1. Check the logs: `pm2 logs` or `docker logs`
2. Verify environment variables
3. Test database connectivity
4. Check firewall and security group settings
5. Create an issue in the GitHub repository

## 🔄 Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp database.sqlite backup/database_$DATE.sqlite
```

### File Backup
```bash
# Backup entire application
tar -czf backup/app_$(date +%Y%m%d_%H%M%S).tar.gz .
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

---

**Note:** Always test your deployment in a staging environment before deploying to production. Keep your dependencies updated and monitor your application regularly for security updates. 