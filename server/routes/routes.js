const router = require('express').Router()
const verifyToken = require('../middleware/verify_token.middleware')
const { sign_up, email_verification } = require('../controllers/sign_up.controller')
const { user_profile } = require('../controllers/user_profile.controller')
const upload = require("../middleware/upload")

router.post('/signup', sign_up)
router.post("/verify-otp", verifyToken, email_verification);
router.post("/user-profile", verifyToken, upload.single('profileImage'), user_profile)




module.exports = router;
