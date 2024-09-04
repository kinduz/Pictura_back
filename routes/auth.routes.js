const Router = require('express');
const router = new Router()
const authController = require('../controller/auth.controller');

router.post('/registration', authController.registration);
router.post('/login', authController.login);
router.post('/resend-otp', authController.resendOtp);
router.post('/verify-email', authController.verifyEmail)

module.exports = router;