const Router = require('express');
const router = new Router()
const userController = require('../controller/user.controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/registration', userController.registration);
router.post('/auth', userController.login);
router.post('/logout', userController.logout)

router.post('/resend-otp', userController.resendOtp);
router.post('/verify-email', userController.verifyEmail)
router.post('/check-email', userController.checkEmail)
router.post('/reset-password', userController.resetPassword)
router.get('/refresh', userController.refreshToken)

router.get('/user', authMiddleware, userController.getUser)

module.exports = router;