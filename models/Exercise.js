const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    description: String,
    duration: Number,
    date: Date,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

const Exercise = mongoose.model('Exercise', schema);

module.exports = Exercise;