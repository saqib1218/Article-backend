// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your secret or use environment variables

// const auth = (req, res, next) => {
//     const token = req.cookies.token; // Get token from cookies

//     if (!token) {
//         return res.status(401).json({ message: "Access denied. No token provided." });
//     }

//     try {
//         const verified = jwt.verify(token, JWT_SECRET);
//         req.user = verified; // Attach user information to the request object
//         next(); // Proceed to the next middleware or route handler
//     } catch (error) {
//         res.status(400).json({ message: "Invalid token." });
//     }
// };

// module.exports = auth;
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your secret or use environment variables

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Get token from Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Attach user information to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

module.exports = auth;
