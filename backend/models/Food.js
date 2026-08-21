const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    expiryDate: { type: String, required: true },
    location: { type: String, required: true },
    donor: { type: String, required: true }, 
    status: { type: String, default: 'available' },
    reservedBy: { type: String, default: null }, 
    reservedAt: { type: Date, default: null },
    image: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);