const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    description: String,
    duration: Number,
    date: Date
}, {timestamps: true});

module.exports = schema;