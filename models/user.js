const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    role: { type: String, required: true },
});

module.exports = mongoose.model('user', userSchema);