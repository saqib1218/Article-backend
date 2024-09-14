const mongoose = require('mongoose');

// Define the article schema
const articleSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "Please provide a description!"],
    },
    image: {
        type: String,
        required: [true, "Please provide an image URL!"],
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the created date to now
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Automatically set the updated date to now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        required: [true, "User ID is required!"],
        ref: 'User', // Reference to the User model
    },
});

// Middleware to update the updatedAt field before saving
articleSchema.pre('save', function(next) {
    this.updatedAt = Date.now(); // Update the updatedAt field to the current date
    next();
});

// Create the Article model
const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
