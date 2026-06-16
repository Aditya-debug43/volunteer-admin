const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth.middleware');

router.use(verifyToken, requireAdmin);

router.get('/stats', ctrl.stats);
router.get('/pending', ctrl.pending);
router.get('/registrations-trend', ctrl.registrationsTrend);
router.post('/send-email', ctrl.sendBroadcast);
router.get('/logs', requireSuperAdmin, ctrl.logs);

module.exports = router;
