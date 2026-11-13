const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: () => 'usr_' + Math.random().toString(36).substring(2, 8)
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Student' },
    rollNumber: { type: String, default: '' },
    department: { type: String, default: 'Computer Science' }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
