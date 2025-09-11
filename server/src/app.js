const express = require('express');
const dnsRoutes = require('./routes/dns');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/auth');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dns', authenticate, dnsRoutes); // Protect DNS routes

// Public route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = app;