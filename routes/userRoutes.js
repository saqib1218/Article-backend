const express = require('express');
const { signup,login,logout, getProtectedResource,sendMessage,getMessages,checkAuth,googleSignup,getNotification,getAllUsers,getFriends,removeFriend,getFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = require('../controllers/usercontroller');
const {upload, createArticle,getAllArticles}=require('../controllers/articleRoutes')
const validateSignup = require('../middelware/signupvalidator');
const auth = require('../middelware/auth');
const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.post('/google', googleSignup);
router.get('/protected', auth, getProtectedResource);
router.post('/logout', logout);
router.get('/check', checkAuth);
router.get('/users', auth, getAllUsers); // Get all users
router.post('/friend-request/send', auth, sendFriendRequest); // Send friend request
router.post('/friend-request/accept', auth, acceptFriendRequest); // Accept friend request
router.post('/friend-request/reject', auth, rejectFriendRequest); 
router.get('/friend-requests', auth, getFriendRequests); // Get incoming friend 
router.get('/friends', auth, getFriends); // Get friends
router.post('/friends/remove', auth, removeFriend); // Remove friend
router.get('/notifications', auth, getNotification);
router.post('/messages', auth, sendMessage);
router.get('/recievemessages', auth, getMessages);
router.post('/article', auth,  upload.single('image'),createArticle);
router.get('/get-articles', getAllArticles);
module.exports = router;
