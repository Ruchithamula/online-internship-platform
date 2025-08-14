# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

### ✅ Vercel Frontend Deployment (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository: `Ruchithamula/online-internship-platform`

2. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

### 🔧 Manual Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Backend Deployment Options

### Option 1: Railway (Recommended for Full-Stack)

1. **Deploy Backend to Railway**
   ```bash
   cd backend
   # Follow Railway deployment guide
   ```

2. **Update Frontend Environment**
   - Set `REACT_APP_API_URL` to your Railway backend URL

### Option 2: Render

1. **Deploy Backend to Render**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment variables

2. **Update Frontend Environment**
   - Set `REACT_APP_API_URL` to your Render backend URL

### Option 3: Heroku

1. **Deploy Backend to Heroku**
   ```bash
   cd backend
   heroku create your-app-name
   git push heroku main
   ```

2. **Update Frontend Environment**
   - Set `REACT_APP_API_URL` to your Heroku backend URL

## Current Issues & Solutions

### ❌ Common Vercel Errors

1. **Build Failures**
   - Ensure all dependencies are in `package.json`
   - Check for missing environment variables

2. **API Connection Errors**
   - Backend must be deployed separately
   - Update `REACT_APP_API_URL` environment variable

3. **Routing Issues**
   - Vercel.json handles SPA routing
   - All routes redirect to index.html

### ✅ Quick Fix Commands

```bash
# Check build locally
npm run build

# Test production build
npx serve -s build

# Update dependencies
npm update

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENV=production
```

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend-url.vercel.app
DATABASE_PATH=./database.sqlite
```

## Database Setup

### SQLite (Current)
- Database file: `backend/database.sqlite`
- Automatically created on first run
- No additional setup required

### MySQL (Optional)
- Use `backend-sql/` directory
- Follow `README-MYSQL-SETUP.md`
- Requires separate MySQL hosting

## Monitoring & Debugging

### Vercel Dashboard
- View deployment logs
- Check build status
- Monitor performance

### Backend Logs
- Check your backend hosting platform logs
- Monitor API response times
- Debug database connections

## Support

- **Vercel Issues**: Check Vercel dashboard logs
- **Backend Issues**: Check your backend hosting platform
- **Database Issues**: Verify connection strings and permissions

---

**Note**: This is a full-stack application. The frontend (React) and backend (Node.js) must be deployed separately to different platforms. 