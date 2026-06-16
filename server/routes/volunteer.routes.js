const router = require('express').Router();
const ctrl = require('../controllers/volunteer.controller');
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth.middleware');
const { uploadPhoto } = require('../middleware/upload.middleware');

router.use(verifyToken);

router.get('/', requireAdmin, ctrl.list);
router.post('/bulk-approve', requireAdmin, ctrl.bulkApprove);
router.get('/:id', ctrl.getOne);                 // own or admin (checked in controller)
router.put('/:id', ctrl.update);                 // own or admin
router.put('/:id/status', requireAdmin, ctrl.changeStatus);
router.put('/:id/assign-coordinator', requireAdmin, ctrl.assignCoordinator);
router.put('/:id/notes', requireAdmin, ctrl.updateNotes);
router.put('/:id/photo', uploadPhoto.single('photo'), ctrl.updatePhoto);
router.get('/:id/activity', ctrl.activity);
router.post('/:id/generate-certificate', requireAdmin, ctrl.generateCertificate);
router.delete('/:id', requireSuperAdmin, ctrl.remove);

module.exports = router;
