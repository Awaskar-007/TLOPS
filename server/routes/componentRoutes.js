const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Component = require('../models/Component');
const { getDbStatus } = require('../config/db');

// Middleware to check if MongoDB is connected
function ensureMongo(req, res, next) {
    const status = getDbStatus();
    if (!status.connected) {
        return res.status(503).json({
            error: 'MongoDB is currently not connected.',
            message: 'Set a valid MONGO_URI in .env (or run a local MongoDB instance). You can also use the /api/json/inventory endpoints for local file storage.',
            dbStatus: status
        });
    }
    next();
}

/* ==========================================================================
   MONGODB CRUD OPERATIONS FOR INVENTORY COMPONENTS
   ========================================================================== */

// 1. READ ALL (GET /api/components)
router.get('/', ensureMongo, async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = {};

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const components = await Component.find(filter).sort({ createdAt: -1 });
        res.json({
            storage: 'MongoDB',
            count: components.length,
            data: components
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve components from MongoDB', details: err.message });
    }
});

// 2. READ ONE BY ID (GET /api/components/:id)
router.get('/:id', ensureMongo, async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { id: req.params.id };

        const component = await Component.findOne(query);
        if (!component) {
            return res.status(404).json({ error: `Component '${req.params.id}' not found in MongoDB.` });
        }
        res.json({ storage: 'MongoDB', data: component });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch component', details: err.message });
    }
});

// 3. CREATE NEW COMPONENT (POST /api/components)
router.post('/', ensureMongo, async (req, res) => {
    try {
        const { id, name, category, description, qty, minThreshold, location, iconType } = req.body;
        
        const newComponent = new Component({
            id: id || undefined,
            name,
            category,
            description,
            qty: Number(qty) || 0,
            minThreshold: Number(minThreshold) || 5,
            location: location || 'Rack A-1',
            iconType: iconType || 'diamond'
        });

        const saved = await newComponent.save();
        res.status(201).json({
            message: 'Component created successfully in MongoDB!',
            storage: 'MongoDB',
            data: saved
        });
    } catch (err) {
        res.status(400).json({ error: 'Validation error creating component in MongoDB', details: err.message });
    }
});

// 4. UPDATE COMPONENT (PUT /api/components/:id)
router.put('/:id', ensureMongo, async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { id: req.params.id };

        const updateData = { ...req.body };
        if (updateData.qty !== undefined) updateData.qty = Number(updateData.qty);
        if (updateData.minThreshold !== undefined) updateData.minThreshold = Number(updateData.minThreshold);

        // Recalculate status if qty is updated
        if (updateData.qty !== undefined) {
            const min = updateData.minThreshold !== undefined ? updateData.minThreshold : 5;
            if (updateData.qty <= 0) updateData.status = 'Out of Stock';
            else if (updateData.qty <= min) updateData.status = 'Low Stock';
            else updateData.status = 'Available';
        }

        const updated = await Component.findOneAndUpdate(query, updateData, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!updated) {
            return res.status(404).json({ error: `Component '${req.params.id}' not found.` });
        }

        res.json({
            message: 'Component updated successfully in MongoDB!',
            storage: 'MongoDB',
            data: updated
        });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update component in MongoDB', details: err.message });
    }
});

// 5. DELETE COMPONENT (DELETE /api/components/:id)
router.delete('/:id', ensureMongo, async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { id: req.params.id };

        const deleted = await Component.findOneAndDelete(query);
        if (!deleted) {
            return res.status(404).json({ error: `Component '${req.params.id}' not found.` });
        }

        res.json({
            message: 'Component deleted successfully from MongoDB!',
            storage: 'MongoDB',
            deleted
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete component from MongoDB', details: err.message });
    }
});

module.exports = router;
