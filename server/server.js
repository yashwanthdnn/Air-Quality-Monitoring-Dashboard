const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/airquality_db';

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/air-quality', require('./routes/airQuality'));
app.use('/api/geocoding', require('./routes/geocoding'));
app.use('/api/user', require('./routes/user'));

// System Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Static assets serving & SPA Fallback for Production (Render Monorepo deployment)
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  // Serve built static assets (JS, CSS, images, etc.)
  app.use(express.static(clientDistPath));

  // SPA fallback for client-side routing
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root welcome route when running API-only mode
  app.get('/', (req, res) => {
    res.json({
      message: '🌿 AeroPulse Air Quality & Weather API Server is Running!',
      endpoints: {
        health: '/api/health',
        airQuality: '/api/air-quality?lat=28.6139&lon=77.2090',
        geocodingSearch: '/api/geocoding/search?q=London',
        featuredCities: '/api/geocoding/featured',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me'
        },
        userFavorites: {
          get: 'GET /api/user/saved-locations',
          add: 'POST /api/user/saved-locations',
          remove: 'DELETE /api/user/saved-locations/:id'
        }
      }
    });
  });
}

// Database Connection
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('✅ Connected successfully to MongoDB');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('⚠️ Note: If deployed on Render, please set MONGODB_URI in Render dashboard environment variables.');
  });

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AeroPulse Server listening on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
});

