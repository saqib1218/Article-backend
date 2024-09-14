const validateSignup = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Proceed to the next middleware or route handler
    next();
};

module.exports = validateSignup;
