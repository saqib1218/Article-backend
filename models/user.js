const mongoose = require('mongoose');
// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name!"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email!"],
        unique: true, // Ensure email is unique
    },
    password: {
        type: String,
        required: [false, "Please provide a password!"],
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of friends
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of pending friend requests
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] ,
    
});


// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
