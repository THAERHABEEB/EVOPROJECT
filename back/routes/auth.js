const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getOne, runQuery } = require('../config/db.js');

// POST /api/auth/login - Login User (Plain Text & ID based)
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body; // استقبال id ليتوافق مع الفرونت إند

    if (!id || !password) {
      return res.status(400).json({ status: 'error', error: 'Missing fields' });
    }

    // البحث في قاعدة البيانات باستخدام الـ id
    const user = await getOne('SELECT * FROM "USER" WHERE id = $1', [id]);
    if (!user) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // مقارنة نصية مباشرة لـ Password بدون تشفير (Plain Text)
    if (String(password) !== String(user.password)) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const secretKey = process.env.JWT_SECRET || 'your_super_secret_key';
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      secretKey, 
      { expiresIn: '7d' }
    );

    let needsSpecialization = false;
    if (user.role === 'student' && !user.specialization) {
      needsSpecialization = true;
    }

    // Set Cookies لضمان عمل الـ Middleware
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.cookie('userRole', user.role, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('hasSpecialization', !needsSpecialization, { maxAge: 7 * 24 * 60 * 60 * 1000 });

    await runQuery('UPDATE "USER" SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({ 
      status: 'success', 
      data: { id: user.id, name: user.name, role: user.role, needsSpecialization }, 
      token 
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

module.exports = router;
