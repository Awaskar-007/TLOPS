/**
 * data.js - MongoDB Atlas Cloud Data Layer
 * 
 * Directly interfaces with the Express / MongoDB Atlas REST backend:
 * - GET/POST/PUT/DELETE /api/components
 * - GET/POST/PUT/DELETE /api/requests
 * 
 * Replaces all local storage datasets with cloud database synchronization.
 */

// In-memory cloud caches initialized from sessionStorage if present
let _inventoryCache = [];
let _requestsCache = [];

try {
    const cachedInv = sessionStorage.getItem('tlops_mongo_inventory');
    if (cachedInv) _inventoryCache = JSON.parse(cachedInv);
    const cachedReq = sessionStorage.getItem('tlops_mongo_requests');
    if (cachedReq) _requestsCache = JSON.parse(cachedReq);
} catch (e) {}

// Fallback seed data in case backend is briefly initializing
const DEFAULT_INVENTORY = [
    { id: 'comp_arduino', name: 'Arduino Uno R3', category: 'Microcontrollers', description: 'ATmega328P based dev board, 14 digital I/O pins, 6 analog inputs', qty: 18, minThreshold: 5, location: 'Rack A-1', status: 'Available' },
    { id: 'comp_raspberry', name: 'Raspberry Pi 4 Model B', category: 'Microcontrollers', description: '4 GB RAM SBC with quad-core Cortex-A72, dual 4K micro-HDMI', qty: 6, minThreshold: 3, location: 'Rack A-2', status: 'Available' },
    { id: 'comp_esp32', name: 'ESP32 Dev Board', category: 'Microcontrollers', description: 'Dual-core 240 MHz with Wi-Fi + Bluetooth LE, 38-pin, 4 MB flash', qty: 24, minThreshold: 8, location: 'Rack A-3', status: 'Available' },
    { id: 'comp_sensor', name: 'HC-SR04 Ultrasonic Sensor', category: 'Sensors', description: 'Ultrasonic distance sensor, 2-400 cm range, 5V operating', qty: 35, minThreshold: 10, location: 'Rack B-1', status: 'Available' },
    { id: 'comp_dht11', name: 'DHT11 Temp & Humidity', category: 'Sensors', description: 'Digital temperature (0-50 °C) and humidity (20-90% RH) sensor', qty: 3, minThreshold: 5, location: 'Rack B-2', status: 'Low Stock' },
    { id: 'comp_mpu6050', name: 'MPU-6050 IMU', category: 'Sensors', description: '6-axis gyroscope + accelerometer with onboard Digital Motion Processor', qty: 14, minThreshold: 5, location: 'Rack C-1', status: 'Available' },
    { id: 'comp_sg90', name: 'SG90 Servo Motor', category: 'Actuators', description: 'Mini servo, 180° rotation, 1.2 kg-cm torque, 4.8V-6V', qty: 0, minThreshold: 8, location: 'Rack D-1', status: 'Out of Stock' }
];

const DEFAULT_REQUESTS = [];

// Helper: Escape HTML strings to prevent XSS injection
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Fetches all inventory components from MongoDB Atlas
 */
async function fetchInventoryFromDb() {
    try {
        const res = await fetch('/api/components');
        if (res.ok) {
            const result = await res.json();
            _inventoryCache = result.data || [];
            try { sessionStorage.setItem('tlops_mongo_inventory', JSON.stringify(_inventoryCache)); } catch (e) {}
            window.dispatchEvent(new CustomEvent('tlops-data-synced', { detail: { type: 'inventory' } }));
            return _inventoryCache;
        }
    } catch (err) {
        console.warn('[data.js] Could not fetch components from MongoDB Atlas:', err.message);
    }
    return _inventoryCache.length ? _inventoryCache : DEFAULT_INVENTORY;
}

/**
 * Fetches all requests from MongoDB Atlas
 */
async function fetchRequestsFromDb() {
    try {
        const res = await fetch('/api/requests');
        if (res.ok) {
            const result = await res.json();
            _requestsCache = result.data || [];
            try { sessionStorage.setItem('tlops_mongo_requests', JSON.stringify(_requestsCache)); } catch (e) {}
            window.dispatchEvent(new CustomEvent('tlops-data-synced', { detail: { type: 'requests' } }));
            return _requestsCache;
        }
    } catch (err) {
        console.warn('[data.js] Could not fetch requests from MongoDB Atlas:', err.message);
    }
    return _requestsCache;
}

/**
 * Returns current inventory cached from MongoDB Atlas
 */
function getInventory() {
    return _inventoryCache.length > 0 ? _inventoryCache : DEFAULT_INVENTORY;
}

/**
 * Saves/syncs inventory to MongoDB Atlas.
 * Detects created, modified, or deleted components and issues cloud API calls.
 */
async function saveInventory(items) {
    const oldItems = _inventoryCache.length > 0 ? _inventoryCache : DEFAULT_INVENTORY;
    _inventoryCache = Array.isArray(items) ? [...items] : [];
    try { sessionStorage.setItem('tlops_mongo_inventory', JSON.stringify(_inventoryCache)); } catch (e) {}

    // 1. Detect newly added items
    for (const item of items) {
        const existing = oldItems.find(o => (o._id && o._id === item._id) || (o.id && o.id === item.id) || (o.name === item.name));
        if (!existing) {
            // New item -> POST /api/components
            try {
                await fetch('/api/components', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (e) {
                console.error('[data.js] Failed to create component in MongoDB:', e);
            }
        } else if (existing.qty !== item.qty || existing.location !== item.location || existing.description !== item.description || existing.name !== item.name) {
            // Updated item -> PUT /api/components/:id
            const targetId = existing._id || existing.id;
            try {
                await fetch(`/api/components/${encodeURIComponent(targetId)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (e) {
                console.error('[data.js] Failed to update component in MongoDB:', e);
            }
        }
    }

    // 2. Detect deleted items
    for (const oldItem of oldItems) {
        const stillExists = items.find(n => (n._id && n._id === oldItem._id) || (n.id && n.id === oldItem.id) || (n.name === oldItem.name));
        if (!stillExists) {
            const targetId = oldItem._id || oldItem.id;
            try {
                await fetch(`/api/components/${encodeURIComponent(targetId)}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error('[data.js] Failed to delete component in MongoDB:', e);
            }
        }
    }

    // Refresh from cloud in background
    setTimeout(fetchInventoryFromDb, 200);
}

/**
 * Returns current requests cached from MongoDB Atlas
 */
function getRequests() {
    return _requestsCache;
}

/**
 * Saves/syncs requests to MongoDB Atlas
 */
async function saveRequests(reqs) {
    const oldReqs = [..._requestsCache];
    _requestsCache = Array.isArray(reqs) ? [...reqs] : [];
    try { sessionStorage.setItem('tlops_mongo_requests', JSON.stringify(_requestsCache)); } catch (e) {}

    // Detect new requests
    for (const req of reqs) {
        const existing = oldReqs.find(o => (o._id && o._id === req._id) || (o.id && o.id === req.id));
        if (!existing) {
            try {
                await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(req)
                });
            } catch (e) {
                console.error('[data.js] Failed to create request in MongoDB:', e);
            }
        } else if (existing.status !== req.status || existing.comment !== req.comment) {
            // Status update (Approved/Rejected)
            const targetId = existing._id || existing.id;
            try {
                await fetch(`/api/requests/${encodeURIComponent(targetId)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: req.status, comment: req.comment })
                });
            } catch (e) {
                console.error('[data.js] Failed to update request in MongoDB:', e);
            }
        }
    }

    // Detect deleted requests
    for (const oldReq of oldReqs) {
        const stillExists = reqs.find(n => (n._id && n._id === oldReq._id) || (n.id && n.id === oldReq.id));
        if (!stillExists) {
            const targetId = oldReq._id || oldReq.id;
            try {
                await fetch(`/api/requests/${encodeURIComponent(targetId)}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error('[data.js] Failed to delete request in MongoDB:', e);
            }
        }
    }

    setTimeout(fetchRequestsFromDb, 200);
}

// Initial eager sync with MongoDB Atlas on script evaluation
(function initAtlasSync() {
    fetchInventoryFromDb();
    fetchRequestsFromDb();
})();

// Window exports
window.DEFAULT_INVENTORY = DEFAULT_INVENTORY;
window.DEFAULT_REQUESTS = DEFAULT_REQUESTS;
window.escapeHtml = escapeHtml;
window.getInventory = getInventory;
window.saveInventory = saveInventory;
window.getRequests = getRequests;
window.saveRequests = saveRequests;
window.fetchInventoryFromDb = fetchInventoryFromDb;
window.fetchRequestsFromDb = fetchRequestsFromDb;
