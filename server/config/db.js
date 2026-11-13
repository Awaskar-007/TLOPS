const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tlops';
    try {
        mongoose.set('strictQuery', false);
        // Prevent unhandled error event emissions
        mongoose.connection.on('error', () => {});
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000
        });
        isConnected = true;
        console.log(`[MongoDB] Connected successfully to: ${mongoUri}`);
    } catch (err) {
        isConnected = false;
        console.warn(`[MongoDB Info] No active MongoDB service detected at ${mongoUri}.`);
        console.warn(`[MongoDB Info] Express server is RUNNING and Local JSON APIs are 100% active.`);
        console.warn(`[MongoDB Info] (Optional) Add a free MongoDB Atlas URI to .env to enable cloud MongoDB persistence.`);
    }
}

function getDbStatus() {
    return {
        connected: isConnected && mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        host: mongoose.connection.host || 'none',
        name: mongoose.connection.name || 'none'
    };
}

module.exports = { connectDB, getDbStatus };
