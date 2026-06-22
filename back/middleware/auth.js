const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format is "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', error: 'Access denied. No token provided.' });
  }

  try {
    // Secret key should be in your .env file
    const secretKey = process.env.JWT_SECRET || 'your_super_secret_key'; 
    const decoded = jwt.verify(token, secretKey);
    
    // Add user payload to request
    // This ensures req.user.id and req.user.role are available in controllers
    req.user = decoded; 
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(403).json({ status: 'error', error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;