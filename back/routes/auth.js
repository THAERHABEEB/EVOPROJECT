const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getOne, runQuery } = require('../config/db.js');

// POST /api/auth/login - Login User (Plain Text Password)
router.post('/login', async (req, res) => {
  try {
    // 1. استقبال الـ id والـ password من الفرونت إند
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ status: 'error', error: 'Missing fields' });
    }

    // 2. البحث في قاعدة البيانات باستخدام الـ id
    const user = await getOne('SELECT * FROM "USER" WHERE id = $1', [id]);
    if (!user) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // 3. مقارنة نصية مباشرة لـ Password بدون أي تشفير (Plain Text)
    // سيطابق الحسابات مثل ID: 2 و Password: 12300123 مباشرة
    if (String(password) !== String(user.password)) {
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

// POST /api/auth/register - Create User (يمكنك تركه أو تعديله لاحقاً)
router.post('/register', async (req, res) => {
  try {
    const { name, password, role } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ status: 'error', error: 'Missing fields' });
    }

    // إدخال مستخدم جديد بنص واضح ومباشر أيضاً تماشياً مع تعديل الـ login
    const result = await runQuery(
      'INSERT INTO "USER" (name, password, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [name, password, role]
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
