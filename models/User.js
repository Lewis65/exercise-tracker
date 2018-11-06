const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    username: String,
    exercises: [
        {
            description: String,
            duration: Number,
            date: Date
        }
    ]
});

const User = mongoose.model('User', schema);

module.exports = User;