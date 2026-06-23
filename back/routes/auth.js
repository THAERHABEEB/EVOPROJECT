const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getOne } = require('../config/db.js');

router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ status: 'error', error: 'Missing fields', data: null });
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(401).json({ status: 'error', error: 'Invalid ID format', data: null });
    }

    const user = await getOne('SELECT * FROM "USER" WHERE id = $1', [userId]);
    if (!user) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials', data: null });
    }

    // مقارنة نصوص صريحة ونظيفة بدون مسافات مخفية
    if (String(password).trim() !== String(user.password).trim()) {
      return res.status(401).json({ status: 'error', error: 'Invalid credentials', data: null });
    }

    const secretKey = process.env.JWT_SECRET || 'your_super_secret_key';
    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '7d' });

    let needsSpecialization = false;
    if (user.role === 'student' && !user.specialization) {
      needsSpecialization = true;
    }

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.cookie('userRole', user.role, { maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.json({ 
      status: 'success', 
      data: { id: user.id, name: user.name, role: user.role, needsSpecialization }, 
      token 
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ status: 'error', error: 'Server error', data: null });
  }
});

module.exports = router;
