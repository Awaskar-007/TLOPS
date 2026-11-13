require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDbStatus } = require('./config/db');

// Route imports
const externalRoutes = require('./routes/externalRoutes');
const jsonRoutes = require('./routes/jsonRoutes');
const componentRoutes = require('./routes/componentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.originalUrl.startsWith('/api')) {
            console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Serve frontend static assets (HTML, CSS, JS) from project root
app.use(express.static(path.join(__dirname, '..')));

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// 0. System Health & Status Check
app.get('/api/health', (req, res) => {
    const dbStatus = getDbStatus();
    res.json({
        system: 'TLOPS - Tinkering Lab Operations Platform API',
        status: 'UP',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        database: {
            type: 'MongoDB',
            status: dbStatus.connected ? 'CONNECTED' : 'DISCONNECTED (Local JSON storage active)',
            details: dbStatus
        },
        endpoints: {
            externalApi: '/api/external/hardware-catalog',
            localJsonInventory: '/api/json/inventory',
            localJsonRequests: '/api/json/requests',
            mongoComponents: '/api/components',
            mongoRequests: '/api/requests',
            mongoUsers: '/api/users'
        }
    });
});

// 1. External API Integration (Requirement 1)
app.use('/api/external', externalRoutes);

// 2. Local JSON Files CRUD APIs (Requirement 3)
app.use('/api/json', jsonRoutes);

// 3. MongoDB CRUD APIs (Requirement 4)
app.use('/api/components', componentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// 404 for unhandled API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API Endpoint Not Found',
        requestedUrl: req.originalUrl,
        documentation: '/api-demo.html'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 TLOPS Server running at http://localhost:${PORT}`);
    console.log(`📁 Static Frontend: http://localhost:${PORT}/index.html`);
    console.log(`🧪 Interactive API Explorer: http://localhost:${PORT}/api-demo.html`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
});

module.exports = app;
