const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getOne, runQuery } = require('../config/db.js');

// POST /api/auth/login - Login User
// POST /api/auth/login - Login User
router.post('/login', async (req, res) => {
  try {
    // 1. استقبال الـ id وليس name ليتوافق مع الفرونت إند
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ status: 'error', error: 'Missing fields' });
    }

    // 2. البحث في قاعدة البيانات باستخدام الـ id (وتحويله لرقم إذا كان العمود نوعه Integer)
    const user = await getOne('SELECT * FROM "USER" WHERE id = $1', [id]);
    if (!user) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // 3. فحص الباسورد العادي ومقارنته بالهاش المشفر في قاعدة البيانات
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // 4. Generate JWT Token
    const secretKey = process.env.JWT_SECRET || 'your_super_secret_key';
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      secretKey, 
      { expiresIn: '7d' }
    );

    // 5. WORKFLOW 3 LOGIC: Check if student needs specialization selection
    let needsSpecialization = false;
    if (user.role === 'student' && !user.specialization) {
      needsSpecialization = true;
    }

    // 6. Set Cookies for Frontend Middleware
    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });
    
    res.cookie('userRole', user.role, { 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.cookie('hasSpecialization', !needsSpecialization, { 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    // Update last login time
    await runQuery('UPDATE "USER" SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({ 
      status: 'success', 
      data: { 
        id: user.id, 
        name: user.name, 
        role: user.role,
        needsSpecialization: needsSpecialization 
      }, 
      token 
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
});
// POST /api/auth/register - Create User (Optional, if you need registration)
router.post('/register', async (req, res) => {
  try {
    const { name, password, role } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ status: 'error', error: 'Missing fields' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert User
    const result = await runQuery(
      'INSERT INTO "USER" (name, password, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [name, hashedPassword, role]
    );

    res.status(201).json({ status: 'success', data: result.rows[0] });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('userRole');
  res.clearCookie('hasSpecialization');
  res.json({ status: 'success', message: 'Logged out' });
});

module.exports = router;
