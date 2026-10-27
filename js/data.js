/**
 * data.js - Centralized Default Datasets and Storage Initializer
 * 
 * Provides initial seed data for:
 * 1. Inventory Items (tinkerlab_inventory)
 * 2. Component Requests (tinkerlab_requests / tinkerlab_custom_requests)
 * 
 * Seeds localStorage on first load if empty.
 */

// Initial default inventory items
const DEFAULT_INVENTORY = [
    {
        id: 'comp_arduino',
        name: 'Arduino Uno R3',
        category: 'Microcontrollers',
        description: 'ATmega328P based dev board, 14 digital I/O pins, 6 analog inputs',
        qty: 18,
        minThreshold: 5,
        location: 'Rack A-1',
        iconType: 'diamond',
        status: 'Available'
    },
    {
        id: 'comp_raspberry',
        name: 'Raspberry Pi 4 Model B',
        category: 'Microcontrollers',
        description: '4 GB RAM SBC with quad-core Cortex-A72, dual 4K micro-HDMI',
        qty: 6,
        minThreshold: 3,
        location: 'Rack A-2',
        iconType: 'square-red',
        status: 'Available'
    },
    {
        id: 'comp_esp32',
        name: 'ESP32 Dev Board',
        category: 'Microcontrollers',
        description: 'Dual-core 240 MHz with Wi-Fi + Bluetooth LE, 38-pin, 4 MB flash',
        qty: 24,
        minThreshold: 8,
        location: 'Rack A-3',
        iconType: 'triangle-orange',
        status: 'Available'
    },
    {
        id: 'comp_sensor',
        name: 'HC-SR04 Ultrasonic Sensor',
        category: 'Sensors',
        description: 'Ultrasonic distance sensor, 2-400 cm range, 5V operating',
        qty: 35,
        minThreshold: 10,
        location: 'Rack B-1',
        iconType: 'sensor-grey',
        status: 'Available'
    },
    {
        id: 'comp_dht11',
        name: 'DHT11 Temp & Humidity',
        category: 'Sensors',
        description: 'Digital temperature (0-50 °C) and humidity (20-90% RH) sensor',
        qty: 3,
        minThreshold: 5,
        location: 'Rack B-2',
        iconType: 'temp-amber',
        status: 'Low Stock'
    },
    {
        id: 'comp_mpu6050',
        name: 'MPU-6050 IMU',
        category: 'Sensors',
        description: '6-axis gyroscope + accelerometer with onboard Digital Motion Processor',
        qty: 14,
        minThreshold: 5,
        location: 'Rack C-1',
        iconType: 'gyro-purple',
        status: 'Available'
    },
    {
        id: 'comp_sg90',
        name: 'SG90 Servo Motor',
        category: 'Actuators',
        description: 'Mini servo, 180° rotation, 1.2 kg-cm torque, 4.8V-6V',
        qty: 0,
        minThreshold: 8,
        location: 'Rack D-1',
        iconType: 'gear-slate',
        status: 'Out of Stock'
    }
];

// Initial default requests
const DEFAULT_REQUESTS = [
    {
        id: 'req001',
        studentName: 'Arjun Sharma',
        studentRoll: 'CS21B001',
        studentEmail: 'cse001@bmu.edu.in',
        department: 'Computer Science',
        items: [
            { name: 'Arduino Uno R3', qty: 2, available: 18, rack: 'Rack A-1', status: 'Available' },
            { name: 'HC-SR04 Ultrasonic Sensor', qty: 3, available: 35, rack: 'Rack B-1', status: 'Available' }
        ],
        status: 'Pending',
        submittedDate: '14 Aug 2026',
        submittedTime: '09:15 am',
        dueDate: '20 Aug 2026',
        purpose: 'Final year project: Obstacle avoidance robot',
        comment: ''
    },
    {
        id: 'req002',
        studentName: 'Priya Nair',
        studentRoll: 'EC21B014',
        studentEmail: 'priya.nair@bmu.edu.in',
        department: 'Electronics & Communication',
        items: [
            { name: 'ESP32 Dev Board', qty: 1, available: 24, rack: 'Rack A-3', status: 'Available' },
            { name: 'NRF24L01 RF Module', qty: 2, available: 12, rack: 'Rack C-2', status: 'Available' }
        ],
        status: 'Pending',
        submittedDate: '14 Aug 2026',
        submittedTime: '10:45 am',
        dueDate: '22 Aug 2026',
        purpose: 'IoT Smart Home project for mini project exhibition',
        comment: ''
    },
    {
        id: 'req003',
        studentName: 'Rahul Mehta',
        studentRoll: 'ME21B007',
        studentEmail: 'rahul.mehta@bmu.edu.in',
        department: 'Mechanical Engineering',
        items: [
            { name: 'SG90 Servo Motor', qty: 2, available: 0, rack: 'Rack D-1', status: 'Out of Stock' },
            { name: 'L298N Motor Driver', qty: 1, available: 15, rack: 'Rack B-2', status: 'Available' }
        ],
        status: 'Pending',
        submittedDate: '13 Aug 2026',
        submittedTime: '03:20 pm',
        dueDate: '19 Aug 2026',
        purpose: 'Robotics arm gripper mechanism',
        comment: ''
    },
    {
        id: 'req004',
        studentName: 'Sneha Kulkarni',
        studentRoll: 'CS21B023',
        studentEmail: 'sneha.k@bmu.edu.in',
        department: 'Computer Science',
        items: [
            { name: 'Raspberry Pi 4 Model B', qty: 1, available: 6, rack: 'Rack A-2', status: 'Available' }
        ],
        status: 'Approved',
        submittedDate: '12 Aug 2026',
        submittedTime: '11:10 am',
        dueDate: '25 Aug 2026',
        purpose: 'Edge AI inference testing for smart attendance system',
        comment: 'Approved. Collect from Lab Room 102.'
    },
    {
        id: 'req005',
        studentName: 'Vikram Joshi',
        studentRoll: 'EE21B009',
        studentEmail: 'vikram.j@bmu.edu.in',
        department: 'Electrical Engineering',
        items: [
            { name: 'INA219 Current Sensor', qty: 2, available: 8, rack: 'Rack C-1', status: 'Available' }
        ],
        status: 'Completed',
        submittedDate: '10 Aug 2026',
        submittedTime: '02:40 pm',
        dueDate: '17 Aug 2026',
        purpose: 'Solar inverter efficiency monitoring benchmark',
        comment: 'Returned in good condition.'
    },
    {
        id: 'req006',
        studentName: 'Ananya Deshmukh',
        studentRoll: 'EC21B031',
        studentEmail: 'ananya.d@bmu.edu.in',
        department: 'Electronics & Communication',
        items: [
            { name: 'FPGA Spartan-7 Board', qty: 1, available: 2, rack: 'Rack E-1', status: 'Low Stock' }
        ],
        status: 'Rejected',
        submittedDate: '09 Aug 2026',
        submittedTime: '04:15 pm',
        dueDate: '16 Aug 2026',
        purpose: 'Digital Signal Processing hardware acceleration test',
        comment: 'Reserved for faculty research this week.'
    },
    {
        id: 'req007',
        studentName: 'Arjun Sharma',
        studentRoll: 'CS21B001',
        studentEmail: 'cse001@bmu.edu.in',
        department: 'Computer Science',
        items: [
            { name: 'Jumper Wires M-M 40pcs', qty: 1, available: 50, rack: 'Rack F-1', status: 'Available' },
            { name: 'Breadboard 830 Points', qty: 1, available: 30, rack: 'Rack F-2', status: 'Available' }
        ],
        status: 'Completed',
        submittedDate: '08 Aug 2026',
        submittedTime: '10:00 am',
        dueDate: '13 Aug 2026',
        purpose: 'Breadboard Prototyping Workshop',
        comment: 'Returned on 13 Aug 2026'
    },
    {
        id: 'req008',
        studentName: 'Pooja Iyer',
        studentRoll: 'ME21B042',
        studentEmail: 'pooja.iyer@bmu.edu.in',
        department: 'Mechanical Engineering',
        items: [
            { name: 'Digital Caliper 150mm', qty: 1, available: 5, rack: 'Tool Cabinet 2', status: 'Available' }
        ],
        status: 'Completed',
        submittedDate: '05 Aug 2026',
        submittedTime: '01:25 pm',
        dueDate: '08 Aug 2026',
        purpose: 'Chassis dimensional verification for Formula Student design',
        comment: 'All checked in.'
    }
];

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

// Global Storage Keys
const TLOPS_KEYS = {
    INVENTORY: 'tinkerlab_inventory',
    REQUESTS: 'tinkerlab_requests'
};

/**
 * Retrieves all inventory items from localStorage, seeding default data if empty.
 * @returns {Array} List of inventory objects.
 */
function getInventory() {
    try {
        let items = (typeof getData === 'function') ? getData(TLOPS_KEYS.INVENTORY) : null;
        if (!items || !Array.isArray(items) || items.length === 0) {
            items = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
            if (typeof saveData === 'function') {
                saveData(TLOPS_KEYS.INVENTORY, items);
            }
        }
        return items;
    } catch (e) {
        console.warn('[data.js] Error reading inventory:', e);
        return DEFAULT_INVENTORY;
    }
}

/**
 * Saves all inventory items to localStorage.
 * @param {Array} items - List of inventory objects.
 */
function saveInventory(items) {
    if (typeof saveData === 'function') {
        saveData(TLOPS_KEYS.INVENTORY, items);
    }
}

/**
 * Retrieves all requests from localStorage, seeding default data if empty.
 * @returns {Array} List of request objects.
 */
function getRequests() {
    try {
        let reqs = (typeof getData === 'function') ? getData(TLOPS_KEYS.REQUESTS) : null;
        if (!reqs || !Array.isArray(reqs) || reqs.length === 0) {
            // Also check legacy key if user previously created requests
            const legacy = (typeof getData === 'function') ? getData('tinkerlab_custom_requests') : null;
            if (legacy && Array.isArray(legacy) && legacy.length > 0) {
                reqs = legacy;
            } else {
                reqs = JSON.parse(JSON.stringify(DEFAULT_REQUESTS));
            }
            if (typeof saveData === 'function') {
                saveData(TLOPS_KEYS.REQUESTS, reqs);
            }
        }
        return reqs;
    } catch (e) {
        console.warn('[data.js] Error reading requests:', e);
        return DEFAULT_REQUESTS;
    }
}

/**
 * Saves all requests to localStorage, also syncing the legacy key for backward compatibility.
 * @param {Array} reqs - List of request objects.
 */
function saveRequests(reqs) {
    if (typeof saveData === 'function') {
        saveData(TLOPS_KEYS.REQUESTS, reqs);
        saveData('tinkerlab_custom_requests', reqs);
    }
}

// Self-seed on load
(function initSharedData() {
    getInventory();
    getRequests();
})();

// Attach to window
window.DEFAULT_INVENTORY = DEFAULT_INVENTORY;
window.DEFAULT_REQUESTS = DEFAULT_REQUESTS;
window.escapeHtml = escapeHtml;
window.getInventory = getInventory;
window.saveInventory = saveInventory;
window.getRequests = getRequests;
window.saveRequests = saveRequests;
window.TLOPS_KEYS = TLOPS_KEYS;
