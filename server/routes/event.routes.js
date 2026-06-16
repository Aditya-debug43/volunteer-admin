const router = require('express').Router();
const ctrl = require('../controllers/event.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);
router.post('/:id/register', ctrl.register);
router.delete('/:id/register', ctrl.cancelRegistration);
router.get('/:id/volunteers', requireAdmin, ctrl.eventVolunteers);
router.put('/:id/attendance', requireAdmin, ctrl.markAttendance);
router.post('/:id/remind', requireAdmin, ctrl.sendReminder);

module.exports = router;
