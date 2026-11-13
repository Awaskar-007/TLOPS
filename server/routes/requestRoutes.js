const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Request = require('../models/Request');
const { getDbStatus } = require('../config/db');

function ensureMongo(req, res, next) {
    const status = getDbStatus();
    if (!status.connected) {
        return res.status(503).json({
            error: 'MongoDB is currently not connected.',
            message: 'Set a valid MONGO_URI in .env (or run a local MongoDB instance). You can also use /api/json/requests.',
            dbStatus: status
        });
    }
    next();
}

/* ==========================================================================
   MONGODB CRUD OPERATIONS FOR REQUESTS
   ========================================================================== */

// 1. READ ALL (GET /api/requests)
router.get('/', ensureMongo, async (req, res) => {
    try {
        const { status, studentRoll } = req.query;
        let filter = {};

        if (status && status !== 'All') {
            filter.status = status;
        }
        if (studentRoll) {
            filter.studentRoll = studentRoll;
        }

        const requests = await Request.find(filter).sort({ createdAt: -1 });
        res.json({
            storage: 'MongoDB',
            count: requests.length,
            data: requests
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve requests from MongoDB', details: err.message });
    }
});

// 2. READ ONE BY ID (GET /api/requests/:id)
router.get('/:id', ensureMongo, async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { id: req.params.id };

        const request = await Request.findOne(query);
        if (!request) {
            return res.status(404).json({ error: `Request '${req.params.id}' not found in MongoDB.` });
        }
        res.json({ storage: 'MongoDB', data: request });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch request', details: err.message });
    }
});

// 3. CREATE NEW REQUEST (POST /api/requests)
router.post('/', ensureMongo, async (req, res) => {
    try {
        const { id, studentName, studentRoll, studentEmail, department, items, dueDate, purpose, submittedDate, submittedTime, comment } = req.body;

        const newRequest = new Request({
            id: id || undefined,
            studentName,
            studentRoll,
            studentEmail,
            department: department || 'Computer Science',
            items,
            dueDate,
            purpose,
            submittedDate: submittedDate || undefined,
            submittedTime: submittedTime || undefined,
            comment: comment || ''
        });

        const saved = await newRequest.save();
        res.status(201).json({
            message: 'Requisition request created successfully in MongoDB!',
            storage: 'MongoDB',
            data: saved
        });
    } catch (err) {
        res.status(400).json({ error: 'Validation error creating request in MongoDB', details: err.message });
    }
});

// 4. UPDATE REQUEST (PUT /api/requests/:id)
router.put('/:id', ensureMongo, async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { id: req.params.id };

        const updated = await Request.findOneAndUpdate(query, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!updated) {
            return res.status(404).json({ error: `Request '${req.params.id}' not found.` });
        }

        res.json({
            message: 'Request updated successfully in MongoDB!',
            storage: 'MongoDB',
            data: updated
        });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update request in MongoDB', details: err.message });
    }
});

// 5. DELETE REQUEST (DELETE /api/requests/:id)
router.delete('/:id', ensureMongo, async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { id: req.params.id };

        const deleted = await Request.findOneAndDelete(query);
        if (!deleted) {
            return res.status(404).json({ error: `Request '${req.params.id}' not found.` });
        }

        res.json({
            message: 'Request deleted successfully from MongoDB!',
            storage: 'MongoDB',
            deleted
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete request from MongoDB', details: err.message });
    }
});

module.exports = router;
