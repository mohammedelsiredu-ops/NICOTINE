/*
 * ========================================
 * NICOTINE Clinic Management System v3.1
 * Server - Modernized & Production Ready
 * ========================================
 * 
 * Improvements:
 * - Replaced better-sqlite3 with sqlite3 (async)
 * - Replaced bcrypt with bcryptjs
 * - Full async/await refactoring
 * - Centralized error handling middleware
 * - Enhanced Socket.io real-time updates
 * - Modular database operations
 * - Render.com optimized
 * ========================================
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const multer = require('multer');
const moment = require('moment');

// ====================================
// Environment Configuration
// ====================================
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'nicotine-clinic-2026-secret-key-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ====================================
// Database Wrapper for Promises
// ====================================
class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        throw err;
      }
      console.log('✅ Connected to SQLite database');
    });
    
    // Enable WAL mode for better concurrency
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
  }

  // Promisified run method
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // Promisified get method
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Promisified all method
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Promisified exec method
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// ====================================
// Express App Setup
// ====================================
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { 
    origin: process.env.CORS_ORIGIN || "*", 
    methods: ["GET", "POST", "PUT", "DELETE"] 
  },
  transports: ['websocket', 'polling']
});

// ====================================
// Middleware
// ====================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      if (!fsSync.existsSync(uploadDir)) {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('يسمح فقط بملفات الصور والمستندات'));
    }
  }
});

// ====================================
// Database Setup
// ====================================
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/nicotine.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists (sync for initialization)
if (!fsSync.existsSync(dbDir)) {
  fsSync.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// ====================================
// Utility Functions
// ====================================

// Activity Logger
async function logActivity(userId, action, details = '') {
  try {
    await db.run(`
      INSERT INTO activity_log (user_id, action, details)
      VALUES (?, ?, ?)
    `, [userId, action, details]);
    
    // Emit real-time update
    io.emit('activity_logged', { userId, action, details, timestamp: new Date() });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Socket.io Real-time Event Emitters
const emitRealTimeUpdate = (event, data) => {
  io.emit(event, data);
  console.log(`🔔 Real-time update: ${event}`);
};

// ====================================
// Database Initialization
// ====================================
async function initDatabase() {
  console.log('🔧 Initializing database...');

  try {
    // Users Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        shift TEXT,
        phone TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patients Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        blood_type TEXT,
        national_id TEXT,
        address TEXT,
        allergies TEXT,
        chronic_diseases TEXT,
        previous_surgeries TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Appointments Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Payments Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'completed',
        qr_code TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    // Medical Records Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        symptoms TEXT,
        diagnosis TEXT,
        treatment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Lab Tests Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS lab_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        test_names TEXT NOT NULL,
        results TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Test Statistics Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS test_statistics (
        test_name TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);

    // Prescriptions Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        medicine_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration INTEGER NOT NULL,
        timing TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'active',
        dispensed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Inventory Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_name TEXT NOT NULL UNIQUE,
        quantity INTEGER NOT NULL,
        expiry_date TEXT NOT NULL,
        price REAL,
        barcode TEXT,
        alert_threshold INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Drug Interactions Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS drug_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug1 TEXT NOT NULL,
        drug2 TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT,
        alternatives TEXT
      )
    `);

    // Nursing Orders Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS nursing_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        medicine_name TEXT NOT NULL,
        injection_type TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration INTEGER NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Ultrasound Orders Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ultrasound_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        scan_type TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        report TEXT,
        images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Admin Notes Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admin_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user_id INTEGER NOT NULL,
        from_user_role TEXT NOT NULL,
        message TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id)
      )
    `);

    // Activity Log Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create default admin user if not exists
    await createDefaultUsers();

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Create default users
async function createDefaultUsers() {
  const defaultUsers = [
    { name: 'مدير النظام', username: 'admin', password: 'admin123', role: 'admin', shift: 'all' },
    { name: 'دكتور', username: 'doctor', password: '123', role: 'doctor', shift: 'morning' },
    { name: 'استقبال', username: 'reception', password: '123', role: 'reception', shift: 'morning' },
    { name: 'مختبر', username: 'lab', password: '123', role: 'lab', shift: 'morning' },
    { name: 'صيدلية', username: 'pharmacy', password: '123', role: 'pharmacy', shift: 'morning' },
    { name: 'تمريض', username: 'nurse', password: '123', role: 'nurse', shift: 'morning' },
    { name: 'موجات', username: 'ultrasound', password: '123', role: 'ultrasound', shift: 'morning' }
  ];

  for (const user of defaultUsers) {
    try {
      const existing = await db.get('SELECT id FROM users WHERE username = ?', [user.username]);
      if (!existing) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.run(`
          INSERT INTO users (name, username, password, role, shift)
          VALUES (?, ?, ?, ?, ?)
        `, [user.name, user.username, hashedPassword, user.role, user.shift]);
        console.log(`✅ Created default user: ${user.username}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error);
    }
  }
}

// ====================================
// Authentication Middleware
// ====================================
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'رمز التحقق غير صالح' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في المصادقة' });
  }
}

// Role-based authorization middleware
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية للوصول لهذه الميزة' });
    }
    next();
  };
}

// ====================================
// Centralized Error Handler
// ====================================
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ====================================
// Authentication Routes
// ====================================

// Login
app.post('/api/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('اسم المستخدم وكلمة المرور مطلوبة', 400);
  }

  const user = await db.get('SELECT * FROM users WHERE username = ? AND active = 1', [username]);

  if (!user) {
    throw new AppError('اسم المستخدم أو كلمة المرور غير صحيحة', 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    throw new AppError('اسم المستخدم أو كلمة المرور غير صحيحة', 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  await logActivity(user.id, 'تسجيل دخول', `Role: ${user.role}`);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      shift: user.shift
    }
  });
}));

// Change Password
app.post('/api/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new AppError('كلمة المرور القديمة والجديدة مطلوبة', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 400);
  }

  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const validPassword = await bcrypt.compare(oldPassword, user.password);

  if (!validPassword) {
    throw new AppError('كلمة المرور القديمة غير صحيحة', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

  await logActivity(req.user.id, 'تغيير كلمة المرور');

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
}));

// ====================================
// User Management Routes
// ====================================

// Get all users
app.get('/api/users', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const users = await db.all(`
    SELECT id, name, username, role, shift, phone, active, created_at
    FROM users
    ORDER BY created_at DESC
  `);
  res.json(users);
}));

// Create user
app.post('/api/users', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { name, username, password, role, shift, phone } = req.body;

  if (!name || !username || !password || !role) {
    throw new AppError('جميع الحقول المطلوبة يجب ملؤها', 400);
  }

  const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUser) {
    throw new AppError('اسم المستخدم موجود بالفعل', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.run(`
    INSERT INTO users (name, username, password, role, shift, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [name, username, hashedPassword, role, shift, phone]);

  await logActivity(req.user.id, 'إضافة مستخدم', `Username: ${username}`);
  emitRealTimeUpdate('user_created', { id: result.lastID });

  res.json({ success: true, id: result.lastID });
}));

// Update user
app.put('/api/users/:id', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { name, role, shift, phone, active } = req.body;

  await db.run(`
    UPDATE users 
    SET name = ?, role = ?, shift = ?, phone = ?, active = ?
    WHERE id = ?
  `, [name, role, shift, phone, active, req.params.id]);

  await logActivity(req.user.id, 'تحديث مستخدم', `ID: ${req.params.id}`);
  emitRealTimeUpdate('user_updated', { id: req.params.id });

  res.json({ success: true });
}));

// Delete user
app.delete('/api/users/:id', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  if (req.params.id === '1') {
    throw new AppError('لا يمكن حذف المستخدم الرئيسي', 400);
  }

  await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);

  await logActivity(req.user.id, 'حذف مستخدم', `ID: ${req.params.id}`);
  emitRealTimeUpdate('user_deleted', { id: req.params.id });

  res.json({ success: true });
}));

// ====================================
// Patient Management Routes
// ====================================

// Get all patients
app.get('/api/patients', authenticateToken, asyncHandler(async (req, res) => {
  const patients = await db.all(`
    SELECT * FROM patients
    ORDER BY created_at DESC
  `);
  res.json(patients);
}));

// Get single patient
app.get('/api/patients/:id', authenticateToken, asyncHandler(async (req, res) => {
  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  
  if (!patient) {
    throw new AppError('المريض غير موجود', 404);
  }

  res.json(patient);
}));

// Create patient
app.post('/api/patients', authenticateToken, asyncHandler(async (req, res) => {
  const { name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries } = req.body;

  if (!name || !phone || !age || !gender) {
    throw new AppError('الحقول المطلوبة: الاسم، الهاتف، العمر، الجنس', 400);
  }

  const result = await db.run(`
    INSERT INTO patients (name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries]);

  await logActivity(req.user.id, 'إضافة مريض', `Name: ${name}`);
  emitRealTimeUpdate('patient_created', { id: result.lastID, name });

  res.json({ success: true, id: result.lastID });
}));

// Update patient
app.put('/api/patients/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries } = req.body;

  await db.run(`
    UPDATE patients 
    SET name = ?, phone = ?, age = ?, gender = ?, blood_type = ?, 
        national_id = ?, address = ?, allergies = ?, chronic_diseases = ?, 
        previous_surgeries = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries, req.params.id]);

  await logActivity(req.user.id, 'تحديث بيانات مريض', `ID: ${req.params.id}`);
  emitRealTimeUpdate('patient_updated', { id: req.params.id });

  res.json({ success: true });
}));

// Delete patient
app.delete('/api/patients/:id', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  await db.run('DELETE FROM patients WHERE id = ?', [req.params.id]);

  await logActivity(req.user.id, 'حذف مريض', `ID: ${req.params.id}`);
  emitRealTimeUpdate('patient_deleted', { id: req.params.id });

  res.json({ success: true });
}));

// ====================================
// Appointment Routes
// ====================================

// Get all appointments
app.get('/api/appointments', authenticateToken, asyncHandler(async (req, res) => {
  const appointments = await db.all(`
    SELECT a.*, p.name as patient_name, u.name as doctor_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.doctor_id = u.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);
  res.json(appointments);
}));

// Create appointment
app.post('/api/appointments', authenticateToken, asyncHandler(async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;

  if (!patient_id || !appointment_date || !appointment_time) {
    throw new AppError('معلومات الموعد غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes)
    VALUES (?, ?, ?, ?, ?)
  `, [patient_id, doctor_id, appointment_date, appointment_time, notes]);

  await logActivity(req.user.id, 'إضافة موعد', `Patient ID: ${patient_id}`);
  emitRealTimeUpdate('appointment_created', { id: result.lastID, patient_id });

  res.json({ success: true, id: result.lastID });
}));

// Update appointment
app.put('/api/appointments/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  await db.run(`
    UPDATE appointments 
    SET status = ?, notes = ?
    WHERE id = ?
  `, [status, notes, req.params.id]);

  await logActivity(req.user.id, 'تحديث موعد', `ID: ${req.params.id}`);
  emitRealTimeUpdate('appointment_updated', { id: req.params.id, status });

  res.json({ success: true });
}));

// Delete appointment
app.delete('/api/appointments/:id', authenticateToken, asyncHandler(async (req, res) => {
  await db.run('DELETE FROM appointments WHERE id = ?', [req.params.id]);

  await logActivity(req.user.id, 'حذف موعد', `ID: ${req.params.id}`);
  emitRealTimeUpdate('appointment_deleted', { id: req.params.id });

  res.json({ success: true });
}));

// ====================================
// Payment Routes
// ====================================

// Get all payments
app.get('/api/payments', authenticateToken, asyncHandler(async (req, res) => {
  const payments = await db.all(`
    SELECT p.*, pat.name as patient_name
    FROM payments p
    JOIN patients pat ON p.patient_id = pat.id
    ORDER BY p.created_at DESC
  `);
  res.json(payments);
}));

// Create payment
app.post('/api/payments', authenticateToken, asyncHandler(async (req, res) => {
  const { patient_id, amount, payment_method, notes } = req.body;

  if (!patient_id || !amount || !payment_method) {
    throw new AppError('معلومات الدفع غير كاملة', 400);
  }

  let qrCode = null;
  if (payment_method === 'bankak') {
    const bankakAccount = process.env.BANKAK_ACCOUNT || '249123456789';
    qrCode = await QRCode.toDataURL(`bankak:${bankakAccount}?amount=${amount}`);
  }

  const result = await db.run(`
    INSERT INTO payments (patient_id, amount, payment_method, qr_code, notes)
    VALUES (?, ?, ?, ?, ?)
  `, [patient_id, amount, payment_method, qrCode, notes]);

  await logActivity(req.user.id, 'إضافة دفعة', `Amount: ${amount} SDG`);
  emitRealTimeUpdate('payment_created', { id: result.lastID, patient_id, amount });

  res.json({ success: true, id: result.lastID, qr_code: qrCode });
}));

// ====================================
// Medical Records Routes
// ====================================

// Get medical records for patient
app.get('/api/medical-records/:patientId', authenticateToken, asyncHandler(async (req, res) => {
  const records = await db.all(`
    SELECT mr.*, u.name as doctor_name
    FROM medical_records mr
    LEFT JOIN users u ON mr.doctor_id = u.id
    WHERE mr.patient_id = ?
    ORDER BY mr.created_at DESC
  `, [req.params.patientId]);
  
  res.json(records);
}));

// Create medical record
app.post('/api/medical-records', authenticateToken, authorizeRoles('doctor', 'admin'), asyncHandler(async (req, res) => {
  const { patient_id, symptoms, diagnosis, treatment } = req.body;

  if (!patient_id) {
    throw new AppError('معرف المريض مطلوب', 400);
  }

  const result = await db.run(`
    INSERT INTO medical_records (patient_id, doctor_id, symptoms, diagnosis, treatment)
    VALUES (?, ?, ?, ?, ?)
  `, [patient_id, req.user.id, symptoms, diagnosis, treatment]);

  await logActivity(req.user.id, 'إضافة سجل طبي', `Patient ID: ${patient_id}`);
  emitRealTimeUpdate('medical_record_created', { id: result.lastID, patient_id });

  res.json({ success: true, id: result.lastID });
}));

// ====================================
// Lab Tests Routes
// ====================================

// Get all lab tests
app.get('/api/lab-tests', authenticateToken, asyncHandler(async (req, res) => {
  const tests = await db.all(`
    SELECT lt.*, p.name as patient_name, u.name as doctor_name
    FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.id
    LEFT JOIN users u ON lt.doctor_id = u.id
    ORDER BY lt.created_at DESC
  `);
  res.json(tests);
}));

// Get pending lab tests
app.get('/api/lab-tests/pending', authenticateToken, asyncHandler(async (req, res) => {
  const tests = await db.all(`
    SELECT lt.*, p.name as patient_name, u.name as doctor_name
    FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.id
    LEFT JOIN users u ON lt.doctor_id = u.id
    WHERE lt.status = 'pending'
    ORDER BY lt.created_at ASC
  `);
  res.json(tests);
}));

// Create lab test
app.post('/api/lab-tests', authenticateToken, asyncHandler(async (req, res) => {
  const { patient_id, test_names, notes } = req.body;

  if (!patient_id || !test_names) {
    throw new AppError('معلومات الفحص غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO lab_tests (patient_id, doctor_id, test_names, notes)
    VALUES (?, ?, ?, ?)
  `, [patient_id, req.user.id, test_names, notes]);

  // Update test statistics
  const testArray = test_names.split(',').map(t => t.trim());
  for (const test of testArray) {
    const existing = await db.get('SELECT count FROM test_statistics WHERE test_name = ?', [test]);
    if (existing) {
      await db.run('UPDATE test_statistics SET count = count + 1 WHERE test_name = ?', [test]);
    } else {
      await db.run('INSERT INTO test_statistics (test_name, count) VALUES (?, 1)', [test]);
    }
  }

  await logActivity(req.user.id, 'طلب فحص مختبري', `Patient ID: ${patient_id}`);
  emitRealTimeUpdate('lab_test_created', { id: result.lastID, patient_id, status: 'pending' });

  res.json({ success: true, id: result.lastID });
}));

// Update lab test
app.put('/api/lab-tests/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { results, status, notes } = req.body;

  await db.run(`
    UPDATE lab_tests 
    SET results = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [results, status, notes, req.params.id]);

  await logActivity(req.user.id, 'تحديث نتيجة فحص', `ID: ${req.params.id}`);
  emitRealTimeUpdate('lab_test_updated', { id: req.params.id, status });

  res.json({ success: true });
}));

// Get test statistics
app.get('/api/test-statistics', authenticateToken, asyncHandler(async (req, res) => {
  const stats = await db.all(`
    SELECT test_name, count 
    FROM test_statistics 
    ORDER BY count DESC 
    LIMIT 20
  `);
  res.json(stats);
}));

// ====================================
// Prescription Routes
// ====================================

// Get all prescriptions
app.get('/api/prescriptions', authenticateToken, asyncHandler(async (req, res) => {
  const prescriptions = await db.all(`
    SELECT pr.*, p.name as patient_name, u.name as doctor_name
    FROM prescriptions pr
    JOIN patients p ON pr.patient_id = p.id
    LEFT JOIN users u ON pr.doctor_id = u.id
    ORDER BY pr.created_at DESC
  `);
  res.json(prescriptions);
}));

// Get active prescriptions
app.get('/api/prescriptions/active', authenticateToken, asyncHandler(async (req, res) => {
  const prescriptions = await db.all(`
    SELECT pr.*, p.name as patient_name
    FROM prescriptions pr
    JOIN patients p ON pr.patient_id = p.id
    WHERE pr.status = 'active' AND pr.dispensed = 0
    ORDER BY pr.created_at ASC
  `);
  res.json(prescriptions);
}));

// Create prescription
app.post('/api/prescriptions', authenticateToken, asyncHandler(async (req, res) => {
  const { patient_id, medicine_name, dosage, frequency, duration, timing, notes } = req.body;

  if (!patient_id || !medicine_name || !dosage || !frequency || !duration || !timing) {
    throw new AppError('معلومات الوصفة غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO prescriptions (patient_id, doctor_id, medicine_name, dosage, frequency, duration, timing, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [patient_id, req.user.id, medicine_name, dosage, frequency, duration, timing, notes]);

  await logActivity(req.user.id, 'وصفة طبية جديدة', `Medicine: ${medicine_name}`);
  emitRealTimeUpdate('prescription_created', { id: result.lastID, patient_id, medicine_name });

  res.json({ success: true, id: result.lastID });
}));

// Update prescription (dispense)
app.put('/api/prescriptions/:id/dispense', authenticateToken, authorizeRoles('pharmacy', 'admin'), asyncHandler(async (req, res) => {
  await db.run(`
    UPDATE prescriptions 
    SET dispensed = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [req.params.id]);

  await logActivity(req.user.id, 'صرف دواء', `Prescription ID: ${req.params.id}`);
  emitRealTimeUpdate('prescription_dispensed', { id: req.params.id });

  res.json({ success: true });
}));

// ====================================
// Inventory Routes
// ====================================

// Get all inventory
app.get('/api/inventory', authenticateToken, asyncHandler(async (req, res) => {
  const inventory = await db.all(`
    SELECT * FROM inventory 
    ORDER BY medicine_name ASC
  `);
  res.json(inventory);
}));

// Get low stock items
app.get('/api/inventory/low-stock', authenticateToken, asyncHandler(async (req, res) => {
  const lowStock = await db.all(`
    SELECT * FROM inventory 
    WHERE quantity <= alert_threshold
    ORDER BY quantity ASC
  `);
  res.json(lowStock);
}));

// Add inventory item
app.post('/api/inventory', authenticateToken, authorizeRoles('pharmacy', 'admin'), asyncHandler(async (req, res) => {
  const { medicine_name, quantity, expiry_date, price, barcode, alert_threshold } = req.body;

  if (!medicine_name || !quantity || !expiry_date) {
    throw new AppError('معلومات الدواء غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO inventory (medicine_name, quantity, expiry_date, price, barcode, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [medicine_name, quantity, expiry_date, price, barcode, alert_threshold || 10]);

  await logActivity(req.user.id, 'إضافة دواء للمخزن', `Medicine: ${medicine_name}`);
  emitRealTimeUpdate('inventory_added', { id: result.lastID, medicine_name });

  res.json({ success: true, id: result.lastID });
}));

// Update inventory
app.put('/api/inventory/:id', authenticateToken, authorizeRoles('pharmacy', 'admin'), asyncHandler(async (req, res) => {
  const { quantity, expiry_date, price, alert_threshold } = req.body;

  await db.run(`
    UPDATE inventory 
    SET quantity = ?, expiry_date = ?, price = ?, alert_threshold = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [quantity, expiry_date, price, alert_threshold, req.params.id]);

  await logActivity(req.user.id, 'تحديث مخزن', `ID: ${req.params.id}`);
  emitRealTimeUpdate('inventory_updated', { id: req.params.id });

  res.json({ success: true });
}));

// Delete inventory item
app.delete('/api/inventory/:id', authenticateToken, authorizeRoles('pharmacy', 'admin'), asyncHandler(async (req, res) => {
  await db.run('DELETE FROM inventory WHERE id = ?', [req.params.id]);

  await logActivity(req.user.id, 'حذف دواء من المخزن', `ID: ${req.params.id}`);
  emitRealTimeUpdate('inventory_deleted', { id: req.params.id });

  res.json({ success: true });
}));

// ====================================
// Drug Interactions Routes
// ====================================

// Get all drug interactions
app.get('/api/drug-interactions', authenticateToken, asyncHandler(async (req, res) => {
  const interactions = await db.all('SELECT * FROM drug_interactions ORDER BY severity DESC');
  res.json(interactions);
}));

// Check drug interactions
app.post('/api/drug-interactions/check', authenticateToken, asyncHandler(async (req, res) => {
  const { drugs } = req.body;

  if (!drugs || drugs.length < 2) {
    return res.json({ interactions: [] });
  }

  const interactions = [];
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const interaction = await db.get(`
        SELECT * FROM drug_interactions 
        WHERE (drug1 = ? AND drug2 = ?) OR (drug1 = ? AND drug2 = ?)
      `, [drugs[i], drugs[j], drugs[j], drugs[i]]);
      
      if (interaction) {
        interactions.push(interaction);
      }
    }
  }

  res.json({ interactions });
}));

// Add drug interaction
app.post('/api/drug-interactions', authenticateToken, authorizeRoles('doctor', 'pharmacy', 'admin'), asyncHandler(async (req, res) => {
  const { drug1, drug2, severity, description, alternatives } = req.body;

  if (!drug1 || !drug2 || !severity) {
    throw new AppError('معلومات التفاعل الدوائي غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO drug_interactions (drug1, drug2, severity, description, alternatives)
    VALUES (?, ?, ?, ?, ?)
  `, [drug1, drug2, severity, description, alternatives]);

  await logActivity(req.user.id, 'إضافة تفاعل دوائي', `${drug1} - ${drug2}`);

  res.json({ success: true, id: result.lastID });
}));

// ====================================
// Nursing Orders Routes
// ====================================

// Get all nursing orders
app.get('/api/nursing-orders', authenticateToken, asyncHandler(async (req, res) => {
  const orders = await db.all(`
    SELECT no.*, p.name as patient_name, u.name as doctor_name
    FROM nursing_orders no
    JOIN patients p ON no.patient_id = p.id
    LEFT JOIN users u ON no.doctor_id = u.id
    ORDER BY no.created_at DESC
  `);
  res.json(orders);
}));

// Get pending nursing orders
app.get('/api/nursing-orders/pending', authenticateToken, asyncHandler(async (req, res) => {
  const orders = await db.all(`
    SELECT no.*, p.name as patient_name
    FROM nursing_orders no
    JOIN patients p ON no.patient_id = p.id
    WHERE no.status = 'pending'
    ORDER BY no.created_at ASC
  `);
  res.json(orders);
}));

// Create nursing order
app.post('/api/nursing-orders', authenticateToken, authorizeRoles('doctor', 'admin'), asyncHandler(async (req, res) => {
  const { patient_id, medicine_name, injection_type, dosage, frequency, duration, notes } = req.body;

  if (!patient_id || !medicine_name || !injection_type || !dosage || !frequency || !duration) {
    throw new AppError('معلومات أمر التمريض غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO nursing_orders (patient_id, doctor_id, medicine_name, injection_type, dosage, frequency, duration, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [patient_id, req.user.id, medicine_name, injection_type, dosage, frequency, duration, notes]);

  await logActivity(req.user.id, 'أمر تمريض جديد', `Medicine: ${medicine_name}`);
  emitRealTimeUpdate('nursing_order_created', { id: result.lastID, patient_id, status: 'pending' });

  res.json({ success: true, id: result.lastID });
}));

// Update nursing order
app.put('/api/nursing-orders/:id', authenticateToken, authorizeRoles('nurse', 'admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;

  await db.run('UPDATE nursing_orders SET status = ? WHERE id = ?', [status, req.params.id]);

  await logActivity(req.user.id, 'تحديث أمر تمريض', `ID: ${req.params.id}`);
  emitRealTimeUpdate('nursing_order_updated', { id: req.params.id, status });

  res.json({ success: true });
}));

// ====================================
// Ultrasound Orders Routes
// ====================================

// Get all ultrasound orders
app.get('/api/ultrasound-orders', authenticateToken, asyncHandler(async (req, res) => {
  const orders = await db.all(`
    SELECT uo.*, p.name as patient_name, u.name as doctor_name
    FROM ultrasound_orders uo
    JOIN patients p ON uo.patient_id = p.id
    LEFT JOIN users u ON uo.doctor_id = u.id
    ORDER BY uo.created_at DESC
  `);
  res.json(orders);
}));

// Get pending ultrasound orders
app.get('/api/ultrasound-orders/pending', authenticateToken, asyncHandler(async (req, res) => {
  const orders = await db.all(`
    SELECT uo.*, p.name as patient_name
    FROM ultrasound_orders uo
    JOIN patients p ON uo.patient_id = p.id
    WHERE uo.status = 'pending'
    ORDER BY uo.created_at ASC
  `);
  res.json(orders);
}));

// Create ultrasound order
app.post('/api/ultrasound-orders', authenticateToken, asyncHandler(async (req, res) => {
  const { patient_id, scan_type, notes } = req.body;

  if (!patient_id || !scan_type) {
    throw new AppError('معلومات طلب الموجات غير كاملة', 400);
  }

  const result = await db.run(`
    INSERT INTO ultrasound_orders (patient_id, doctor_id, scan_type, notes)
    VALUES (?, ?, ?, ?)
  `, [patient_id, req.user.id, scan_type, notes]);

  await logActivity(req.user.id, 'طلب موجات صوتية', `Scan: ${scan_type}`);
  emitRealTimeUpdate('ultrasound_order_created', { id: result.lastID, patient_id, status: 'pending' });

  res.json({ success: true, id: result.lastID });
}));

// Update ultrasound order
app.put('/api/ultrasound-orders/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { status, report, images } = req.body;

  await db.run(`
    UPDATE ultrasound_orders 
    SET status = ?, report = ?, images = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [status, report || '', images || '', req.params.id]);

  await logActivity(req.user.id, 'تحديث طلب موجات', `ID: ${req.params.id}`);
  emitRealTimeUpdate('ultrasound_order_updated', { id: req.params.id, status });

  res.json({ success: true });
}));

// Upload ultrasound image
app.post('/api/ultrasound-orders/:id/upload', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('لم يتم رفع ملف', 400);
  }

  const filename = req.file.filename;
  const order = await db.get('SELECT images FROM ultrasound_orders WHERE id = ?', [req.params.id]);
  
  let images = order.images ? order.images.split(',') : [];
  images.push(filename);
  
  await db.run('UPDATE ultrasound_orders SET images = ? WHERE id = ?', [images.join(','), req.params.id]);

  await logActivity(req.user.id, 'رفع صورة موجات', `ID: ${req.params.id}`);
  emitRealTimeUpdate('ultrasound_image_uploaded', { id: req.params.id, filename });

  res.json({ success: true, filename });
}));

// ====================================
// Admin Notes Routes
// ====================================

// Get all admin notes
app.get('/api/admin-notes', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const notes = await db.all(`
    SELECT an.*, u.name as from_user_name
    FROM admin_notes an
    JOIN users u ON an.from_user_id = u.id
    ORDER BY an.created_at DESC
  `);
  res.json(notes);
}));

// Create admin note
app.post('/api/admin-notes', authenticateToken, asyncHandler(async (req, res) => {
  const { message, priority } = req.body;

  if (!message) {
    throw new AppError('الرسالة مطلوبة', 400);
  }

  const result = await db.run(`
    INSERT INTO admin_notes (from_user_id, from_user_role, message, priority)
    VALUES (?, ?, ?, ?)
  `, [req.user.id, req.user.role, message, priority || 'normal']);

  emitRealTimeUpdate('admin_note_added', { id: result.lastID, priority: priority || 'normal' });

  res.json({ success: true, id: result.lastID });
}));

// Mark note as read
app.put('/api/admin-notes/:id', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  await db.run('UPDATE admin_notes SET status = ? WHERE id = ?', ['read', req.params.id]);
  
  res.json({ success: true });
}));

// ====================================
// Statistics Route
// ====================================
app.get('/api/statistics', authenticateToken, asyncHandler(async (req, res) => {
  const totalPatients = (await db.get('SELECT COUNT(*) as count FROM patients')).count;
  const totalTests = (await db.get('SELECT COUNT(*) as count FROM lab_tests')).count;
  const pendingTests = (await db.get("SELECT COUNT(*) as count FROM lab_tests WHERE status = 'pending'")).count;
  const activePrescriptions = (await db.get("SELECT COUNT(*) as count FROM prescriptions WHERE status = 'active'")).count;
  const totalUsers = (await db.get('SELECT COUNT(*) as count FROM users WHERE active = 1')).count;
  const totalAppointments = (await db.get('SELECT COUNT(*) as count FROM appointments')).count;
  const totalPayments = (await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM payments')).total;
  
  const ageGroups = await db.all(`
    SELECT 
      CASE 
        WHEN age < 13 THEN 'أطفال (0-12)'
        WHEN age BETWEEN 13 AND 60 THEN 'بالغون (13-60)'
        ELSE 'كبار السن (60+)'
      END as age_group,
      COUNT(*) as count
    FROM patients
    GROUP BY age_group
  `);

  const topDiseases = await db.all(`
    SELECT diagnosis, COUNT(*) as count
    FROM medical_records
    WHERE diagnosis IS NOT NULL AND diagnosis != ''
    GROUP BY diagnosis
    ORDER BY count DESC
    LIMIT 10
  `);

  res.json({
    totalPatients,
    totalTests,
    pendingTests,
    activePrescriptions,
    totalUsers,
    totalAppointments,
    totalPayments,
    ageGroups,
    topDiseases
  });
}));

// ====================================
// Activity Log Route
// ====================================
app.get('/api/activity-log', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const logs = await db.all(`
    SELECT al.*, u.name as user_name, u.role as user_role
    FROM activity_log al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 100
  `);
  
  res.json(logs);
}));

// ====================================
// Health Check Route
// ====================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '3.1.0'
  });
});

// ====================================
// WebSocket Events
// ====================================
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  // Notify all clients about new connection
  socket.broadcast.emit('user_connected', { 
    socketId: socket.id, 
    timestamp: new Date() 
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    socket.broadcast.emit('user_disconnected', { 
      socketId: socket.id, 
      timestamp: new Date() 
    });
  });

  // Custom events for real-time collaboration
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('user_stop_typing', data);
  });
});

// ====================================
// Main Route
// ====================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ====================================
// 404 Handler
// ====================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ====================================
// Global Error Handler
// ====================================
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);

  // Operational errors (expected)
  if (error.isOperational) {
    return res.status(error.statusCode).json({ 
      error: error.message 
    });
  }

  // Database errors
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'خطأ في قاعدة البيانات: قيمة مكررة أو قيد غير صالح' 
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'رمز التحقق غير صالح' 
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى' 
    });
  }

  // Multer errors
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ 
      error: `خطأ في رفع الملف: ${error.message}` 
    });
  }

  // Programming errors (unexpected)
  res.status(500).json({ 
    error: 'حدث خطأ في الخادم',
    message: NODE_ENV === 'development' ? error.message : undefined,
    stack: NODE_ENV === 'development' ? error.stack : undefined
  });
});

// ====================================
// Initialize and Start Server
// ====================================
async function startServer() {
  try {
    // Initialize database
    await initDatabase();

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(70));
      console.log('🏥 NICOTINE Clinic Management System v3.1');
      console.log('='.repeat(70));
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🗄️  Database: ${dbPath}`);
      console.log(`\n🌐 Access URLs:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://0.0.0.0:${PORT}`);
      console.log('\n👥 Default Users:');
      console.log('   Admin:      admin / admin123');
      console.log('   Doctor:     doctor / 123');
      console.log('   Reception:  reception / 123');
      console.log('   Lab:        lab / 123');
      console.log('   Pharmacy:   pharmacy / 123');
      console.log('   Nurse:      nurse / 123');
      console.log('   Ultrasound: ultrasound / 123');
      console.log('\n✅ Real-time updates: ENABLED');
      console.log('✅ Async/await: ENABLED');
      console.log('✅ Error handling: CENTRALIZED');
      console.log('\n⚠️  Change default passwords immediately!');
      console.log('='.repeat(70) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ====================================
// Graceful Shutdown
// ====================================
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  server.close(async () => {
    console.log('Server closed');
    
    try {
      await db.close();
      console.log('Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error closing database:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();
