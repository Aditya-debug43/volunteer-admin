const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(verifyToken, requireAdmin);

router.get('/volunteers', ctrl.volunteers);
router.get('/volunteers/csv', ctrl.volunteersCSV);
router.get('/volunteers/pdf', ctrl.volunteersPDF);
router.get('/city-summary', ctrl.citySummary);
router.get('/cause-impact', ctrl.causeImpact);
router.get('/saved', ctrl.saved);
router.post('/save', ctrl.save);

module.exports = router;
