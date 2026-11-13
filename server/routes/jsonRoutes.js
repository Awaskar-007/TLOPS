const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();

const INVENTORY_FILE = path.join(__dirname, '../data/inventory.json');
const REQUESTS_FILE = path.join(__dirname, '../data/requests.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper to safely read a JSON file
async function readJsonFile(filePath, defaultValue = []) {
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        }
        console.error(`Error reading ${filePath}:`, err);
        return defaultValue;
    }
}

// Helper to write a JSON file atomically
async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/* ==========================================================================
   INVENTORY JSON CRUD ROUTES
   ========================================================================== */

// 1. GET ALL INVENTORY
router.get('/inventory', async (req, res) => {
    try {
        const items = await readJsonFile(INVENTORY_FILE);
        const { category, search } = req.query;

        let filtered = items;
        if (category && category !== 'All') {
            filtered = filtered.filter(item => item.category === category);
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(item => 
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.description && item.description.toLowerCase().includes(q)) ||
                (item.location && item.location.toLowerCase().includes(q))
            );
        }

        res.json({
            storage: 'Local JSON File',
            file: 'server/data/inventory.json',
            count: filtered.length,
            data: filtered
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read inventory JSON file', details: err.message });
    }
});

// 2. GET SINGLE INVENTORY ITEM BY ID
router.get('/inventory/:id', async (req, res) => {
    try {
        const items = await readJsonFile(INVENTORY_FILE);
        const item = items.find(i => String(i.id) === String(req.params.id));
        if (!item) {
            return res.status(404).json({ error: `Item with id ${req.params.id} not found in JSON storage.` });
        }
        res.json({ storage: 'Local JSON File', data: item });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read inventory item', details: err.message });
    }
});

// 3. CREATE NEW INVENTORY ITEM
router.post('/inventory', async (req, res) => {
    try {
        const { name, category, description, qty, minThreshold, location, iconType } = req.body;
        if (!name || !category) {
            return res.status(400).json({ error: 'Name and Category are required fields.' });
        }

        const items = await readJsonFile(INVENTORY_FILE);
        const parsedQty = parseInt(qty, 10) || 0;
        const parsedMin = parseInt(minThreshold, 10) || 5;

        let status = 'Available';
        if (parsedQty <= 0) status = 'Out of Stock';
        else if (parsedQty <= parsedMin) status = 'Low Stock';

        const newItem = {
            id: req.body.id || `comp_${Date.now()}`,
            name: name.trim(),
            category: category.trim(),
            description: description || '',
            qty: parsedQty,
            minThreshold: parsedMin,
            location: location || 'Rack A-1',
            iconType: iconType || 'diamond',
            status
        };

        items.push(newItem);
        await writeJsonFile(INVENTORY_FILE, items);

        res.status(201).json({
            message: 'Component saved successfully to local JSON file.',
            storage: 'Local JSON File',
            data: newItem
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save component to JSON file', details: err.message });
    }
});

// 4. UPDATE EXISTING INVENTORY ITEM
router.put('/inventory/:id', async (req, res) => {
    try {
        const items = await readJsonFile(INVENTORY_FILE);
        const index = items.findIndex(i => String(i.id) === String(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: `Item with id ${req.params.id} not found.` });
        }

        const existing = items[index];
        const updated = {
            ...existing,
            ...req.body,
            id: existing.id // preserve ID
        };

        const parsedQty = parseInt(updated.qty, 10) || 0;
        const parsedMin = parseInt(updated.minThreshold, 10) || 5;
        updated.qty = parsedQty;
        updated.minThreshold = parsedMin;

        if (parsedQty <= 0) updated.status = 'Out of Stock';
        else if (parsedQty <= parsedMin) updated.status = 'Low Stock';
        else updated.status = 'Available';

        items[index] = updated;
        await writeJsonFile(INVENTORY_FILE, items);

        res.json({
            message: 'Component updated successfully in local JSON file.',
            storage: 'Local JSON File',
            data: updated
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update component in JSON file', details: err.message });
    }
});

// 5. DELETE INVENTORY ITEM
router.delete('/inventory/:id', async (req, res) => {
    try {
        const items = await readJsonFile(INVENTORY_FILE);
        const index = items.findIndex(i => String(i.id) === String(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: `Item with id ${req.params.id} not found.` });
        }

        const deletedItem = items.splice(index, 1)[0];
        await writeJsonFile(INVENTORY_FILE, items);

        res.json({
            message: 'Component deleted successfully from local JSON file.',
            storage: 'Local JSON File',
            deleted: deletedItem
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete component from JSON file', details: err.message });
    }
});

/* ==========================================================================
   REQUESTS JSON CRUD ROUTES
   ========================================================================== */

// 1. GET ALL REQUESTS
router.get('/requests', async (req, res) => {
    try {
        const requests = await readJsonFile(REQUESTS_FILE);
        const { status, studentRoll } = req.query;

        let filtered = requests;
        if (status && status !== 'All') {
            filtered = filtered.filter(r => r.status && r.status.toLowerCase() === status.toLowerCase());
        }
        if (studentRoll) {
            filtered = filtered.filter(r => r.studentRoll === studentRoll);
        }

        res.json({
            storage: 'Local JSON File',
            file: 'server/data/requests.json',
            count: filtered.length,
            data: filtered
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read requests JSON file', details: err.message });
    }
});

// 2. CREATE NEW REQUEST
router.post('/requests', async (req, res) => {
    try {
        const { studentName, studentRoll, studentEmail, items, purpose, dueDate } = req.body;
        if (!studentName || !items || !items.length) {
            return res.status(400).json({ error: 'studentName and at least one item are required.' });
        }

        const requests = await readJsonFile(REQUESTS_FILE);
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const newRequest = {
            id: req.body.id || `req_${Date.now()}`,
            studentName,
            studentRoll: studentRoll || 'CS21B001',
            studentEmail: studentEmail || 'student@bmu.edu.in',
            department: req.body.department || 'Computer Science',
            items,
            status: 'Pending',
            submittedDate: req.body.submittedDate || dateStr,
            submittedTime: req.body.submittedTime || timeStr,
            dueDate: dueDate || '20 Aug 2026',
            purpose: purpose || 'Hardware Requisition',
            comment: ''
        };

        requests.unshift(newRequest);
        await writeJsonFile(REQUESTS_FILE, requests);

        res.status(201).json({
            message: 'Request saved successfully to local JSON file.',
            storage: 'Local JSON File',
            data: newRequest
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create request in JSON file', details: err.message });
    }
});

// 3. UPDATE REQUEST (Decision / Approval / Comment)
router.put('/requests/:id', async (req, res) => {
    try {
        const requests = await readJsonFile(REQUESTS_FILE);
        const index = requests.findIndex(r => String(r.id) === String(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: `Request with id ${req.params.id} not found.` });
        }

        requests[index] = {
            ...requests[index],
            ...req.body,
            id: requests[index].id // preserve ID
        };

        await writeJsonFile(REQUESTS_FILE, requests);

        res.json({
            message: 'Request updated successfully in local JSON file.',
            storage: 'Local JSON File',
            data: requests[index]
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update request in JSON file', details: err.message });
    }
});

// 4. DELETE REQUEST
router.delete('/requests/:id', async (req, res) => {
    try {
        const requests = await readJsonFile(REQUESTS_FILE);
        const index = requests.findIndex(r => String(r.id) === String(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: `Request with id ${req.params.id} not found.` });
        }

        const deleted = requests.splice(index, 1)[0];
        await writeJsonFile(REQUESTS_FILE, requests);

        res.json({
            message: 'Request deleted successfully from local JSON file.',
            storage: 'Local JSON File',
            deleted
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete request from JSON file', details: err.message });
    }
});

module.exports = router;
