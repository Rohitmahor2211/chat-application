const router = require('express').Router()
const rateLimit = require("express-rate-limit");
const verifyToken = require('../middleware/verify_token.middleware')
const { sign_up, email_verification } = require('../controllers/sign_up.controller')
const { user_profile } = require('../controllers/user_profile.controller')
const upload = require("../middleware/upload")
const { user_login, user_logout } = require('../controllers/user_login.controller')
const { dashboard, searchUsers } = require('../controllers/dashboard_data.controller')
const { create_chat, messagess, sendMessage, markMessagesSeen, reactToMessage, blockUser, unblockUser, deleteMessage } = require('../controllers/chat_room.controller')

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: { message: "Too many attempts from this IP, please try again after 15 minutes." }
});

router.post('/signup', authLimiter, sign_up)
router.post("/verify-otp", verifyToken, authLimiter, email_verification);
router.post("/user-profile", verifyToken, upload.single('profileImage'), user_profile)
router.post('/login', authLimiter, user_login)
router.get('/logout', verifyToken, user_logout)
router.get('/users', verifyToken, dashboard)
router.get('/search-users', verifyToken, searchUsers)
router.post('/chat', verifyToken, create_chat)
router.get('/messages/:chatId', verifyToken, messagess)
router.post('/message', verifyToken, upload.single('image'), sendMessage)
router.post('/messages/mark-seen', verifyToken, markMessagesSeen)
router.post('/messages/react', verifyToken, reactToMessage)
router.post('/block-user', verifyToken, blockUser)
router.post('/unblock-user', verifyToken, unblockUser)
router.delete('/message/:messageId', verifyToken, deleteMessage)

module.exports = router;
