const mongoose = require('mongoose');
const Exercise = require('./Exercise');

const schema = new mongoose.Schema({
    username: String,
    exercises: [{type: mongoose.Schema.Types.ObjectId, ref: 'Exercise'}]
});

const User = mongoose.model('User', schema);

module.exports = User;