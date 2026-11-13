const mongoose = require('mongoose');

const RequestItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    available: { type: Number, default: 0 },
    rack: { type: String, default: 'General' },
    status: { type: String, default: 'Available' }
}, { _id: false });

const RequestSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: () => 'req_' + Math.random().toString(36).substring(2, 8)
    },
    studentName: { type: String, required: true },
    studentRoll: { type: String, required: true },
    studentEmail: { type: String, required: true },
    department: { type: String, default: 'Computer Science' },
    items: {
        type: [RequestItemSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'At least one item is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    submittedDate: {
        type: String,
        default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    submittedTime: {
        type: String,
        default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    },
    dueDate: { type: String, required: true },
    purpose: { type: String, required: true },
    comment: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', RequestSchema);
