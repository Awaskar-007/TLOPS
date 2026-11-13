require('dotenv').config();
const mongoose = require('mongoose');
const Component = require('./models/Component');
const Request = require('./models/Request');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tlops';

const SEED_COMPONENTS = [
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

const SEED_REQUESTS = [
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
    }
];

const SEED_USERS = [
    {
        id: 'usr_001',
        name: 'Arjun Sharma',
        email: 'cse001@bmu.edu.in',
        password: 'Password@123',
        role: 'Student',
        rollNumber: 'CS21B001',
        department: 'Computer Science'
    },
    {
        id: 'usr_002',
        name: 'Dr. Meera Krishnan',
        email: 'meera.k@bmu.edu.in',
        password: 'Password@123',
        role: 'Teacher',
        rollNumber: 'FAC-CSE-042',
        department: 'Computer Science & Engineering'
    }
];

async function seed() {
    try {
        console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('Connected! Purging and seeding collections...');

        await Component.deleteMany({});
        await Component.insertMany(SEED_COMPONENTS);
        console.log(`✓ Seeded ${SEED_COMPONENTS.length} components.`);

        await Request.deleteMany({});
        await Request.insertMany(SEED_REQUESTS);
        console.log(`✓ Seeded ${SEED_REQUESTS.length} requests.`);

        await User.deleteMany({});
        await User.insertMany(SEED_USERS);
        console.log(`✓ Seeded ${SEED_USERS.length} demo users.`);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
}

seed();
