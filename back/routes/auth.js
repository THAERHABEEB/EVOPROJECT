const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getOne, runQuery } = require('../config/db.js');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ status: 'error', error: 'Missing fields' });
    }

    // 1. تحويل الـ id إلى رقم (لأن قاعدة البيانات تحقنه كـ serial/integer)
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(401).json({ status: 'error', error: 'Invalid ID format' });
    }

    // 2. جلب المستخدم من قاعدة البيانات
    const user = await getOne('SELECT * FROM "USER" WHERE id = $1', [userId]);
    if (!user) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // 3. المقارنة الصارمة بعد تحويل القيمتين إلى نصوص عادية (Plain Text)
    const inputPassword = String(password).trim();
    const dbPassword = String(user.password).trim();

    if (inputPassword !== dbPassword) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials' });
    }

    // 4. إنشاء الـ Token إذا تطابقت البيانات
    const secretKey = process.env.JWT_SECRET || 'your_super_secret_key';
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      secretKey, 
      { expiresIn: '7d' }
    );

    // التحقق من التخصص (لوحة التحكم الطالب)
    let needsSpecialization = false;
    if (user.role === 'student' && !user.specialization) {
      needsSpecialization = true;
    }

    // إرسال الكوكيز للمتصفح
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.cookie('userRole', user.role, { maxAge: 7 * 24 * 60 * 60 * 1000 });

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
