const mongoose = require('mongoose');
const Exercise = require('./Exercise');

const schema = new mongoose.Schema({
    username: String,
    exercises: [Exercise]
});

const User = mongoose.model('User', schema);

module.exports = User;