# 🚀 NICOTINE Clinic - Deployment Guide

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [x] Node.js 16+ installed
- [x] Git installed
- [x] GitHub account created
- [x] All syntax errors fixed in server/index.js
- [x] .env file configured (don't commit this!)
- [x] All dependencies installed

---

## 🔧 Step 1: Fix Local Setup

### 1.1 Replace server/index.js
```bash
# Backup your old file (optional)
cp server/index.js server/index.js.backup

# Replace with the fixed version
# Copy the content from FIXED-server-index.js to server/index.js
```

### 1.2 Create .env file
```bash
# Copy the template
cp .env.template .env

# Edit .env and set your values
nano .env  # or use your preferred editor
```

**Required changes in .env:**
```env
SECRET_KEY=your-random-32-char-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com  # Or * for development
```

### 1.3 Test locally
```bash
# Install dependencies
npm install

# Start the server
npm start

# You should see:
# ✅ Database tables created
# 📡 Server running on port: 3000
```

**Test in browser:**
- Open: http://localhost:3000
- Login with: admin / admin123

✅ If it works, proceed to deployment!

---

## 🌐 Step 2: Initialize Git Repository

### 2.1 Initialize Git (if not already initialized)
```bash
# Navigate to your project folder
cd /path/to/nicotine-clinic

# Initialize git
git init

# Add .gitignore
# (Make sure .gitignore file is in place)

# Check git status
git status
```

### 2.2 Stage files
```bash
# Add all files (except those in .gitignore)
git add .

# Verify what will be committed
git status

# ⚠️ IMPORTANT: Make sure .env is NOT listed!
# If .env appears, your .gitignore is wrong!
```

### 2.3 Make first commit
```bash
# Commit with a message
git commit -m "Initial commit - NICOTINE Clinic v3.0"
```

---

## 📤 Step 3: Push to GitHub

### 3.1 Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com/mohammedelsir95-maker
2. Click "New Repository"
3. Name: `nicotine-clinic`
4. Description: "Complete Medical Clinic Management System"
5. ⚠️ **Do NOT** initialize with README (you already have one)
6. Click "Create repository"

**Option B: Via GitHub CLI**
```bash
gh repo create nicotine-clinic --public --source=. --remote=origin
```

### 3.2 Link remote repository
```bash
# Add GitHub as remote
git remote add origin https://github.com/mohammedelsir95-maker/nicotine-clinic.git

# Verify remote
git remote -v
```

### 3.3 Push to GitHub
```bash
# Push to main branch
git branch -M main
git push -u origin main
```

**Expected output:**
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Writing objects: 100% (45/45), 150 KB | 5 MB/s, done.
To https://github.com/mohammedelsir95-maker/nicotine-clinic.git
 * [new branch]      main -> main
```

✅ Your code is now on GitHub!

---

## ☁️ Step 4: Deploy to Cloud Platform

### Option A: Deploy to Render.com (Recommended - Free Tier)

**4A.1 Sign up**
- Go to https://render.com
- Sign up with GitHub account

**4A.2 Create New Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `nicotine-clinic`
3. Configure:
   - **Name:** `nicotine-clinic`
   - **Region:** Choose closest to Sudan (EU/Frankfurt recommended)
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

**4A.3 Add Environment Variables**
In Render dashboard, go to "Environment":
- `SECRET_KEY` = your-secret-key
- `NODE_ENV` = production
- `CORS_ORIGIN` = * (or your domain)
- `BANKAK_ACCOUNT` = your-bankak-account

**4A.4 Deploy**
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- Your app will be at: `https://nicotine-clinic.onrender.com`

---

### Option B: Deploy to Heroku

**4B.1 Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu/Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

**4B.2 Login to Heroku**
```bash
heroku login
```

**4B.3 Create Heroku App**
```bash
# Create app
heroku create nicotine-clinic

# Or with specific name
heroku create your-custom-name
```

**4B.4 Set Environment Variables**
```bash
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN="*"
heroku config:set BANKAK_ACCOUNT="your-account"
```

**4B.5 Deploy to Heroku**
```bash
# Push to Heroku
git push heroku main

# Open in browser
heroku open
```

---

### Option C: Deploy to Railway.app

**4C.1 Sign up**
- Go to https://railway.app
- Sign up with GitHub

**4C.2 Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `nicotine-clinic`

**4C.3 Configure**
- Railway auto-detects Node.js
- Add environment variables in "Variables" tab
- Deploy automatically happens

**4C.4 Access**
- Get URL from "Settings" → "Domains"
- Click "Generate Domain"

---

## 🔍 Step 5: Verify Deployment

### Test Checklist:
- [ ] ✅ Website loads: https://your-app.com
- [ ] ✅ Login works: admin / admin123
- [ ] ✅ Can create new patient
- [ ] ✅ Can create appointment
- [ ] ✅ All sections accessible
- [ ] ✅ WebSocket works (real-time updates)

### Health Check:
```bash
curl https://your-app.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-28T...",
  "uptime": 123.45,
  "environment": "production"
}
```

---

## 🔒 Step 6: Security Post-Deployment

### Immediately after deployment:

**6.1 Change default passwords**
- Login as admin
- Go to Users Management
- Change all default passwords!

**6.2 Create real admin user**
```
Name: Your Name
Username: your-username
Password: strong-password-here
Role: admin
```

**6.3 Disable default admin (optional)**
- After creating your own admin
- Disable the default `admin` user

---

## 📊 Step 7: Monitor Your App

### Render.com
- Check "Logs" tab for errors
- Monitor "Metrics" for performance

### Heroku
```bash
# View logs
heroku logs --tail

# Check status
heroku ps
```

### Railway
- Check "Deployments" tab
- View real-time logs

---

## 🐛 Troubleshooting

### Issue: "Application Error" or 500
**Solution:**
```bash
# Check logs
# Render: Dashboard → Logs
# Heroku: heroku logs --tail
# Railway: Deployments → View Logs

# Common fixes:
1. Verify all environment variables are set
2. Check SECRET_KEY is set
3. Ensure PORT is not hardcoded (use process.env.PORT)
```

### Issue: Database not persisting
**Solution:**
```bash
# Free tier platforms restart periodically
# Data in SQLite will be lost on restart
# For production, consider upgrading to:
- Paid tier with persistent disk
- Or use PostgreSQL addon
```

### Issue: Can't access from mobile/other devices
**Solution:**
- Make sure CORS_ORIGIN is set to "*" or includes your domain
- Check firewall rules on your platform

---

## 🔄 Step 8: Update Your Deployment

When you make changes:

```bash
# 1. Make your changes locally
# 2. Test locally
npm start

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main

# 5. Deployment happens automatically!
# (Render, Railway auto-deploy on push)
# (Heroku: git push heroku main)
```

---

## 📱 Step 9: Custom Domain (Optional)

### Render.com
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed

### Heroku
```bash
heroku domains:add www.yourdomain.com
heroku domains:add yourdomain.com
```

### Railway
1. Settings → Domains
2. Click "Custom Domain"
3. Follow DNS instructions

---

## ✅ Final Checklist

- [ ] Code on GitHub: https://github.com/mohammedelsir95-maker/nicotine-clinic
- [ ] App deployed and accessible online
- [ ] All default passwords changed
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] All features tested
- [ ] Mobile responsive confirmed
- [ ] SSL certificate active (https://)

---

## 🎉 Congratulations!

Your NICOTINE Clinic is now live and accessible worldwide!

**Share your deployment:**
- URL: `https://your-app-name.onrender.com`
- GitHub: `https://github.com/mohammedelsir95-maker/nicotine-clinic`

---

## 📞 Support

**Issues?**
- Check the logs first
- Review this guide
- Open an issue on GitHub
- Check platform-specific documentation

**Platform Docs:**
- Render: https://render.com/docs
- Heroku: https://devcenter.heroku.com
- Railway: https://docs.railway.app

---

**Made with ❤️ in Sudan 🇸🇩**

**NICOTINE Clinic Management System v3.0**
© 2026 Mohammed Elsir - All Rights Reserved
