const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // 1. محاولة جلب التوكن من الـ Header
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // 2. إذا لم يجد Header، يحاول جلب التوكن من الـ Cookies كملاذ آمن
  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ status: 'error', error: 'Access denied. No token provided.' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'your_super_secret_key'; 
    const decoded = jwt.verify(token, secretKey);
    
    // إضافة بيانات المستخدم للـ request
    req.user = decoded; 
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(403).json({ status: 'error', error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
