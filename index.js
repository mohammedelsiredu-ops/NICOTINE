/*
 * ========================================
 * NICOTINE Clinic Management System v3.0
 * Server - Production Ready
 * ========================================
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const Database = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const multer = require('multer');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose(); 
const db = new sqlite3.Database(dbPath);
// ====================================
// Environment Configuration
// ====================================
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'nicotine-clinic-2026-secret-key-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ====================================
// Express App Setup
// ====================================
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { 
    origin: process.env.CORS_ORIGIN || "*", 
    methods: ["GET", "POST", "PUT", "DELETE"] 
  }
});

// ====================================
// Middleware
// ====================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ====================================
// Database Setup
// ====================================
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/nicotine.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);
db.pragma('journal_mode = WAL');

// ====================================
// Database Initialization
// ====================================
function initDatabase() {
  console.log('🔧 Initializing database...');

  // Users Table
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_statistics (
      test_name TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    )
  `);

  // Prescriptions Table
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS ultrasound_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER,
      scan_type TEXT NOT NULL,
      report TEXT,
      images TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id)
    )
  `);

  // Admin Notes Table
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Database tables created successfully');

  // Create default users
  createDefaultUsers();
  
  // Create default drug interactions
  createDrugInteractions();
}

// ====================================
// Create Default Users
// ====================================
function createDefaultUsers() {
  const defaultUsers = [
    { name: 'مدير النظام', username: 'admin', password: 'admin123', role: 'admin', shift: 'مرن', phone: '' },
    { name: 'طبيب', username: 'doctor', password: '123', role: 'doctor', shift: 'صباحي (8ص-3م)', phone: '' },
    { name: 'استقبال', username: 'reception', password: '123', role: 'reception', shift: 'صباحي (8ص-3م)', phone: '' },
    { name: 'معمل', username: 'lab', password: '123', role: 'lab', shift: 'صباحي (8ص-3م)', phone: '' },
    { name: 'صيدلية', username: 'pharmacy', password: '123', role: 'pharmacy', shift: 'صباحي (8ص-3م)', phone: '' },
    { name: 'تمريض', username: 'nurse', password: '123', role: 'nurse', shift: 'صباحي (8ص-3م)', phone: '' },
    { name: 'موجات صوتية', username: 'ultrasound', password: '123', role: 'ultrasound', shift: 'صباحي (8ص-3م)', phone: '' }
  ];

  const checkUser = db.prepare('SELECT username FROM users WHERE username = ?');
  const insertUser = db.prepare('INSERT INTO users (name, username, password, role, shift, phone) VALUES (?, ?, ?, ?, ?, ?)');

  defaultUsers.forEach(user => {
    const exists = checkUser.get(user.username);
    if (!exists) {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      insertUser.run(user.name, user.username, hashedPassword, user.role, user.shift, user.phone);
      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }
  });
}

// ====================================
// Create Drug Interactions
// ====================================
function createDrugInteractions() {
  const interactions = [
    ['Warfarin', 'Aspirin', 'high', 'زيادة خطر النزيف بشكل كبير', 'استشر الطبيب فوراً'],
    ['Warfarin', 'Paracetamol', 'moderate', 'قد يزيد تأثير الوارفارين', 'مراقبة INR'],
    ['Metformin', 'Alcohol', 'moderate', 'قد يسبب حماض لبني', 'تجنب الكحول'],
    ['ACE Inhibitors', 'Potassium', 'high', 'فرط بوتاسيوم الدم', 'تجنب مكملات البوتاسيوم']
  ];

  const checkInt = db.prepare('SELECT * FROM drug_interactions WHERE drug1 = ? AND drug2 = ?');
  const insertInt = db.prepare('INSERT INTO drug_interactions (drug1, drug2, severity, description, alternatives) VALUES (?, ?, ?, ?, ?)');
  
  interactions.forEach(([d1, d2, sev, desc, alt]) => {
    if (!checkInt.get(d1, d2)) {
      insertInt.run(d1, d2, sev, desc, alt);
    }
  });

  console.log('✅ Drug interactions initialized');
}

// ====================================
// Authentication Middleware
// ====================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ====================================
// Activity Logging
// ====================================
function logActivity(userId, action, details = null) {
  try {
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      userId, 
      action, 
      details ? JSON.stringify(details) : null
    );
  } catch (error) {
    console.error('Activity log error:', error);
  }
}

// ====================================
// Authentication Routes
// ====================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);

    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم غير صحيح' });
    }

    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(401).json({ error: 'الدور غير صحيح' });
    }

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    logActivity(user.id, 'تسجيل دخول', `الدور: ${user.role}`);

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

// ====================================
// Users Routes
// ====================================
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, username, role, shift, phone, active, created_at FROM users ORDER BY created_at DESC').callback;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المستخدمين' });
  }
});

app.post('/api/users', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'صلاحية المدير فقط' });
    }

    const { name, username, password, role, shift, phone } = req.body;
    
    const exists = db.prepare('SELECT username FROM users WHERE username = ?').get(username);
    if (exists) {
      return res.status(400).json({ error: 'اسم المستخدم موجود مسبقاً' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, username, password, role, shift, phone) VALUES (?, ?, ?, ?, ?, ?)').run(
      name, username, hashedPassword, role, shift, phone || ''
    );

    logActivity(req.user.id, 'إضافة مستخدم', `المستخدم: ${username}`);
    io.emit('user_added', { id: result.lastInsertRowid, name, username, role, shift });

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: 'خطأ في إضافة المستخدم' });
  }
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  try {
    const { name, shift, phone } = req.body;
    db.prepare('UPDATE users SET name = ?, shift = ?, phone = ? WHERE id = ?').run(name, shift, phone || '', req.params.id);
    
    logActivity(req.user.id, 'تحديث مستخدم', `ID: ${req.params.id}`);
    io.emit('user_updated', { id: parseInt(req.params.id), name, shift, phone });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المستخدم' });
  }
});

app.put('/api/users/:id/toggle-active', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'صلاحية المدير فقط' });
    }

    if (parseInt(req.params.id) === 1) {
      return res.status(400).json({ error: 'لا يمكن حظر مستخدم Admin الرئيسي' });
    }
    
    const user = db.prepare('SELECT active FROM users WHERE id = ?').get(req.params.id);
    const newActive = user.active === 1 ? 0 : 1;
    
    db.prepare('UPDATE users SET active = ? WHERE id = ?').run(newActive, req.params.id);
    
    logActivity(req.user.id, newActive === 1 ? 'تفعيل مستخدم' : 'حظر مستخدم', `ID: ${req.params.id}`);
    io.emit('user_updated', { id: parseInt(req.params.id), active: newActive });
    
    res.json({ success: true, active: newActive });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المستخدم' });
  }
});

app.put('/api/users/:id/change-password', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    const { newPassword } = req.body;
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.params.id);

    logActivity(req.user.id, 'تغيير كلمة مرور', `ID: ${req.params.id}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تغيير كلمة المرور' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'صلاحية المدير فقط' });
    }

    if (parseInt(req.params.id) === 1) {
      return res.status(400).json({ error: 'لا يمكن حذف مستخدم Admin الرئيسي' });
    }
    
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    
    logActivity(req.user.id, 'حذف مستخدم', `ID: ${req.params.id}`);
    io.emit('user_deleted', { id: parseInt(req.params.id) });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف المستخدم' });
  }
});

// ====================================
// Patients Routes
// ====================================
app.get('/api/patients', authenticateToken, (req, res) => {
  try {
    const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').callback;
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المرضى' });
  }
});

app.get('/api/patients/:id', authenticateToken, (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'المريض غير موجود' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المريض' });
  }
});

app.post('/api/patients', authenticateToken, (req, res) => {
  try {
    const { name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries } = req.body;

    const result = db.prepare(`
      INSERT INTO patients (name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, phone, age, gender, blood_type || '', national_id || '', address || '', allergies || '', chronic_diseases || '', previous_surgeries || '');

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'إضافة مريض', `اسم المريض: ${name}`);
    io.emit('patient_added', patient);
    
    res.json({ success: true, patient });
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json({ error: 'خطأ في إضافة المريض' });
  }
});

app.put('/api/patients/:id', authenticateToken, (req, res) => {
  try {
    const { name, phone, age, gender, blood_type, national_id, address, allergies, chronic_diseases, previous_surgeries } = req.body;

    db.prepare(`
      UPDATE patients 
      SET name = ?, phone = ?, age = ?, gender = ?, blood_type = ?, national_id = ?, 
          address = ?, allergies = ?, chronic_diseases = ?, previous_surgeries = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, phone, age, gender, blood_type || '', national_id || '', address || '', allergies || '', chronic_diseases || '', previous_surgeries || '', req.params.id);

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    
    logActivity(req.user.id, 'تحديث مريض', `ID: ${req.params.id}`);
    io.emit('patient_updated', patient);
    
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المريض' });
  }
});

// ====================================
// Appointments Routes
// ====================================
app.get('/api/appointments', authenticateToken, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone, u.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).callback;
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المواعيد' });
  }
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(patient_id, doctor_id, appointment_date, appointment_time, notes || '');

    const appointment = db.prepare(`
      SELECT a.*, p.name as patient_name, u.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'إضافة موعد', `مريض: ${appointment.patient_name}`);
    io.emit('appointment_added', appointment);
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الموعد' });
  }
});

app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  try {
    const { status, notes, appointment_date, appointment_time } = req.body;
    
    db.prepare(`
      UPDATE appointments 
      SET status = ?, notes = ?, appointment_date = COALESCE(?, appointment_date), appointment_time = COALESCE(?, appointment_time)
      WHERE id = ?
    `).run(status, notes || '', appointment_date, appointment_time, req.params.id);
    
    const appointment = db.prepare(`
      SELECT a.*, p.name as patient_name, u.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.id = ?
    `).get(req.params.id);
    
    logActivity(req.user.id, 'تحديث موعد', `ID: ${req.params.id}`);
    io.emit('appointment_updated', appointment);
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الموعد' });
  }
});

app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    
    logActivity(req.user.id, 'حذف موعد', `ID: ${req.params.id}`);
    io.emit('appointment_deleted', { id: parseInt(req.params.id) });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف الموعد' });
  }
});

// ====================================
// Payments Routes
// ====================================
app.get('/api/payments', authenticateToken, (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT pay.*, p.name as patient_name
      FROM payments pay
      JOIN patients p ON pay.patient_id = p.id
      ORDER BY pay.created_at DESC
    `).callback;
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المدفوعات' });
  }
});

app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { patient_id, amount, payment_method, notes } = req.body;
    let qr_code = null;

    if (payment_method === 'bankak') {
      const qrData = JSON.stringify({
        account: process.env.BANKAK_ACCOUNT || 'CLINIC_ACCOUNT',
        amount: amount,
        reference: `PAY-${Date.now()}`,
        description: `دفع مريض رقم ${patient_id}`
      });
      qr_code = await QRCode.toDataURL(qrData);
    }

    const result = db.prepare(`
      INSERT INTO payments (patient_id, amount, payment_method, qr_code, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(patient_id, amount, payment_method, qr_code, notes || '');

    const payment = db.prepare(`
      SELECT pay.*, p.name as patient_name
      FROM payments pay
      JOIN patients p ON pay.patient_id = p.id
      WHERE pay.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'إضافة دفع', `مبلغ: ${amount}`);
    io.emit('payment_added', payment);
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'خطأ في إضافة الدفع' });
  }
});

// ====================================
// Medical Records Routes
// ====================================
app.get('/api/patients/:id/medical-records', authenticateToken, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT mr.*, u.name as doctor_name 
      FROM medical_records mr
      LEFT JOIN users u ON mr.doctor_id = u.id
      WHERE mr.patient_id = ?
      ORDER BY mr.created_at DESC
    `).all(req.params.id);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب السجلات الطبية' });
  }
});

app.post('/api/patients/:id/medical-records', authenticateToken, (req, res) => {
  try {
    const { symptoms, diagnosis, treatment } = req.body;

    const result = db.prepare(`
      INSERT INTO medical_records (patient_id, doctor_id, symptoms, diagnosis, treatment)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, req.user.id, symptoms, diagnosis, treatment);

    const record = db.prepare(`
      SELECT mr.*, u.name as doctor_name 
      FROM medical_records mr
      LEFT JOIN users u ON mr.doctor_id = u.id
      WHERE mr.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'إضافة سجل طبي', `مريض ID: ${req.params.id}`);
    io.emit('medical_record_added', record);
    
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة السجل الطبي' });
  }
});

// ====================================
// Lab Tests Routes
// ====================================
app.get('/api/lab-tests', authenticateToken, (req, res) => {
  try {
    const tests = db.prepare(`
      SELECT lt.*, p.name as patient_name, u.name as doctor_name
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      LEFT JOIN users u ON lt.doctor_id = u.id
      ORDER BY lt.created_at DESC
    `).callback;
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التحاليل' });
  }
});

app.get('/api/patients/:id/lab-tests', authenticateToken, (req, res) => {
  try {
    const tests = db.prepare(`
      SELECT lt.*, u.name as doctor_name
      FROM lab_tests lt
      LEFT JOIN users u ON lt.doctor_id = u.id
      WHERE lt.patient_id = ?
      ORDER BY lt.created_at DESC
    `).all(req.params.id);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التحاليل' });
  }
});

app.post('/api/patients/:id/lab-tests', authenticateToken, (req, res) => {
  try {
    const { test_names, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO lab_tests (patient_id, doctor_id, test_names, notes)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, req.user.id, test_names, notes || '');

    // Update test statistics
    const tests = test_names.split(',');
    tests.forEach(test => {
      const testName = test.trim();
      const exists = db.prepare('SELECT test_name FROM test_statistics WHERE test_name = ?').get(testName);
      if (exists) {
        db.prepare('UPDATE test_statistics SET count = count + 1 WHERE test_name = ?').run(testName);
      } else {
        db.prepare('INSERT INTO test_statistics (test_name, count) VALUES (?, 1)').run(testName);
      }
    });

    const labTest = db.prepare(`
      SELECT lt.*, p.name as patient_name, u.name as doctor_name
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      LEFT JOIN users u ON lt.doctor_id = u.id
      WHERE lt.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'طلب تحاليل', `مريض ID: ${req.params.id}`);
    io.emit('lab_test_added', labTest);
    
    res.json({ success: true, test: labTest });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة التحليل' });
  }
});

app.put('/api/lab-tests/:id', authenticateToken, (req, res) => {
  try {
    const { status, results } = req.body;

    db.prepare(`
      UPDATE lab_tests 
      SET status = ?, results = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, results || '', req.params.id);

    const test = db.prepare(`
      SELECT lt.*, p.name as patient_name, u.name as doctor_name
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      LEFT JOIN users u ON lt.doctor_id = u.id
      WHERE lt.id = ?
    `).get(req.params.id);
    
    logActivity(req.user.id, 'تحديث نتائج تحليل', `ID: ${req.params.id}`);
    io.emit('lab_test_updated', test);
    
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث التحليل' });
  }
});

app.get('/api/test-statistics', authenticateToken, (req, res) => {
  try {
    const stats = db.prepare('SELECT * FROM test_statistics ORDER BY count DESC LIMIT 50').callback;
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// ====================================
// Prescriptions Routes
// ====================================
app.get('/api/prescriptions', authenticateToken, (req, res) => {
  try {
    const prescriptions = db.prepare(`
      SELECT pr.*, p.name as patient_name, u.name as doctor_name
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN users u ON pr.doctor_id = u.id
      ORDER BY pr.created_at DESC
    `).callback;
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الوصفات' });
  }
});

app.get('/api/patients/:id/prescriptions', authenticateToken, (req, res) => {
  try {
    const prescriptions = db.prepare(`
      SELECT pr.*, u.name as doctor_name
      FROM prescriptions pr
      LEFT JOIN users u ON pr.doctor_id = u.id
      WHERE pr.patient_id = ?
      ORDER BY pr.created_at DESC
    `).all(req.params.id);
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الوصفات' });
  }
});

app.post('/api/patients/:id/prescriptions', authenticateToken, (req, res) => {
  try {
    const { medicine_name, dosage, frequency, duration, timing, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO prescriptions (patient_id, doctor_id, medicine_name, dosage, frequency, duration, timing, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, req.user.id, medicine_name, dosage, frequency, duration, timing, notes || '');

    const prescription = db.prepare(`
      SELECT pr.*, p.name as patient_name, u.name as doctor_name
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN users u ON pr.doctor_id = u.id
      WHERE pr.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'كتابة وصفة', `دواء: ${medicine_name}`);
    io.emit('prescription_added', prescription);
    
    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الوصفة' });
  }
});

app.put('/api/prescriptions/:id', authenticateToken, (req, res) => {
  try {
    const { status, dispensed } = req.body;

    db.prepare(`
      UPDATE prescriptions 
      SET status = ?, dispensed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, dispensed || 0, req.params.id);

    const prescription = db.prepare(`
      SELECT pr.*, p.name as patient_name, u.name as doctor_name
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN users u ON pr.doctor_id = u.id
      WHERE pr.id = ?
    `).get(req.params.id);
    
    logActivity(req.user.id, 'تحديث وصفة', `ID: ${req.params.id}`);
    io.emit('prescription_updated', prescription);
    
    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الوصفة' });
  }
});

// ====================================
// Inventory Routes
// ====================================
app.get('/api/inventory', authenticateToken, (req, res) => {
  try {
    const inventory = db.prepare('SELECT * FROM inventory ORDER BY medicine_name').callback;
    
    const today = moment().format('YYYY-MM-DD');
    const alerts = inventory.filter(item => {
      const daysToExpiry = moment(item.expiry_date).diff(moment(today), 'days');
      return item.quantity <= item.alert_threshold || daysToExpiry <= 30;
    });
    
    res.json({ inventory, alerts });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المخزون' });
  }
});

app.post('/api/inventory', authenticateToken, (req, res) => {
  try {
    const { medicine_name, quantity, expiry_date, price, barcode, alert_threshold } = req.body;

    const result = db.prepare(`
      INSERT INTO inventory (medicine_name, quantity, expiry_date, price, barcode, alert_threshold)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(medicine_name, quantity, expiry_date, price || 0, barcode || '', alert_threshold || 10);

    logActivity(req.user.id, 'إضافة دواء للمخزون', medicine_name);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الدواء' });
  }
});

app.put('/api/inventory/:id', authenticateToken, (req, res) => {
  try {
    const { quantity, expiry_date, price, alert_threshold } = req.body;

    db.prepare(`
      UPDATE inventory 
      SET quantity = ?, expiry_date = ?, price = ?, alert_threshold = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(quantity, expiry_date, price || 0, alert_threshold || 10, req.params.id);

    logActivity(req.user.id, 'تحديث مخزون', `ID: ${req.params.id}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المخزون' });
  }
});

// ====================================
// Drug Interactions Check
// ====================================
app.get('/api/drug-interactions/check', authenticateToken, (req, res) => {
  try {
    const { drugs } = req.query;
    if (!drugs) {
      return res.json([]);
    }

    const drugList = drugs.split(',').map(d => d.trim());
    const interactions = [];
    
    for (let i = 0; i < drugList.length; i++) {
      for (let j = i + 1; j < drugList.length; j++) {
        const int = db.prepare(`
          SELECT * FROM drug_interactions 
          WHERE (drug1 = ? AND drug2 = ?) OR (drug1 = ? AND drug2 = ?)
        `).get(drugList[i], drugList[j], drugList[j], drugList[i]);
        
        if (int) {
          interactions.push(int);
        }
      }
    }
    
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في فحص التداخلات' });
  }
});

// ====================================
// Nursing Orders Routes
// ====================================
app.get('/api/nursing-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT no.*, p.name as patient_name, u.name as doctor_name
      FROM nursing_orders no
      JOIN patients p ON no.patient_id = p.id
      LEFT JOIN users u ON no.doctor_id = u.id
      ORDER BY no.created_at DESC
    `).callback;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب طلبات التمريض' });
  }
});

app.post('/api/nursing-orders', authenticateToken, (req, res) => {
  try {
    const { patient_id, medicine_name, injection_type, dosage, frequency, duration, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO nursing_orders (patient_id, doctor_id, medicine_name, injection_type, dosage, frequency, duration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patient_id, req.user.id, medicine_name, injection_type, dosage, frequency, duration, notes || '');

    const order = db.prepare(`
      SELECT no.*, p.name as patient_name, u.name as doctor_name
      FROM nursing_orders no
      JOIN patients p ON no.patient_id = p.id
      LEFT JOIN users u ON no.doctor_id = u.id
      WHERE no.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'طلب حقنة', `${injection_type}, مريض ID: ${patient_id}`);
    io.emit('nursing_order_added', order);
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة طلب التمريض' });
  }
});

app.put('/api/nursing-orders/:id', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;

    db.prepare('UPDATE nursing_orders SET status = ? WHERE id = ?').run(status, req.params.id);
    
    logActivity(req.user.id, 'تحديث طلب تمريض', `ID: ${req.params.id}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث طلب التمريض' });
  }
});

// ====================================
// Ultrasound Orders Routes
// ====================================
app.get('/api/ultrasound-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT uo.*, p.name as patient_name, u.name as doctor_name
      FROM ultrasound_orders uo
      JOIN patients p ON uo.patient_id = p.id
      LEFT JOIN users u ON uo.doctor_id = u.id
      ORDER BY uo.created_at DESC
    `).callback;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب طلبات الموجات' });
  }
});

app.post('/api/ultrasound-orders', authenticateToken, (req, res) => {
  try {
    const { patient_id, scan_type, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO ultrasound_orders (patient_id, doctor_id, scan_type, report)
      VALUES (?, ?, ?, ?)
    `).run(patient_id, req.user.id, scan_type, notes || '');

    const order = db.prepare(`
      SELECT uo.*, p.name as patient_name, u.name as doctor_name
      FROM ultrasound_orders uo
      JOIN patients p ON uo.patient_id = p.id
      LEFT JOIN users u ON uo.doctor_id = u.id
      WHERE uo.id = ?
    `).get(result.lastInsertRowid);
    
    logActivity(req.user.id, 'طلب موجات صوتية', `${scan_type}, مريض ID: ${patient_id}`);
    io.emit('ultrasound_order_added', order);
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة طلب الموجات' });
  }
});

app.put('/api/ultrasound-orders/:id', authenticateToken, (req, res) => {
  try {
    const { status, report, images } = req.body;

    db.prepare(`
      UPDATE ultrasound_orders 
      SET status = ?, report = ?, images = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, report || '', images || '', req.params.id);

    logActivity(req.user.id, 'تحديث طلب موجات', `ID: ${req.params.id}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث طلب الموجات' });
  }
});

app.post('/api/ultrasound-orders/:id/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع ملف' });
    }

    const filename = req.file.filename;
    const order = db.prepare('SELECT images FROM ultrasound_orders WHERE id = ?').get(req.params.id);
    
    let images = order.images ? order.images.split(',') : [];
    images.push(filename);
    
    db.prepare('UPDATE ultrasound_orders SET images = ? WHERE id = ?').run(images.join(','), req.params.id);

    logActivity(req.user.id, 'رفع صورة موجات', `ID: ${req.params.id}`);
    
    res.json({ success: true, filename });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في رفع الملف' });
  }
});

// ====================================
// Admin Notes Routes
// ====================================
app.get('/api/admin-notes', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'صلاحية المدير فقط' });
    }

    const notes = db.prepare(`
      SELECT an.*, u.name as from_user_name
      FROM admin_notes an
      JOIN users u ON an.from_user_id = u.id
      ORDER BY an.created_at DESC
    `).callback;
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الملاحظات' });
  }
});

app.post('/api/admin-notes', authenticateToken, (req, res) => {
  try {
    const { message, priority } = req.body;

    const result = db.prepare(`
      INSERT INTO admin_notes (from_user_id, from_user_role, message, priority)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, req.user.role, message, priority || 'normal');

    io.emit('admin_note_added', { id: result.lastInsertRowid });
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إرسال الملاحظة' });
  }
});

app.put('/api/admin-notes/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'صلاحية المدير فقط' });
    }

    db.prepare('UPDATE admin_notes SET status = ? WHERE id = ?').run('read', req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الملاحظة' });
  }
});

// ====================================
// Statistics Route
// ====================================
app.get('/api/statistics', authenticateToken, (req, res) => {
  try {
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').callback.count;
    const totalTests = db.prepare('SELECT COUNT(*) as count FROM lab_tests').callback.count;
    const pendingTests = db.prepare("SELECT COUNT(*) as count FROM lab_tests WHERE status = 'pending'").callback.count;
    const activePrescriptions = db.prepare("SELECT COUNT(*) as count FROM prescriptions WHERE status = 'active'").callback.count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE active = 1').callback.count;
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').callback.count;
    const totalPayments = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments').callback.total;
    
    const ageGroups = db.prepare(`
      SELECT 
        CASE 
          WHEN age < 13 THEN 'أطفال (0-12)'
          WHEN age BETWEEN 13 AND 60 THEN 'بالغون (13-60)'
          ELSE 'كبار السن (60+)'
        END as age_group,
        COUNT(*) as count
      FROM patients
      GROUP BY age_group
    `).callback;

    const topDiseases = db.prepare(`
      SELECT diagnosis, COUNT(*) as count
      FROM medical_records
      WHERE diagnosis IS NOT NULL AND diagnosis != ''
      GROUP BY diagnosis
      ORDER BY count DESC
      LIMIT 10
    `).callback;

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
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// ====================================
// Activity Log Route
// ====================================
app.get('/api/activity-log', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'صلاحية المدير فقط' });
    }

    const logs = db.prepare(`
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `).callback;
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب سجل النشاطات' });
  }
});

// ====================================
// Health Check Route (for deployment monitoring)
// ====================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// ====================================
// WebSocket Events
// ====================================
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
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
  res.status(404).json({ error: 'Route not found' });
});

// ====================================
// Error Handler
// ====================================
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? error.message : undefined
  });
});

// ====================================
// Initialize Database
// ====================================
initDatabase();

// ====================================
// Start Server
// ====================================
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(70));
  console.log('🏥 NICOTINE Clinic Management System v3.0');
  console.log('='.repeat(70));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🗄️  Database: ${dbPath}`);
  console.log(`\n🌐 Access URLs:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://[YOUR-IP]:${PORT}`);
  console.log('\n👥 Default Users:');
  console.log('   Admin:      admin / admin123');
  console.log('   Doctor:     doctor / 123');
  console.log('   Reception:  reception / 123');
  console.log('   Lab:        lab / 123');
  console.log('   Pharmacy:   pharmacy / 123');
  console.log('   Nurse:      nurse / 123');
  console.log('   Ultrasound: ultrasound / 123');
  console.log('\n⚠️  Change default passwords immediately!');
  console.log('='.repeat(70) + '\n');
});

// ====================================
// Graceful Shutdown
// ====================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    db.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    db.close();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});
