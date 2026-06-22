require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const test = require('./config/test_db')


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
// Middleware
// Enable CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  // Allow all Vercel deployments
  /\.vercel\.app$/,
  /\.netlify\.app$/,
  // Allow all Render deployments
  /\.onrender\.com$/,
];

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'EVO API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploads (lecture files, grades, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});


// API Routes
app.use('/api/tabels', test);

// Dynamically load all route files
const routesDir = path.join(__dirname, 'routes');
if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach(file => {
    if (file.endsWith('.js')) {
      const routeName = file.split('.')[0];
      const routePath = `/api/${routeName}`;
      const routeRouter = require(path.join(routesDir, file));
      app.use(routePath, routeRouter);
      console.log(`✅ Mounted route: ${routePath}`);
    }
  });
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



module.exports = app;