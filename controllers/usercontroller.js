const User = require('../models/user');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your secret or use environment variables
const client = new OAuth2Client("424939610607-fmjogcka0ktdol6p18903hihfqq5n71p.apps.googleusercontent.com"); // Add
// Sign-up function
const signup = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        // Store token in cookies
        res.cookie('token', token, { httpOnly: true, secure: true }); // Use secure: true in production
        res.status(201).json({ message: 'User created successfully',token, user: { name: newUser.name, email: newUser.email ,id: newUser._id } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists!" });
        }
        res.status(400).json({ message: error.message });
    }
};
// Google Sign-Up function
 // Initialize the client with your Google Client ID
 const googleSignup = async (req, res) => {
    const { idToken } = req.body; // Get the ID token from the request body
    

    try {
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken, // The ID token received from the frontend
            audience: ["424939610607-fmjogcka0ktdol6p18903hihfqq5n71p.apps.googleusercontent.com"], // Your Google Client ID
        });

        const payload = ticket.getPayload(); // Get user information from the token
        const { email, name } = payload;

        // Check if user already exists in the database
        let user = await User.findOne({ email });
        if (!user) {
            // If user does not exist, create a new user without a password
            user = new User({ name, email });
            await user.save();
            
        }

        // Generate JWT token
        
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // Store token in cookies
        res.cookie('token', token, { httpOnly: true, secure: true }); // Use secure: true in production
        res.status(200).json({ message: 'User signed in successfully', token, user: { email: user.email, name: user.name,id: user._id  } });
    } catch (error) {
        console.error("Token verification error:", error); // Log the error for debugging
        res.status(400).json({ message: 'Invalid Google ID token' });
    }
};



// Login function
const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // Store token in cookies
        res.cookie('token', token, { httpOnly: true, secure: true }); // Use secure: true in production
        res.status(200).json({ message: "Login successful",token, user: { name: user.name, email: user.email,id: user._id  } });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const logout = (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: "Logged out successfully" });
};
const checkAuth = (req, res) => {
    const token = req.cookies.token; // Get the token from cookies
    console.log("Token received:", token); // Log the token for debugging
    if (!token) {
        return res.status(401).json({ authenticated: false });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification error:", err); // Log the error
            return res.status(401).json({ authenticated: false });
        }
        User.findById(decoded.id)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ authenticated: false });
                }
                res.json({ authenticated: true });
            })
            .catch(() => res.status(500).json({ message: "Server error" }));
    });
};

// const getAllUsers = async (req, res) => {
//     try {
//         const loggedInUserId = req.user.id; // Assuming you have middleware that sets req.user
//         const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password'); // Exclude password and the logged-in user
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// const getAllUsers = async (req, res) => {
//     try {
//         const loggedInUserId = req.user.id; // Get the logged-in user's ID
//         const loggedInUser = await User.findById(loggedInUserId);

//         // Extract the arrays of friend requests and friends
//         const friendRequests = loggedInUser.friendRequests || [];
//         const friends = loggedInUser.friends || [];

//         // Find users who are not the logged-in user, not in the friendRequests, and not in the friends list
//         const users = await User.find({
//             _id: { $ne: loggedInUserId }, // Exclude the logged-in user
//             _id: { $nin: [...friendRequests, ...friends] } // Exclude users in friendRequests and friends
//         }).select('-password'); // Exclude password from the response

//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };
// const getAllUsers = async (req, res) => {
//     try {
//         const loggedInUserId = req.user.id; // Get the logged-in user's ID
//         const loggedInUser = await User.findById(loggedInUserId);

//         // Extract the arrays of friend requests and friends
//         const friendRequests = loggedInUser.friendRequests || [];
//         const friends = loggedInUser.friends || [];

//         // Find users who are not the logged-in user, not in the friendRequests, not in the friends list,
//         // and not the users to whom the logged-in user has sent requests
//         const users = await User.find({
//             _id: { $ne: loggedInUserId }, // Exclude the logged-in user
//             _id: { $nin: [...friendRequests, ...friends, ...loggedInUser.friendRequests] } // Exclude users in friendRequests, friends, and sent requests
//         }).select('-password'); // Exclude password from the response

//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };
const getAllUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // Get the logged-in user's ID
        const loggedInUser = await User.findById(loggedInUserId);

        // Extract the arrays of friend requests, friends, and pending requests
        const friendRequests = loggedInUser.friendRequests || [];
        const friends = loggedInUser.friends || [];
        const pendingRequests = loggedInUser.pendingRequests || []; // Get pending requests

        // Find users who are not the logged-in user, not in the friendRequests, not in the friends list,
        // and not in the pending requests
        const users = await User.find({
            _id: { $ne: loggedInUserId }, // Exclude the logged-in user
            _id: { $nin: [...friendRequests, ...friends, ...pendingRequests] } // Exclude users in friendRequests, friends, and pending requests
        }).select('-password'); // Exclude password from the response

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const sendFriendRequest = async (req, res) => {
    const { recipientId } = req.body; // ID of the user to whom the request is sent
    const senderId = req.user.id; // Assuming you have middleware to set req.user

    try {
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the request is already pending
        if (recipient.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: "Friend request already sent." });
        }

        // Add sender to recipient's friend requests
        recipient.friendRequests.push(senderId);
        await recipient.save();

        // Add recipient to sender's pending requests
        const sender = await User.findById(senderId);
        sender.pendingRequests.push(recipientId);
        await sender.save();
        const notification = new Notification({
            sender: senderId,
            recipient: recipientId,
            type: "friendRequest",
            status: "pending",
          });
          await notification.save();
        res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
};

//     const { recipientId } = req.body; // ID of the user to whom the request is sent
//     const senderId = req.user.id; // Assuming you have middleware to set req.user

//     try {
//         const recipient = await User.findById(recipientId);
//         if (!recipient) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Add sender to recipient's friend requests
//         recipient.friendRequests.push(senderId);
//         await recipient.save();

//         res.status(200).json({ message: "Friend request sent" });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };
const acceptFriendRequest = async (req, res) => {
    const { senderId } = req.body; // ID of the user who sent the request
    const recipientId = req.user.id;

    try {
        const recipient = await User.findById(recipientId);
        if (!recipient || !recipient.friendRequests.includes(senderId)) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Remove sender from friend requests and add to friends
        recipient.friendRequests.pull(senderId);
        recipient.friends.push(senderId);
        await recipient.save();

        // Optionally, add recipient to sender's friends
        const sender = await User.findById(senderId);
        sender.friends.push(recipientId);
        await sender.save();
        const notification = new Notification({
            sender: recipientId,
            recipient: senderId,
            type: "friendRequestAccepted",
            status: "accepted",
          });
          await notification.save();
        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

//     const { senderId } = req.body; // ID of the user who sent the request
//     const recipientId = req.user.id;

//     try {
//         const recipient = await User.findById(recipientId);
//         if (!recipient || !recipient.friendRequests.includes(senderId)) {
//             return res.status(404).json({ message: "Request not found" });
//         }

//         // Remove sender from friend requests
//         recipient.friendRequests.pull(senderId);
//         await recipient.save();

//         res.status(200).json({ message: "Friend request rejected" });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };
const rejectFriendRequest = async (req, res) => {
    const { senderId } = req.body; // ID of the user who sent the request
    const recipientId = req.user.id;

    try {
        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        // Check if the recipient exists and if the request is in their friendRequests
        if (!recipient || !recipient.friendRequests.includes(senderId)) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Remove sender from recipient's friendRequests
        recipient.friendRequests.pull(senderId);
        await recipient.save();

        // Remove senderId from sender's pendingRequests array
        if (sender) {
            sender.pendingRequests.pull(recipientId);
            await sender.save();
        }
        const notification = new Notification({
            sender: recipientId,
            recipient: senderId,
            type: "friendRequestRejected",
            status: "rejected",
          });
          await notification.save();
        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests', 'name'); // Populate with user names
        res.status(200).json(user.friendRequests);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'name'); // Populate with user names
        res.status(200).json(user.friends);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const removeFriend = async (req, res) => {
    const { friendId } = req.body; // ID of the friend to remove
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        // Remove friend from user's friends array
        user.friends.pull(friendId);
        await user.save();

        // Optionally, remove user from friend's friends array
        friend.friends.pull(userId);
        await friend.save();

        // Remove friendId from user's pendingRequests array
        user.pendingRequests.pull(friendId);
        await user.save();

        // Optionally, remove userId from friend's pendingRequests array
        friend.pendingRequests.pull(userId);
        await friend.save();

        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Error removing friend:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// const removeFriend = async (req, res) => {
//     const { friendId } = req.body; // ID of the friend to remove
//     const userId = req.user.id;

//     try {
//         const user = await User.findById(userId);
//         const friend = await User.findById(friendId);

//         // Remove friend from user's friends array
//         user.friends.pull(friendId);
//         await user.save();

//         // Optionally, remove user from friend's friends array
//         friend.friends.pull(userId);
//         await friend.save();

//         res.status(200).json({ message: "Friend removed successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };


const getNotification = async (req, res) => {
    const { recipientId } = req.query;
  
    try {
      const notifications = await Notification.find({ recipient: recipientId })
        .populate('sender', 'name')
        .populate('recipient', 'name');
  
      if (notifications.length === 0) {
        return res.status(404).json({ message: 'No notifications found' });
      }
  
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
const sendMessage = async (req, res) => {
    const { friendId, message } = req.body;
    const userId = req.user.id;
  
    try {
      const newMessage = new Message({
        sender: userId,
        receiver: friendId,
        text: message,
      });
      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: 'Error sending message' });
    }
  };
 const getMessages = async (req, res) => {
    const { friendId } = req.query;
    const userId = req.user.id;
  
    try {
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId },
        ],
      }).populate('sender', 'name');
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching messages' });
    }
  };
const getProtectedResource = (req, res) => {
    res.status(200).json({ message: "You have access to this protected route", user: req.user });
};
module.exports = {
    signup,
    login,
    logout,
    getProtectedResource, // Export the new function
    checkAuth,
    googleSignup,
    getAllUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriends,
    removeFriend,
    getNotification,sendMessage,getMessages
};

// const checkAuth = (req, res) => {
//     const token = req.cookies.token; // Get the token from cookies
//     if (!token) {
//         return res.status(401).json({ authenticated: false });
//     }

//     // Verify the token
//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ authenticated: false });
//         }
//         // Optionally, you can fetch user details if needed
//         User.findById(decoded.id)
//             .then(user => {
//                 if (!user) {
//                     return res.status(401).json({ authenticated: false });
//                 }
//                 res.json({ authenticated: true });
//             })
//             .catch(() => res.status(500).json({ message: "Server error" }));
//     });
// };