const express = require('express');
const router = express.Router();
const { getAll } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM request_type ORDER BY id ASC');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching request_type:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
