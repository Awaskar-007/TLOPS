const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: () => 'comp_' + Math.random().toString(36).substring(2, 9)
    },
    name: {
        type: String,
        required: [true, 'Component name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    qty: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    minThreshold: {
        type: Number,
        default: 5,
        min: 0
    },
    location: {
        type: String,
        default: 'Rack A-1'
    },
    iconType: {
        type: String,
        default: 'diamond'
    },
    status: {
        type: String,
        enum: ['Available', 'Low Stock', 'Out of Stock'],
        default: 'Available'
    }
}, {
    timestamps: true
});

// Auto-compute status before saving based on qty & minThreshold
ComponentSchema.pre('save', function (next) {
    if (this.qty <= 0) {
        this.status = 'Out of Stock';
    } else if (this.qty <= this.minThreshold) {
        this.status = 'Low Stock';
    } else {
        this.status = 'Available';
    }
    next();
});

module.exports = mongoose.model('Component', ComponentSchema);
