const mongoose = require('mongoose');




const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: false
    },
    profile_pic: {
        type: String,
        required: false
    },
    connected_users: {
        type: Array,
        required: false
    },
   
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;