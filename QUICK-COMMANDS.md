# 🚀 NICOTINE Clinic - Quick Command Reference

## 📦 Local Setup Commands

```bash
# 1. Navigate to project
cd nicotine-clinic

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.template .env

# 4. Edit .env (set SECRET_KEY, etc.)
nano .env

# 5. Start server
npm start

# 6. Test
# Open: http://localhost:3000
# Login: admin / admin123
```

---

## 📤 Git & GitHub Commands

```bash
# Initialize Git (first time only)
git init

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Your commit message"

# Add GitHub remote (first time only)
git remote add origin https://github.com/mohammedelsir95-maker/nicotine-clinic.git

# Push to GitHub
git branch -M main
git push -u origin main

# Subsequent pushes
git push
```

---

## ☁️ Render.com Deployment

**Via Website:**
1. Go to https://render.com
2. New + → Web Service
3. Connect GitHub repo
4. Configure & Deploy

**No CLI needed for Render!**

---

## ☁️ Heroku Deployment

```bash
# Install Heroku CLI (first time)
# macOS:
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create nicotine-clinic

# Set environment variables
heroku config:set SECRET_KEY="your-secret-key-min-32-chars"
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN="*"

# Deploy
git push heroku main

# Open in browser
heroku open

# View logs
heroku logs --tail

# Check status
heroku ps
```

---

## ☁️ Railway Deployment

**Via Website:**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Add environment variables
5. Auto-deploys!

---

## 🔄 Update Deployment

```bash
# 1. Make changes locally
# 2. Test
npm start

# 3. Commit
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push

# 5a. Render/Railway: Auto-deploys!
# 5b. Heroku:
git push heroku main
```

---

## 🔧 Troubleshooting Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check git remote
git remote -v

# View git log
git log --oneline

# Check Heroku logs
heroku logs --tail

# Restart Heroku app
heroku restart

# Check environment variables (Heroku)
heroku config
```

---

## 📊 Health Check

```bash
# Local
curl http://localhost:3000/health

# Production
curl https://your-app.onrender.com/health
curl https://your-app.herokuapp.com/health
```

---

## 🔒 Security Commands

```bash
# Generate random secret key (32 chars)
openssl rand -base64 32

# Or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📁 Project Structure Commands

```bash
# View structure
tree -L 2 -I 'node_modules'

# Create missing folders
mkdir -p database uploads logs

# Set permissions (Linux/Mac)
chmod 755 database uploads logs
```

---

## 🐛 Debug Commands

```bash
# Run with debug output
DEBUG=* npm start

# Check port usage (if port 3000 busy)
# Linux/Mac:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill process on port
# Linux/Mac:
kill -9 $(lsof -t -i:3000)

# Windows:
taskkill /PID <PID> /F
```

---

## 📦 Backup Commands

```bash
# Backup database
cp database/nicotine.db database/nicotine-backup-$(date +%Y%m%d).db

# Backup entire project
tar -czf nicotine-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  .
```

---

## 🎯 One-Command Setup (Copy-Paste)

```bash
# Complete setup from scratch
git clone https://github.com/mohammedelsir95-maker/nicotine-clinic.git && \
cd nicotine-clinic && \
npm install && \
cp .env.template .env && \
echo "✅ Setup complete! Edit .env file, then run: npm start"
```

---

## 🚀 One-Command Deploy to Heroku

```bash
# Complete Heroku deployment
heroku create nicotine-clinic && \
heroku config:set SECRET_KEY="$(openssl rand -base64 32)" && \
heroku config:set NODE_ENV=production && \
heroku config:set CORS_ORIGIN="*" && \
git push heroku main && \
heroku open
```

---

## 📱 Mobile Testing

```bash
# Get your local IP
# Linux/Mac:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig

# Access from mobile:
# http://[YOUR-IP]:3000
```

---

## 🎓 Useful Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Quick start
alias nicotine-start='cd ~/nicotine-clinic && npm start'

# Quick deploy
alias nicotine-deploy='cd ~/nicotine-clinic && git add . && git commit -m "Update" && git push'

# Quick backup
alias nicotine-backup='cp ~/nicotine-clinic/database/nicotine.db ~/nicotine-backup-$(date +%Y%m%d).db'
```

---

**🔖 Bookmark this file for quick reference!**

**NICOTINE Clinic v3.0** - Made with ❤️ in Sudan 🇸🇩
