const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerLimiter, ctrl.register);
router.post('/login', loginLimiter, ctrl.login);
router.post('/logout', verifyToken, ctrl.logout);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/resend-verification', ctrl.resendVerification);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);
router.post('/refresh', ctrl.refresh);
router.get('/me', verifyToken, ctrl.me);
router.put('/change-password', verifyToken, ctrl.changePassword);

module.exports = router;
