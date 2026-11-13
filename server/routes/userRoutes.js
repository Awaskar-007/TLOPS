const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getDbStatus } = require('../config/db');

function ensureMongo(req, res, next) {
    const status = getDbStatus();
    if (!status.connected) {
        return res.status(503).json({
            error: 'MongoDB is currently not connected.',
            message: 'Set a valid MONGO_URI in .env to enable MongoDB user management.'
        });
    }
    next();
}

// GET /api/users
router.get('/', ensureMongo, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({ storage: 'MongoDB', count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve users', details: err.message });
    }
});

// POST /api/users/register
router.post('/register', ensureMongo, async (req, res) => {
    try {
        const { name, email, password, role, rollNumber, department } = req.body;
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const newUser = new User({
            name,
            email,
            password, // Note: In production, hash with bcrypt
            role: role || 'Student',
            rollNumber: rollNumber || '',
            department: department || 'Computer Science'
        });

        await newUser.save();
        res.status(201).json({
            message: 'User registered successfully!',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (err) {
        res.status(400).json({ error: 'Registration failed', details: err.message });
    }
});

// POST /api/users/login
router.post('/login', ensureMongo, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        if (role && user.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(403).json({ error: `Account role mismatch: registered as ${user.role}.` });
        }

        res.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                department: user.department
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login check failed', details: err.message });
    }
});

module.exports = router;
