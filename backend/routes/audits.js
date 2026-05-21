const express = require('express');
const router = express.Router();
const auditsController = require('../controllers/audits');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/questions', authenticate, auditsController.getQuestions);
router.get('/responses/:projectId', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary'), auditsController.getResponses);
router.post('/responses', authenticate, authorize('coordinator', 'council_member'), auditsController.submitResponses);
router.get('/report/:projectId', authenticate, auditsController.getAuditReport);

module.exports = router;
