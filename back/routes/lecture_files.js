const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// Ensure uploads folder exists
const uploadsRoot = path.join(__dirname, '..', 'uploads', 'lectures');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsRoot);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// POST / - upload a lecture file (field name: file)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'error', error: 'No file uploaded' });
    const { lecture_id, uploaded_by, name } = req.body;
    const fileUrl = `/uploads/lectures/${req.file.filename}`; // served by server
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    const result = await runQuery('INSERT INTO "lecture_files" (lecture_id, name, url, file_type, file_size, uploaded_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *', [lecture_id || null, name || req.file.originalname, fileUrl, fileType, fileSize, uploaded_by || null]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading lecture file:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

// GET /lecture/:lectureId - list files for a lecture
router.get('/lecture/:lectureId', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "lecture_files" WHERE lecture_id = $1 ORDER BY created_at DESC', [req.params.lectureId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching lecture files:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET /:id - get a single file record
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "lecture_files" WHERE id = $1', [req.params.id]);
    if (!data) return res.status(404).json({ status: 'error', error: 'Not found' });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching lecture file record:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE /:id - delete record and file
router.delete('/:id', async (req, res) => {
  try {
    const fileRec = await getOne('SELECT * FROM "lecture_files" WHERE id = $1', [req.params.id]);
    if (!fileRec) return res.status(404).json({ status: 'error', error: 'Not found' });

    // remove file from disk if exists
    if (fileRec.url) {
      const filePath = path.join(__dirname, '..', fileRec.url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await runQuery('DELETE FROM "lecture_files" WHERE id = $1', [req.params.id]);
    res.json({ status: 'success', message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting lecture file:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

module.exports = router;
