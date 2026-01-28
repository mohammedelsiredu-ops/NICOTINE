# 🚀 NICOTINE Clinic v3.1 - Deployment Guide

## 📋 What's New in v3.1

### ✅ Library Migration
- **Replaced** `better-sqlite3` → `sqlite3` (async, no native compilation issues)
- **Replaced** `bcrypt` → `bcryptjs` (pure JavaScript, Render-compatible)

### ✅ Modernization
- **Full async/await** refactoring - all database operations are now Promise-based
- **Centralized error handling** - custom `AppError` class and global error middleware
- **Enhanced Socket.io** - real-time updates across all departments
- **Modular design** - clean separation of concerns

### ✅ Production Ready
- **Render.com optimized** - listens on `0.0.0.0` with proper PORT handling
- **Graceful shutdown** - proper database connection cleanup
- **Comprehensive logging** - request tracking and error monitoring
- **Security hardened** - JWT expiration, role-based auth, input validation

---

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

**New dependencies:**
- `sqlite3@^5.1.7` - Async SQLite with Promise support
- `bcryptjs@^2.4.3` - Pure JavaScript bcrypt implementation

### 2. Environment Configuration

Create `.env` file:

```bash
cp .env.template .env
```

**Critical settings:**
```env
PORT=3000
NODE_ENV=production
SECRET_KEY=your-super-secret-jwt-key-min-32-chars-change-this
CORS_ORIGIN=*
DATABASE_PATH=./database/nicotine.db
BANKAK_ACCOUNT=YOUR_BANKAK_ACCOUNT_NUMBER
```

**⚠️ IMPORTANT:** Change `SECRET_KEY` to a strong random string (minimum 32 characters)

Generate a secure key:
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Test Locally

```bash
npm start
```

Access: `http://localhost:3000`

---

## ☁️ Render.com Deployment (Recommended)

### Why Render?
- ✅ **No build issues** with sqlite3 and bcryptjs
- ✅ **Automatic deploys** from GitHub
- ✅ **Free tier** available
- ✅ **Zero configuration** needed

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "NICOTINE Clinic v3.1 - Production ready"
git remote add origin https://github.com/mohammedelsir95-maker/nicotine-clinic.git
git branch -M main
git push -u origin main
```

#### 2. Create Render Web Service

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

```yaml
Name: nicotine-clinic
Environment: Node
Build Command: npm install
Start Command: npm start
```

#### 3. Add Environment Variables

In Render dashboard, add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `SECRET_KEY` | `[your-32-char-key]` | **CRITICAL** |
| `CORS_ORIGIN` | `*` | Or your domain |
| `BANKAK_ACCOUNT` | `[your-account]` | Optional |

#### 4. Deploy

Click **"Create Web Service"** - Render will:
- Install dependencies (no compilation errors!)
- Start the server
- Provide your live URL

### Expected Result
```
✅ Server Status: Live
🌐 URL: https://nicotine-clinic-xxxx.onrender.com
```

---

## 🔧 Key Technical Improvements

### 1. Database Wrapper (Async)

**Old (better-sqlite3):**
```javascript
const result = db.prepare('SELECT * FROM users').all(); // Sync
```

**New (sqlite3 + Promises):**
```javascript
const result = await db.all('SELECT * FROM users'); // Async
```

**Benefits:**
- Non-blocking I/O
- Better concurrency
- Proper error handling with try-catch

### 2. Password Hashing (Pure JS)

**Old (bcrypt):**
```javascript
const hash = bcrypt.hashSync(password, 10); // Native module, requires compilation
```

**New (bcryptjs):**
```javascript
const hash = await bcrypt.hash(password, 10); // Pure JavaScript, no compilation
```

**Benefits:**
- Works on all platforms (no node-gyp)
- No deployment issues on Render/Heroku
- Same security level

### 3. Error Handling

**Centralized middleware:**
```javascript
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Usage
throw new AppError('اسم المستخدم أو كلمة المرور غير صحيحة', 401);
```

**Global handler:**
- Catches all errors
- Distinguishes operational vs programming errors
- Provides helpful messages in Arabic
- Logs stack traces in development

### 4. Real-Time Updates

**Enhanced Socket.io events:**
```javascript
// Lab test created
emitRealTimeUpdate('lab_test_created', { 
  id: result.lastID, 
  patient_id, 
  status: 'pending' 
});

// Prescription dispensed
emitRealTimeUpdate('prescription_dispensed', { 
  id: req.params.id 
});
```

**All departments get instant updates:**
- Lab results ready → Doctor notified
- Prescription created → Pharmacy notified
- Payment received → Reception updated

### 5. Role-Based Access Control

**Middleware:**
```javascript
authorizeRoles('doctor', 'admin')
```

**Protected routes:**
- `/api/medical-records` → Doctor, Admin only
- `/api/inventory` → Pharmacy, Admin only
- `/api/users` → Admin only

---

## 🔐 Security Features

1. **JWT Authentication**
   - 24-hour token expiration
   - Secure secret key
   - Role-based claims

2. **Password Security**
   - bcryptjs with 10 salt rounds
   - Minimum 6 characters
   - No plaintext storage

3. **Input Validation**
   - Required field checks
   - File type restrictions (images, PDFs only)
   - File size limits (10MB)

4. **SQL Injection Prevention**
   - Parameterized queries
   - No raw SQL concatenation

5. **CORS Configuration**
   - Configurable origins
   - Credentials support

---

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/change-password` - Change password

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Lab Tests
- `GET /api/lab-tests` - All tests
- `GET /api/lab-tests/pending` - Pending only
- `POST /api/lab-tests` - Create test
- `PUT /api/lab-tests/:id` - Update results

### Prescriptions
- `GET /api/prescriptions` - All prescriptions
- `GET /api/prescriptions/active` - Active only
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id/dispense` - Dispense medicine

### Inventory
- `GET /api/inventory` - All medicines
- `GET /api/inventory/low-stock` - Low stock alerts
- `POST /api/inventory` - Add medicine
- `PUT /api/inventory/:id` - Update stock

### Statistics
- `GET /api/statistics` - Dashboard data
- `GET /api/test-statistics` - Popular tests
- `GET /api/activity-log` - User activity (Admin only)

### Health Check
- `GET /health` - Server status

---

## 🔄 Real-Time Events

Client-side Socket.io events to listen for:

```javascript
socket.on('lab_test_created', (data) => {
  console.log('New lab test:', data);
  // Refresh lab tests list
});

socket.on('prescription_created', (data) => {
  console.log('New prescription:', data);
  // Update pharmacy queue
});

socket.on('patient_created', (data) => {
  console.log('New patient:', data);
  // Refresh patient list
});

socket.on('activity_logged', (data) => {
  console.log('Activity:', data);
  // Update activity feed
});
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: sqlite3"
**Solution:** Ensure `sqlite3` is in `dependencies`, not `devDependencies`

```bash
npm install sqlite3 --save
```

### Issue: "bcrypt compilation error"
**Solution:** You shouldn't see this anymore! We use `bcryptjs` (pure JS)

### Issue: "Port already in use"
**Solution:** 
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Issue: "Database locked"
**Solution:** We use WAL mode, but ensure no multiple instances:
```bash
ps aux | grep node
kill -9 <PID>
```

### Issue: "CORS error"
**Solution:** Set `CORS_ORIGIN` in `.env` or Render environment variables

---

## 📈 Performance Optimizations

1. **WAL Mode** - Better concurrency for SQLite
   ```javascript
   db.run('PRAGMA journal_mode = WAL');
   ```

2. **Connection Pooling** - Single database instance
3. **Async Operations** - Non-blocking I/O throughout
4. **Index Optimization** - Foreign keys and primary keys
5. **Socket.io Transports** - WebSocket + polling fallback

---

## 🔍 Monitoring

### Health Check Endpoint
```bash
curl https://your-app.onrender.com/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "version": "3.1.0"
}
```

### Logs
```bash
# Local
npm start

# Render Dashboard
View Logs → Real-time logs
```

---

## 🚦 Testing Checklist

Before going live, test:

- [ ] User login (all roles)
- [ ] Create patient
- [ ] Create lab test
- [ ] Update lab results
- [ ] Create prescription
- [ ] Dispense medicine
- [ ] Real-time updates (open 2 browser tabs)
- [ ] File upload (ultrasound images)
- [ ] Payment with QR code
- [ ] Statistics dashboard
- [ ] Activity log (admin)

---

## 🆘 Support & Maintenance

### Database Backup
```bash
# Backup database
cp database/nicotine.db database/nicotine-backup-$(date +%Y%m%d).db
```

### Update Deployment
```bash
git add .
git commit -m "Update: description"
git push
# Render auto-deploys!
```

### View Logs
```bash
# Render Dashboard → Logs
# Or use Render CLI
render logs -f
```

---

## 📝 Migration from v3.0 to v3.1

If you have existing v3.0 installation:

1. **Backup database:**
   ```bash
   cp database/nicotine.db database/nicotine-v3.0-backup.db
   ```

2. **Update dependencies:**
   ```bash
   npm uninstall better-sqlite3 bcrypt
   npm install sqlite3 bcryptjs
   ```

3. **Replace server file:**
   - Copy new `server/index.js`

4. **No database migration needed** - Schema is identical!

5. **Test locally:**
   ```bash
   npm start
   ```

6. **Deploy to Render** as described above

---

## 🎉 Success Indicators

When deployment is successful, you should see:

```
✅ Server Status: Live
✅ Database: Connected
✅ Real-time updates: ENABLED
✅ Async/await: ENABLED
✅ Error handling: CENTRALIZED
✅ Default users: Created
```

**Access your clinic at:** `https://your-app.onrender.com`

**Default credentials:**
- Admin: `admin / admin123`
- Doctor: `doctor / 123`
- Lab: `lab / 123`
- Pharmacy: `pharmacy / 123`

**⚠️ Change all default passwords immediately!**

---

## 📞 Contact & Credits

**Developer:** Mohammed Elsir  
**GitHub:** https://github.com/mohammedelsir95-maker/nicotine-clinic  
**Version:** 3.1.0 (Modernized & Production Ready)  
**Location:** Sudan 🇸🇩

---

**Made with ❤️ for healthcare in Sudan**
