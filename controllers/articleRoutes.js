const multer = require('multer');
const path = require('path');
const Article = require('../models/article');
const User = require('../models/user'); 
// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
    },
});

// Initialize multer
const upload = multer({ storage });

// Create Article function
const createArticle = async (req, res) => {
    const { description } = req.body;
    const userId = req.user.id; // Assuming you have user authentication middleware that sets req.user
    const image = req.file.path; // Get the path of the uploaded image

    try {
        const newArticle = new Article({
            description,
            image,
            userId,
        });

        await newArticle.save();
        res.status(201).json({ message: 'Article created successfully', article: newArticle });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Function to get all articles
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find()
            .populate('userId', 'name') // Populate the name from the User model
            .select('description image createdAt userId'); // Select only the fields you need

        // Format the response
        const formattedArticles = articles.map(article => ({
            description: article.description,
            image: article.image,
            createdAt: article.createdAt,
            name: article.userId ? article.userId.name : 'Unknown', // Access the populated name
        }));

        res.status(200).json(formattedArticles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export the upload middleware and createArticle function
module.exports = {
    upload,
    createArticle,
    getAllArticles,
};
